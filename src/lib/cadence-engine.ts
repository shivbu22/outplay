import { db } from "@/lib/db";
import { eventBus } from "@/lib/events";

export interface TickResult {
  executed: number;
  advanced: number;
  completed: number;
  tasksCreated: number;
  emailsSent: number;
  details: Array<{
    enrollmentId: string;
    prospectName: string;
    sequenceName: string;
    channel: string;
    stepOrder: number;
    action: string;
  }>;
}

export async function runCadenceTick(maxBatch = 3): Promise<TickResult> {
  const result: TickResult = {
    executed: 0,
    advanced: 0,
    completed: 0,
    tasksCreated: 0,
    emailsSent: 0,
    details: [],
  };

  const tenant = await db.tenant.findFirst();
  if (!tenant) return result;

  // Find active enrollments
  const enrollments = await db.sequenceEnrollment.findMany({
    where: {
      status: "IN_PROGRESS",
    },
    include: {
      prospect: true,
      sequence: {
        include: {
          steps: {
            orderBy: { stepOrder: "asc" },
          },
        },
      },
    },
    take: maxBatch,
  });

  for (const enrollment of enrollments) {
    const { sequence, prospect, currentStepOrder } = enrollment;
    const currentStep = sequence.steps.find((s) => s.stepOrder === currentStepOrder);

    if (!currentStep) continue;

    result.executed++;
    const prospectName = `${prospect.firstName} ${prospect.lastName}`;

    if (currentStep.channel === "EMAIL") {
      // Find active mailbox for tenant
      const mailbox = await db.mailbox.findFirst({
        where: { tenantId: tenant.id, isActive: true },
      });

      if (mailbox) {
        await db.mailbox.update({
          where: { id: mailbox.id },
          data: { sentToday: { increment: 1 } },
        });
      }

      // Log EMAIL_SENT activity
      const activity = await db.activityEvent.create({
        data: {
          tenantId: tenant.id,
          prospectId: prospect.id,
          type: "EMAIL_SENT",
          metadata: JSON.stringify({
            subject: currentStep.subjectTemplate || "Quick question regarding sales velocity",
            stepOrder: currentStep.stepOrder,
            sequenceId: sequence.id,
            mailbox: mailbox?.email || "alex@ams-outreach.com",
          }),
        },
        include: { prospect: true },
      });

      result.emailsSent++;
      eventBus.broadcast("EMAIL_SENT", activity, tenant.id);
      eventBus.broadcast("ACTIVITY_CREATED", activity, tenant.id);

      result.details.push({
        enrollmentId: enrollment.id,
        prospectName,
        sequenceName: sequence.name,
        channel: "EMAIL",
        stepOrder: currentStepOrder,
        action: `Sent automated email via ${mailbox?.email || "default"}`,
      });
    } else if (currentStep.channel === "CALL") {
      // Check if open task exists
      const existingTask = await db.task.findFirst({
        where: {
          prospectId: prospect.id,
          channel: "CALL",
          status: "DUE",
        },
      });

      if (!existingTask) {
        const assignedRep = await db.user.findFirst({ where: { tenantId: tenant.id } });
        if (assignedRep) {
          const task = await db.task.create({
            data: {
              tenantId: tenant.id,
              prospectId: prospect.id,
              assignedRepId: assignedRep.id,
              sequenceStepId: currentStep.id,
              channel: "CALL",
              status: "DUE",
              dueAt: new Date(),
              notes:
                currentStep.taskInstruction ||
                `Cadence Step #${currentStep.stepOrder}: Connect with ${prospectName}`,
            },
            include: { prospect: true },
          });

          result.tasksCreated++;
          eventBus.broadcast(
            "ACTIVITY_CREATED",
            {
              type: "CALL_SCHEDULED",
              prospect,
              task,
            },
            tenant.id
          );

          result.details.push({
            enrollmentId: enrollment.id,
            prospectName,
            sequenceName: sequence.name,
            channel: "CALL",
            stepOrder: currentStepOrder,
            action: "Queued dialer task for sales rep",
          });
        }
      }
    } else if (currentStep.channel === "LINKEDIN") {
      const activity = await db.activityEvent.create({
        data: {
          tenantId: tenant.id,
          prospectId: prospect.id,
          type: "LINKEDIN_TOUCH",
          metadata: JSON.stringify({
            stepOrder: currentStep.stepOrder,
            action: "Sent personalized connection note",
          }),
        },
        include: { prospect: true },
      });

      eventBus.broadcast("ACTIVITY_CREATED", activity, tenant.id);

      result.details.push({
        enrollmentId: enrollment.id,
        prospectName,
        sequenceName: sequence.name,
        channel: "LINKEDIN",
        stepOrder: currentStepOrder,
        action: "Sent personalized connection note",
      });
    }

    // Advance to next step or complete sequence
    const nextStep = sequence.steps.find((s) => s.stepOrder > currentStepOrder);
    if (nextStep) {
      await db.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStepOrder: nextStep.stepOrder,
          nextExecutionAt: new Date(Date.now() + nextStep.waitDays * 86400000),
          updatedAt: new Date(),
        },
      });
      result.advanced++;
      eventBus.broadcast(
        "CADENCE_STEP_ADVANCED",
        {
          enrollmentId: enrollment.id,
          prospectId: prospect.id,
          fromStep: currentStepOrder,
          toStep: nextStep.stepOrder,
          nextChannel: nextStep.channel,
        },
        tenant.id
      );
    } else {
      await db.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      result.completed++;
    }
  }

  // Broadcast metric update to refresh KPIs
  eventBus.broadcast(
    "METRIC_UPDATE",
    { tick: true, timestamp: new Date().toISOString() },
    tenant.id
  );

  return result;
}
