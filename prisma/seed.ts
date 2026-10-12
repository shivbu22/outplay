import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting AMS database seeding...");

  // 1. Clean existing records
  await prisma.activityEvent.deleteMany();
  await prisma.task.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.sequenceEnrollment.deleteMany();
  await prisma.sequenceStep.deleteMany();
  await prisma.sequence.deleteMany();
  await prisma.prospect.deleteMany();
  await prisma.account.deleteMany();
  await prisma.mailbox.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // 2. Create Tenant (White-labelable workspace)
  const tenant = await prisma.tenant.create({
    data: {
      name: "AMS Outbound Acceleration",
      subdomain: "ams",
      customDomain: "app.ams-sales.io",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80",
      brandColor: "#6366F1",
      isWhiteLabeled: false,
      planTier: "GROWTH",
    },
  });

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "alex.mercer@ams-sales.io",
      firstName: "Alex",
      lastName: "Mercer",
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&q=80",
      phone: "+1 (415) 890-1234",
    },
  });

  const repUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "sarah.jenkins@ams-sales.io",
      firstName: "Sarah",
      lastName: "Jenkins",
      role: "REP",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&q=80",
      phone: "+1 (415) 890-5678",
    },
  });

  // 4. Create Sending Mailboxes (Rotation pool)
  await prisma.mailbox.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: adminUser.id,
        email: "alex@ams-growth.co",
        senderName: "Alex Mercer",
        provider: "GOOGLE",
        dailyLimit: 50,
        sentToday: 18,
        healthScore: 99,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        userId: repUser.id,
        email: "sarah.j@ams-outreach.io",
        senderName: "Sarah Jenkins",
        provider: "OUTLOOK",
        dailyLimit: 45,
        sentToday: 12,
        healthScore: 96,
        isActive: true,
      },
    ],
  });

  // 5. Create Target B2B Accounts
  const accountFigma = await prisma.account.create({
    data: {
      tenantId: tenant.id,
      name: "Figma",
      domain: "figma.com",
      industry: "Design & Collaboration",
      employeeCount: 1500,
      city: "San Francisco",
      country: "USA",
    },
  });

  const accountSupabase = await prisma.account.create({
    data: {
      tenantId: tenant.id,
      name: "Supabase",
      domain: "supabase.com",
      industry: "Cloud Database",
      employeeCount: 250,
      city: "Singapore",
      country: "Singapore",
    },
  });

  const accountDatadog = await prisma.account.create({
    data: {
      tenantId: tenant.id,
      name: "Datadog",
      domain: "datadoghq.com",
      industry: "Observability & Security",
      employeeCount: 5000,
      city: "New York",
      country: "USA",
    },
  });

  // 6. Create Prospects
  const prospectsData = [
    {
      tenantId: tenant.id,
      assignedRepId: repUser.id,
      accountId: accountFigma.id,
      email: "dylan.field@figma.com",
      firstName: "Dylan",
      lastName: "Field",
      title: "Co-Founder & CEO",
      companyName: "Figma",
      phone: "+1 (415) 555-0199",
      timezone: "America/Los_Angeles",
      status: "ACTIVE" as const,
      tags: "Enterprise, Priority, Tech",
    },
    {
      tenantId: tenant.id,
      assignedRepId: repUser.id,
      accountId: accountSupabase.id,
      email: "paul.copplestone@supabase.com",
      firstName: "Paul",
      lastName: "Copplestone",
      title: "Founder & CEO",
      companyName: "Supabase",
      phone: "+1 (415) 555-0182",
      timezone: "America/New_York",
      status: "MEETING_BOOKED" as const,
      tags: "Series B, High Intent",
    },
    {
      tenantId: tenant.id,
      assignedRepId: adminUser.id,
      accountId: accountDatadog.id,
      email: "olivier.pomel@datadoghq.com",
      firstName: "Olivier",
      lastName: "Pomel",
      title: "Chief Executive Officer",
      companyName: "Datadog",
      phone: "+1 (212) 555-0144",
      timezone: "America/New_York",
      status: "REPLIED" as const,
      tags: "Enterprise, Q4 Target",
    },
    {
      tenantId: tenant.id,
      assignedRepId: repUser.id,
      accountId: accountFigma.id,
      email: "yuhki.yamashita@figma.com",
      firstName: "Yuhki",
      lastName: "Yamashita",
      title: "VP of Product",
      companyName: "Figma",
      phone: "+1 (415) 555-0123",
      timezone: "America/Los_Angeles",
      status: "ACTIVE" as const,
      tags: "Product Decision Maker",
    },
    {
      tenantId: tenant.id,
      assignedRepId: repUser.id,
      email: "elena.rostova@nexusgroup.io",
      firstName: "Elena",
      lastName: "Rostova",
      title: "Director of Revenue Operations",
      companyName: "Nexus Group",
      phone: "+1 (312) 555-0191",
      timezone: "America/Chicago",
      status: "ACTIVE" as const,
      tags: "RevOps, High Intent",
    },
  ];

  const createdProspects = [];
  for (const p of prospectsData) {
    const created = await prisma.prospect.create({ data: p });
    createdProspects.push(created);
  }

  // 7. Create Sequence (Cadence)
  const sequence = await prisma.sequence.create({
    data: {
      tenantId: tenant.id,
      createdById: adminUser.id,
      name: "AMS Q4 High-Value Pipeline Engine",
      description: "Proven 5-touch multi-channel outbound cadence combining AI email, WebRTC phone dialer, and social outreach.",
      isActive: true,
      scheduleTimezone: "America/New_York",
      throttleDailyLimit: 60,
      enableMailboxRotation: true,
      stopOnReply: true,
    },
  });

  // 8. Create Sequence Steps
  const step1 = await prisma.sequenceStep.create({
    data: {
      sequenceId: sequence.id,
      stepOrder: 1,
      channel: "EMAIL",
      waitDays: 1,
      subjectTemplate: "Quick question on {{companyName}}'s outbound velocity",
      bodyTemplate:
        "Hi {{firstName}},\n\nI noticed how rapidly {{companyName}} is scaling your sales team this quarter. Most revenue leaders we speak with struggle with reps spending 60% of their day manually logging CRM updates and context-switching across dialers.\n\nWith AMS, reps 3x their pipeline without adding headcount. Would you be open to a 10-minute preview this Thursday?\n\nBest,\nAlex",
    },
  });

  const step2 = await prisma.sequenceStep.create({
    data: {
      sequenceId: sequence.id,
      stepOrder: 2,
      channel: "CALL",
      waitDays: 2,
      taskInstruction: "Click-to-dial via AMS WebRTC softphone. If voicemail beep is heard, use 1-click voicemail drop #2.",
    },
  });

  const step3 = await prisma.sequenceStep.create({
    data: {
      sequenceId: sequence.id,
      stepOrder: 3,
      channel: "LINKEDIN",
      waitDays: 2,
      taskInstruction: "Connect on LinkedIn with note referencing email from Day 1 and recent company milestones.",
    },
  });

  const step4 = await prisma.sequenceStep.create({
    data: {
      sequenceId: sequence.id,
      stepOrder: 4,
      channel: "EMAIL",
      waitDays: 3,
      subjectTemplate: "Re: Quick question on {{companyName}}'s outbound velocity",
      bodyTemplate:
        "Hi {{firstName}},\n\nFollowing up on my previous note. We recently helped another growth team automate account research and power-dialing, which drove a 42% lift in booked discovery calls within 30 days.\n\nHere is a 90-second interactive walkthrough: ams-sales.io/demo\n\nCheers,\nAlex",
    },
  });

  const step5 = await prisma.sequenceStep.create({
    data: {
      sequenceId: sequence.id,
      stepOrder: 5,
      channel: "CALL",
      waitDays: 2,
      taskInstruction: "Final cadence call touch. Ask for referral if target is not the right decision maker.",
    },
  });

  // 9. Enroll Prospects in Sequence
  for (const prospect of createdProspects) {
    await prisma.sequenceEnrollment.create({
      data: {
        sequenceId: sequence.id,
        prospectId: prospect.id,
        currentStepOrder: prospect.status === "ACTIVE" ? 1 : 2,
        status: prospect.status === "MEETING_BOOKED" ? "COMPLETED" : "IN_PROGRESS",
        nextExecutionAt: new Date(Date.now() + 3600 * 1000 * 4), // 4 hours from now
      },
    });
  }

  // 10. Create Call Logs
  await prisma.callLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        prospectId: createdProspects[1].id,
        repId: repUser.id,
        durationSeconds: 245,
        disposition: "MEETING_BOOKED",
        notes: "Discussed multi-channel sequence features. Paul agreed to discovery call on Friday at 2 PM PT.",
      },
      {
        tenantId: tenant.id,
        prospectId: createdProspects[2].id,
        repId: adminUser.id,
        durationSeconds: 45,
        disposition: "LEFT_VOICEMAIL",
        notes: "Dropped automated voicemail regarding API integration support.",
      },
    ],
  });

  // 11. Create Pending Daily Tasks for Sales Rep
  await prisma.task.createMany({
    data: [
      {
        tenantId: tenant.id,
        prospectId: createdProspects[0].id,
        assignedRepId: repUser.id,
        sequenceStepId: step2.id,
        channel: "CALL",
        status: "DUE",
        dueAt: new Date(),
        notes: "Call Dylan Field on mobile (+1 415 555-0199)",
      },
      {
        tenantId: tenant.id,
        prospectId: createdProspects[4].id,
        assignedRepId: repUser.id,
        sequenceStepId: step3.id,
        channel: "LINKEDIN",
        status: "DUE",
        dueAt: new Date(),
        notes: "Send LinkedIn connection with personalized message",
      },
    ],
  });

  // 12. Create Activity Telemetry Events
  await prisma.activityEvent.createMany({
    data: [
      {
        tenantId: tenant.id,
        prospectId: createdProspects[0].id,
        type: "EMAIL_SENT",
        metadata: JSON.stringify({ subject: "Quick question on Figma's outbound velocity" }),
      },
      {
        tenantId: tenant.id,
        prospectId: createdProspects[0].id,
        type: "EMAIL_OPENED",
        metadata: JSON.stringify({ device: "Mac OS / Chrome", location: "San Francisco, CA" }),
      },
      {
        tenantId: tenant.id,
        prospectId: createdProspects[1].id,
        type: "MEETING_BOOKED",
        metadata: JSON.stringify({ meetingTime: "Friday 2:00 PM PT", rep: "Sarah Jenkins" }),
      },
      {
        tenantId: tenant.id,
        prospectId: createdProspects[2].id,
        type: "EMAIL_REPLIED",
        metadata: JSON.stringify({ replySnippet: "Thanks for reaching out, loop in our sales ops director." }),
      },
    ],
  });

  console.log("✅ Seeding completed successfully! 1 Tenant, 2 Reps, 5 Prospects, 1 Sequence (5 Steps), Tasks & Call logs created.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
