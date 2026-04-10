import asyncio
import logging
from datetime import datetime, timezone, timedelta
from app.tasks.worker import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.cadence_tasks.process_pending_steps")
def process_pending_steps():
    asyncio.run(_process_pending_steps())


async def _process_pending_steps():
    from app.core.database import AsyncSessionLocal
    from sqlalchemy import select
    from app.models.cadence import CadenceEnrollment, CadenceStep, StepExecution, EnrollmentStatus, StepExecutionStatus
    from app.models.lead import Lead
    from app.services.sendgrid import sendgrid_service
    from app.models.cadence import StepType

    async with AsyncSessionLocal() as db:
        enrollments_result = await db.execute(
            select(CadenceEnrollment).where(CadenceEnrollment.status == EnrollmentStatus.active)
        )
        enrollments = enrollments_result.scalars().all()

        for enrollment in enrollments:
            steps_result = await db.execute(
                select(CadenceStep)
                .where(CadenceStep.cadence_id == enrollment.cadence_id)
                .order_by(CadenceStep.order)
            )
            steps = steps_result.scalars().all()
            if not steps or enrollment.current_step >= len(steps):
                enrollment.status = EnrollmentStatus.completed
                continue

            step = steps[enrollment.current_step]
            scheduled_time = enrollment.enrolled_at + timedelta(days=step.delay_days)

            if datetime.now(timezone.utc) < scheduled_time:
                continue

            existing = await db.execute(
                select(StepExecution).where(
                    StepExecution.enrollment_id == enrollment.id,
                    StepExecution.step_id == step.id,
                )
            )
            if existing.scalar_one_or_none():
                enrollment.current_step += 1
                continue

            lead_result = await db.execute(select(Lead).where(Lead.id == enrollment.lead_id))
            lead = lead_result.scalar_one_or_none()
            if not lead:
                enrollment.status = EnrollmentStatus.completed
                continue

            execution = StepExecution(
                enrollment_id=enrollment.id,
                step_id=step.id,
                scheduled_at=scheduled_time,
                executed_at=datetime.now(timezone.utc),
            )

            if step.step_type == StepType.email and step.subject and step.body:
                result = await sendgrid_service.send_cadence_step_email(
                    to_email=lead.email,
                    to_name=f"{lead.first_name} {lead.last_name}",
                    subject=step.subject,
                    body=step.body,
                )
                execution.status = StepExecutionStatus.sent if result.get("status") == "sent" else StepExecutionStatus.skipped
                execution.sendgrid_message_id = result.get("message_id")
            else:
                execution.status = StepExecutionStatus.pending

            db.add(execution)
            enrollment.current_step += 1

        await db.commit()
        logger.info("Cadence step processing complete")
