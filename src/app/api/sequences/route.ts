import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ sequences: [] });
    }

    const sequences = await db.sequence.findMany({
      where: { tenantId: tenant.id },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
        steps: {
          orderBy: { stepOrder: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, sequences });
  } catch (error) {
    console.error("Failed to fetch sequences:", error);
    return NextResponse.json({ error: "Failed to fetch sequences" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, scheduleTimezone, throttleDailyLimit } = body;

    const tenant = await db.tenant.findFirst();
    const admin = await db.user.findFirst();

    if (!tenant || !admin) {
      return NextResponse.json({ error: "Tenant or user not initialized" }, { status: 400 });
    }

    const sequence = await db.sequence.create({
      data: {
        tenantId: tenant.id,
        createdById: admin.id,
        name,
        description: description || null,
        scheduleTimezone: scheduleTimezone || "America/New_York",
        throttleDailyLimit: throttleDailyLimit || 50,
        enableMailboxRotation: true,
        stopOnReply: true,
        steps: {
          create: [
            {
              stepOrder: 1,
              channel: "EMAIL",
              waitDays: 1,
              subjectTemplate: "Introduction to {{companyName}}",
              bodyTemplate: "Hi {{firstName}},\n\nWanted to reach out and connect.\n\nBest,\nTeam",
            },
            {
              stepOrder: 2,
              channel: "CALL",
              waitDays: 2,
              taskInstruction: "Softphone discovery call.",
            },
          ],
        },
      },
      include: {
        steps: true,
      },
    });

    return NextResponse.json({ success: true, sequence }, { status: 201 });
  } catch (error) {
    console.error("Failed to create sequence:", error);
    return NextResponse.json({ error: "Failed to create sequence" }, { status: 500 });
  }
}
