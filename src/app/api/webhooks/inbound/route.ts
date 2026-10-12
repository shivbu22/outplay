import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventBus } from "@/lib/events";

export async function GET() {
  return NextResponse.json({
    name: "AMS Inbound Reply Webhook",
    description:
      "Receives incoming prospect email replies, halts active sequences (STOPPED_REPLY), updates prospect status to REPLIED, and broadcasts real-time SSE alerts.",
    contract: {
      method: "POST",
      endpoint: "/api/webhooks/inbound",
      headers: { "Content-Type": "application/json" },
      body: {
        prospectEmail: "string (required)",
        subject: "string (optional)",
        body: "string (optional)",
        sentiment: "POSITIVE | OBJECTION | NEUTRAL | QUESTION (optional)",
      },
    },
    examplePayload: {
      prospectEmail: "sarah.jenkins@cloudscale.io",
      subject: "Re: Quick question regarding sales velocity",
      body: "Hi Alex, this looks interesting! Can you send over a demo link or availability for a 15-min call this Thursday?",
      sentiment: "POSITIVE",
    },
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      prospectEmail,
      subject = "Re: Cadence Outreach",
      body = "Thanks for reaching out, let's schedule a call.",
      sentiment = "POSITIVE",
    } = payload;

    if (!prospectEmail) {
      return NextResponse.json(
        { error: "Missing required parameter 'prospectEmail'" },
        { status: 400 }
      );
    }

    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not configured" }, { status: 404 });
    }

    // Find prospect by email
    const prospect = await db.prospect.findFirst({
      where: {
        tenantId: tenant.id,
        email: prospectEmail.trim().toLowerCase(),
      },
    });

    if (!prospect) {
      return NextResponse.json(
        {
          error: `Prospect with email '${prospectEmail}' not found in current tenant.`,
        },
        { status: 404 }
      );
    }

    // 1. Update prospect status to REPLIED
    const updatedProspect = await db.prospect.update({
      where: { id: prospect.id },
      data: { status: "REPLIED" },
    });

    // 2. Halt all active sequence enrollments for this prospect (Auto-Pause)
    const stoppedEnrollments = await db.sequenceEnrollment.updateMany({
      where: {
        prospectId: prospect.id,
        status: { in: ["IN_PROGRESS", "PENDING"] },
      },
      data: {
        status: "STOPPED_REPLY",
        completedAt: new Date(),
      },
    });

    // 3. Log EMAIL_REPLIED Activity Event
    const activity = await db.activityEvent.create({
      data: {
        tenantId: tenant.id,
        prospectId: prospect.id,
        type: "EMAIL_REPLIED",
        metadata: JSON.stringify({
          subject,
          bodySnippet: body.slice(0, 200),
          sentiment,
          autoPausedCount: stoppedEnrollments.count,
        }),
      },
      include: {
        prospect: true,
      },
    });

    // 4. Broadcast real-time SSE events across the platform
    eventBus.broadcast(
      "PROSPECT_REPLIED",
      {
        prospect: updatedProspect,
        subject,
        body,
        sentiment,
        autoPausedCount: stoppedEnrollments.count,
      },
      tenant.id
    );

    eventBus.broadcast("ACTIVITY_CREATED", activity, tenant.id);
    eventBus.broadcast(
      "METRIC_UPDATE",
      { replyIncrement: 1, stoppedCount: stoppedEnrollments.count },
      tenant.id
    );

    return NextResponse.json(
      {
        success: true,
        message: `Reply recorded for ${prospect.firstName} ${prospect.lastName}. Sequence auto-paused.`,
        prospect: updatedProspect,
        stoppedEnrollmentsCount: stoppedEnrollments.count,
        activity,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Inbound webhook failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
