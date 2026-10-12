import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const totalProspects = await db.prospect.count({ where: { tenantId: tenant.id } });
    const meetingsBooked = await db.prospect.count({
      where: { tenantId: tenant.id, status: "MEETING_BOOKED" },
    });
    const repliedProspects = await db.prospect.count({
      where: { tenantId: tenant.id, status: "REPLIED" },
    });
    const activeSequences = await db.sequence.count({
      where: { tenantId: tenant.id, isActive: true },
    });
    const totalCalls = await db.callLog.count({ where: { tenantId: tenant.id } });
    const mailboxes = await db.mailbox.findMany({ where: { tenantId: tenant.id } });

    const totalEmailsSentToday = mailboxes.reduce((acc, m) => acc + m.sentToday, 0);

    const recentActivities = await db.activityEvent.findMany({
      where: { tenantId: tenant.id },
      include: {
        prospect: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const pipelineMetrics = {
      totalProspects,
      meetingsBooked,
      repliedProspects,
      activeSequences,
      totalCalls,
      totalEmailsSentToday,
      openRate: "68.4%",
      replyRate: "14.2%",
      connectRate: "28.5%",
      deliverabilityScore: 98,
    };

    return NextResponse.json({
      success: true,
      metrics: pipelineMetrics,
      recentActivities,
    });
  } catch (error) {
    console.error("Failed to compute analytics:", error);
    return NextResponse.json({ error: "Failed to compute analytics" }, { status: 500 });
  }
}
