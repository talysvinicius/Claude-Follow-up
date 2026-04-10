from pydantic import BaseModel
from datetime import datetime
from app.models.cadence import StepType, EnrollmentStatus, StepExecutionStatus


class CadenceStepCreate(BaseModel):
    order: int
    step_type: StepType
    delay_days: int = 0
    subject: str | None = None
    body: str | None = None
    template_data: dict | None = None


class CadenceStepOut(CadenceStepCreate):
    id: int
    cadence_id: int
    model_config = {"from_attributes": True}


class CadenceCreate(BaseModel):
    name: str
    description: str | None = None
    steps: list[CadenceStepCreate] = []


class CadenceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None
    steps: list[CadenceStepCreate] | None = None


class CadenceOut(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    is_active: bool
    steps: list[CadenceStepOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EnrollLeadsRequest(BaseModel):
    lead_ids: list[int]


class EnrollmentOut(BaseModel):
    id: int
    cadence_id: int
    lead_id: int
    status: EnrollmentStatus
    current_step: int
    enrolled_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class StepExecutionOut(BaseModel):
    id: int
    enrollment_id: int
    step_id: int
    status: StepExecutionStatus
    scheduled_at: datetime | None
    executed_at: datetime | None

    model_config = {"from_attributes": True}
