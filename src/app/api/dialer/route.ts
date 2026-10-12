import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET dialer queue and recent call logs
export async function GET() {
  try {
    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ tasks: [], callLogs: [] });
    }

    // Pending call tasks
    const tasks = await db.task.findMany({
      where: {
        tenantId: tenant.id,
        channel: "CALL",
        status: "DUE",
      },
      include: {
        prospect: true,
        assignedRep: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { dueAt: "asc" },
    });

    // Recent calls
    const callLogs = await db.callLog.findMany({
      where: { tenantId: tenant.id },
      include: {
        prospect: true,
        rep: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, tasks, callLogs });
  } catch (error) {
    console.error("Failed to fetch dialer queue:", error);
    return NextResponse.json({ error: "Failed to fetch dialer data" }, { status: 500 });
  }
}

// POST log a call with disposition
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prospectId, durationSeconds, disposition, notes } = body;

    const tenant = await db.tenant.findFirst();
    const rep = await db.user.findFirst();

    if (!tenant || !rep) {
      return NextResponse.json({ error: "Tenant or Rep not found" }, { status: 400 });
    }

    const log = await db.callLog.create({
      data: {
        tenantId: tenant.id,
        prospectId,
        repId: rep.id,
        durationSeconds: durationSeconds || 0,
        disposition: disposition || "LEFT_VOICEMAIL",
        notes: notes || null,
      },
      include: {
        prospect: true,
      },
    });

    // If meeting was booked, update prospect status
    if (disposition === "MEETING_BOOKED") {
      await db.prospect.update({
        where: { id: prospectId },
        data: { status: "MEETING_BOOKED" },
      });

      await db.activityEvent.create({
        data: {
          tenantId: tenant.id,
          prospectId,
          type: "MEETING_BOOKED",
          metadata: JSON.stringify({ notes }),
        },
      });
    }

    // Mark corresponding task as COMPLETED if it was in queue
    await db.task.updateMany({
      where: {
        prospectId,
        channel: "CALL",
        status: "DUE",
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, callLog: log }, { status: 201 });
  } catch (error) {
    console.error("Failed to log call:", error);
    return NextResponse.json({ error: "Failed to log call" }, { status: 500 });
  }
}
