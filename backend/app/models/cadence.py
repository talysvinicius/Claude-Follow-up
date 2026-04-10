from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum as SAEnum, Text, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.core.database import Base


class StepType(str, enum.Enum):
    email = "email"
    call = "call"
    linkedin = "linkedin"
    whatsapp = "whatsapp"
    task = "task"


class EnrollmentStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"
    unsubscribed = "unsubscribed"


class StepExecutionStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    opened = "opened"
    clicked = "clicked"
    replied = "replied"
    bounced = "bounced"
    skipped = "skipped"


class Cadence(Base):
    __tablename__ = "cadences"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship("User", back_populates="cadences")
    steps: Mapped[list["CadenceStep"]] = relationship(
        "CadenceStep", back_populates="cadence", cascade="all, delete-orphan", order_by="CadenceStep.order"
    )
    enrollments: Mapped[list["CadenceEnrollment"]] = relationship(
        "CadenceEnrollment", back_populates="cadence", cascade="all, delete-orphan"
    )


class CadenceStep(Base):
    __tablename__ = "cadence_steps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    cadence_id: Mapped[int] = mapped_column(ForeignKey("cadences.id"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    step_type: Mapped[StepType] = mapped_column(SAEnum(StepType), nullable=False)
    delay_days: Mapped[int] = mapped_column(Integer, default=0)
    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    template_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    cadence: Mapped["Cadence"] = relationship("Cadence", back_populates="steps")
    executions: Mapped[list["StepExecution"]] = relationship(
        "StepExecution", back_populates="step", cascade="all, delete-orphan"
    )


class CadenceEnrollment(Base):
    __tablename__ = "cadence_enrollments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    cadence_id: Mapped[int] = mapped_column(ForeignKey("cadences.id"), nullable=False)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id"), nullable=False)
    status: Mapped[EnrollmentStatus] = mapped_column(SAEnum(EnrollmentStatus), default=EnrollmentStatus.active)
    current_step: Mapped[int] = mapped_column(Integer, default=0)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    cadence: Mapped["Cadence"] = relationship("Cadence", back_populates="enrollments")
    lead: Mapped["Lead"] = relationship("Lead", back_populates="cadence_enrollments")
    executions: Mapped[list["StepExecution"]] = relationship(
        "StepExecution", back_populates="enrollment", cascade="all, delete-orphan"
    )


class StepExecution(Base):
    __tablename__ = "step_executions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    enrollment_id: Mapped[int] = mapped_column(ForeignKey("cadence_enrollments.id"), nullable=False)
    step_id: Mapped[int] = mapped_column(ForeignKey("cadence_steps.id"), nullable=False)
    status: Mapped[StepExecutionStatus] = mapped_column(SAEnum(StepExecutionStatus), default=StepExecutionStatus.pending)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sendgrid_message_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    enrollment: Mapped["CadenceEnrollment"] = relationship("CadenceEnrollment", back_populates="executions")
    step: Mapped["CadenceStep"] = relationship("CadenceStep", back_populates="executions")
