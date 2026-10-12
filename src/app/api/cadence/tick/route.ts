import { NextResponse } from "next/server";
import { runCadenceTick } from "@/lib/cadence-engine";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const activeEnrollments = await db.sequenceEnrollment.count({
      where: { status: "IN_PROGRESS" },
    });

    const pendingCallTasks = await db.task.count({
      where: {
        tenantId: tenant.id,
        channel: "CALL",
        status: "DUE",
      },
    });

    const recentEvents = await db.activityEvent.findMany({
      where: { tenantId: tenant.id },
      include: { prospect: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      activeEnrollments,
      pendingCallTasks,
      recentEvents,
    });
  } catch (error: any) {
    console.error("Failed to fetch cadence tick status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let maxBatch = 3;
    try {
      const body = await request.json();
      if (body.maxBatch && typeof body.maxBatch === "number") {
        maxBatch = body.maxBatch;
      }
    } catch {
      // Body may be empty on simple POST
    }

    const result = await runCadenceTick(maxBatch);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Failed to execute cadence tick:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
