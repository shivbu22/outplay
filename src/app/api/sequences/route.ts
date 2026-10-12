import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventBus } from "@/lib/events";

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
    const tenant = await db.tenant.findFirst();
    const admin = await db.user.findFirst();

    if (!tenant || !admin) {
      return NextResponse.json({ error: "Tenant or user not initialized" }, { status: 400 });
    }

    // Handle Bulk Enrollment into a Sequence
    if (body.action === "ENROLL") {
      const { sequenceId, prospectIds } = body;
      if (!sequenceId || !Array.isArray(prospectIds) || prospectIds.length === 0) {
        return NextResponse.json(
          { error: "sequenceId and prospectIds array required for enrollment" },
          { status: 400 }
        );
      }

      for (const pId of prospectIds) {
        await db.sequenceEnrollment.upsert({
          where: {
            sequenceId_prospectId: {
              sequenceId,
              prospectId: pId,
            },
          },
          update: {
            status: "IN_PROGRESS",
            currentStepOrder: 1,
            updatedAt: new Date(),
          },
          create: {
            sequenceId,
            prospectId: pId,
            status: "IN_PROGRESS",
            currentStepOrder: 1,
          },
        });

        await db.prospect.update({
          where: { id: pId },
          data: { status: "ACTIVE" },
        });

        const act = await db.activityEvent.create({
          data: {
            tenantId: tenant.id,
            prospectId: pId,
            type: "EMAIL_SENT",
            metadata: JSON.stringify({ action: "ENROLLED_IN_CADENCE", sequenceId }),
          },
          include: { prospect: true },
        });

        eventBus.broadcast("ACTIVITY_CREATED", act, tenant.id);
      }

      eventBus.broadcast(
        "METRIC_UPDATE",
        { enrolledCount: prospectIds.length },
        tenant.id
      );

      return NextResponse.json({
        success: true,
        enrolledCount: prospectIds.length,
      });
    }

    const { name, description, scheduleTimezone, throttleDailyLimit } = body;

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
