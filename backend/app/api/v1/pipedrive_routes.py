from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead, LeadStatus
from app.services.pipedrive import PipedriveService

router = APIRouter(prefix="/pipedrive", tags=["pipedrive"])


def get_pipedrive(current_user: User = Depends(get_current_user)) -> PipedriveService:
    return PipedriveService(api_token=current_user.pipedrive_api_token)


@router.get("/persons")
async def list_persons(
    limit: int = 100,
    pipedrive: PipedriveService = Depends(get_pipedrive),
):
    if not pipedrive.api_token:
        raise HTTPException(status_code=400, detail="Pipedrive API token not configured")
    return await pipedrive.get_persons(limit=limit)


@router.get("/deals")
async def list_deals(
    limit: int = 100,
    pipedrive: PipedriveService = Depends(get_pipedrive),
):
    if not pipedrive.api_token:
        raise HTTPException(status_code=400, detail="Pipedrive API token not configured")
    return await pipedrive.get_deals(limit=limit)


class SyncPersonsRequest(BaseModel):
    limit: int = 50


@router.post("/sync-persons")
async def sync_persons_to_leads(
    payload: SyncPersonsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    pipedrive: PipedriveService = Depends(get_pipedrive),
):
    if not pipedrive.api_token:
        raise HTTPException(status_code=400, detail="Pipedrive API token not configured")

    persons = await pipedrive.get_persons(limit=payload.limit)
    created = 0
    for person in persons:
        emails = person.get("email") or []
        email = next((e["value"] for e in emails if e.get("primary")), None)
        if not email:
            continue

        existing = await db.execute(
            select(Lead).where(Lead.owner_id == current_user.id, Lead.email == email)
        )
        if existing.scalar_one_or_none():
            continue

        name = person.get("name", "").split(" ", 1)
        lead = Lead(
            owner_id=current_user.id,
            first_name=name[0],
            last_name=name[1] if len(name) > 1 else "",
            email=email,
            phone=next((p["value"] for p in (person.get("phone") or []) if p.get("primary")), None),
            company=person.get("org_name"),
            status=LeadStatus.new,
            pipedrive_person_id=person.get("id"),
        )
        db.add(lead)
        created += 1

    await db.commit()
    return {"synced": created, "total_found": len(persons)}


class PushLeadRequest(BaseModel):
    lead_id: int


@router.post("/push-lead")
async def push_lead_to_pipedrive(
    payload: PushLeadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    pipedrive: PipedriveService = Depends(get_pipedrive),
):
    if not pipedrive.api_token:
        raise HTTPException(status_code=400, detail="Pipedrive API token not configured")

    result = await db.execute(
        select(Lead).where(Lead.id == payload.lead_id, Lead.owner_id == current_user.id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    person = await pipedrive.create_person(
        name=f"{lead.first_name} {lead.last_name}",
        email=lead.email,
        phone=lead.phone,
    )
    if person:
        lead.pipedrive_person_id = person["id"]
        deal = await pipedrive.create_deal(
            title=f"{lead.first_name} {lead.last_name} - FollowUp",
            person_id=person["id"],
        )
        if deal:
            lead.pipedrive_deal_id = deal["id"]
        await db.commit()

    return {"person": person}
