from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.lead import LeadStatus


class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    position: str | None = None
    status: LeadStatus = LeadStatus.new
    notes: str | None = None


class LeadUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    company: str | None = None
    position: str | None = None
    status: LeadStatus | None = None
    notes: str | None = None


class LeadOut(BaseModel):
    id: int
    owner_id: int
    first_name: str
    last_name: str
    email: str
    phone: str | None
    company: str | None
    position: str | None
    status: LeadStatus
    notes: str | None
    pipedrive_person_id: int | None
    pipedrive_deal_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    items: list[LeadOut]
    total: int
    page: int
    page_size: int
