from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.cadence import Cadence, CadenceStep, CadenceEnrollment, EnrollmentStatus
from app.models.lead import Lead
from app.schemas.cadence import CadenceCreate, CadenceUpdate, CadenceOut, EnrollLeadsRequest, EnrollmentOut

router = APIRouter(prefix="/cadences", tags=["cadences"])


@router.get("", response_model=list[CadenceOut])
async def list_cadences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Cadence)
        .where(Cadence.owner_id == current_user.id)
        .options(selectinload(Cadence.steps))
        .order_by(Cadence.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=CadenceOut, status_code=201)
async def create_cadence(
    payload: CadenceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cadence = Cadence(
        owner_id=current_user.id,
        name=payload.name,
        description=payload.description,
    )
    db.add(cadence)
    await db.flush()

    for step_data in payload.steps:
        step = CadenceStep(cadence_id=cadence.id, **step_data.model_dump())
        db.add(step)

    await db.commit()
    result = await db.execute(
        select(Cadence).where(Cadence.id == cadence.id).options(selectinload(Cadence.steps))
    )
    return result.scalar_one()


@router.get("/{cadence_id}", response_model=CadenceOut)
async def get_cadence(
    cadence_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Cadence)
        .where(Cadence.id == cadence_id, Cadence.owner_id == current_user.id)
        .options(selectinload(Cadence.steps))
    )
    cadence = result.scalar_one_or_none()
    if not cadence:
        raise HTTPException(status_code=404, detail="Cadence not found")
    return cadence


@router.patch("/{cadence_id}", response_model=CadenceOut)
async def update_cadence(
    cadence_id: int,
    payload: CadenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Cadence)
        .where(Cadence.id == cadence_id, Cadence.owner_id == current_user.id)
        .options(selectinload(Cadence.steps))
    )
    cadence = result.scalar_one_or_none()
    if not cadence:
        raise HTTPException(status_code=404, detail="Cadence not found")

    if payload.name is not None:
        cadence.name = payload.name
    if payload.description is not None:
        cadence.description = payload.description
    if payload.is_active is not None:
        cadence.is_active = payload.is_active

    if payload.steps is not None:
        for step in cadence.steps:
            await db.delete(step)
        await db.flush()
        for step_data in payload.steps:
            step = CadenceStep(cadence_id=cadence.id, **step_data.model_dump())
            db.add(step)

    await db.commit()
    result = await db.execute(
        select(Cadence).where(Cadence.id == cadence_id).options(selectinload(Cadence.steps))
    )
    return result.scalar_one()


@router.delete("/{cadence_id}", status_code=204)
async def delete_cadence(
    cadence_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Cadence).where(Cadence.id == cadence_id, Cadence.owner_id == current_user.id)
    )
    cadence = result.scalar_one_or_none()
    if not cadence:
        raise HTTPException(status_code=404, detail="Cadence not found")
    await db.delete(cadence)
    await db.commit()


@router.post("/{cadence_id}/enroll", response_model=list[EnrollmentOut])
async def enroll_leads(
    cadence_id: int,
    payload: EnrollLeadsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cadence_result = await db.execute(
        select(Cadence).where(Cadence.id == cadence_id, Cadence.owner_id == current_user.id)
    )
    cadence = cadence_result.scalar_one_or_none()
    if not cadence:
        raise HTTPException(status_code=404, detail="Cadence not found")

    enrollments = []
    for lead_id in payload.lead_ids:
        lead_result = await db.execute(
            select(Lead).where(Lead.id == lead_id, Lead.owner_id == current_user.id)
        )
        lead = lead_result.scalar_one_or_none()
        if not lead:
            continue

        existing = await db.execute(
            select(CadenceEnrollment).where(
                CadenceEnrollment.cadence_id == cadence_id,
                CadenceEnrollment.lead_id == lead_id,
                CadenceEnrollment.status == EnrollmentStatus.active,
            )
        )
        if existing.scalar_one_or_none():
            continue

        enrollment = CadenceEnrollment(cadence_id=cadence_id, lead_id=lead_id)
        db.add(enrollment)
        enrollments.append(enrollment)

    await db.commit()
    for e in enrollments:
        await db.refresh(e)
    return enrollments


@router.get("/{cadence_id}/enrollments", response_model=list[EnrollmentOut])
async def list_enrollments(
    cadence_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CadenceEnrollment)
        .join(Cadence)
        .where(Cadence.id == cadence_id, Cadence.owner_id == current_user.id)
    )
    return result.scalars().all()
