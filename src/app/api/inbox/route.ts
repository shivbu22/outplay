import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventBus } from "@/lib/events";

export async function GET() {
  try {
    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ threads: [] });
    }

    // Find replied prospects or prospects with recent replies
    const repliedProspects = await db.prospect.findMany({
      where: {
        tenantId: tenant.id,
        status: { in: ["REPLIED", "ACTIVE", "MEETING_BOOKED"] },
      },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        enrollments: {
          include: {
            sequence: {
              include: {
                steps: {
                  orderBy: { stepOrder: "asc" },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const threads = repliedProspects.map((p) => {
      const replyActivity = p.activities.find((a) => a.type === "EMAIL_REPLIED");
      const activeEnrollment = p.enrollments[0];
      const sequence = activeEnrollment?.sequence;

      let meta: any = {};
      try {
        if (replyActivity?.metadata) {
          meta = JSON.parse(replyActivity.metadata);
        }
      } catch {
        // safe ignore
      }

      const subject =
        meta.subject ||
        `Re: Quick question regarding ${p.companyName || "outbound"} sales deliverability`;
      const snippet =
        meta.bodySnippet ||
        (p.status === "REPLIED"
          ? "Hi Alex, interesting timing. We are looking into this. Can you send over a deck?"
          : "Touching base regarding outbound execution.");
      const sentiment = meta.sentiment || (p.status === "REPLIED" ? "INTERESTED" : "NEUTRAL");

      const messages = [
        {
          id: "m-1",
          sender: "Alex Mercer",
          isOutbound: true,
          time: "Yesterday 9:15 AM",
          body: `Hi ${p.firstName},\n\nI noticed ${p.companyName || "your team"} is scaling sales engagement. Most revenue leaders we speak with struggle with cold emails landing in spam and reps burning hours switching between dialers and CRMs.\n\nAMS solves this with automated mailbox rotation and a native WebRTC power dialer directly inside the cadence.\n\nWorth a brief 10-minute sync this Thursday?\n\nBest,\nAlex Mercer`,
        },
      ];

      if (replyActivity || p.status === "REPLIED") {
        messages.push({
          id: "m-2",
          sender: `${p.firstName} ${p.lastName}`,
          isOutbound: false,
          time: "Today 10:24 AM",
          body:
            meta.bodySnippet ||
            "Hi Alex, interesting timing. We are looking into this right now as our current setup has deliverability drop-offs. Can you send over a demo link or deck before we chat?",
        });
      }

      return {
        id: `th-${p.id}`,
        prospectId: p.id,
        prospectName: `${p.firstName} ${p.lastName}`,
        company: p.companyName || "Enterprise Target",
        email: p.email,
        subject,
        snippet,
        sentiment,
        unread: p.status === "REPLIED",
        time: replyActivity ? "Just now" : "Yesterday",
        cadence: sequence ? sequence.name : "AMS Q4 High-Value Pipeline Engine",
        step: "Step 1 (Email)",
        isAutoPaused: true,
        messages,
      };
    });

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch (error: any) {
    console.error("Failed to fetch inbox threads:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prospectId, replyText } = body;

    if (!prospectId || !replyText) {
      return NextResponse.json(
        { error: "prospectId and replyText are required" },
        { status: 400 }
      );
    }

    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    // Increment active mailbox sent count
    const mailbox = await db.mailbox.findFirst({
      where: { tenantId: tenant.id, isActive: true },
    });
    if (mailbox) {
      await db.mailbox.update({
        where: { id: mailbox.id },
        data: { sentToday: { increment: 1 } },
      });
    }

    // Create activity event
    const activity = await db.activityEvent.create({
      data: {
        tenantId: tenant.id,
        prospectId,
        type: "EMAIL_SENT",
        metadata: JSON.stringify({
          subject: `Re: Follow up with ${prospect.firstName}`,
          bodySnippet: replyText.slice(0, 200),
          manualReply: true,
        }),
      },
      include: { prospect: true },
    });

    // Broadcast realtime event
    eventBus.broadcast("EMAIL_SENT", activity, tenant.id);
    eventBus.broadcast("ACTIVITY_CREATED", activity, tenant.id);

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error: any) {
    console.error("Failed to send inbox reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
