from celery import Celery
from app.core.config import settings

celery_app = Celery("followup", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    beat_schedule={
        "process-cadence-steps-every-hour": {
            "task": "app.tasks.cadence_tasks.process_pending_steps",
            "schedule": 3600.0,
        },
    },
)
