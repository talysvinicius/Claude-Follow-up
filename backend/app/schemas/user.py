from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import PlanType


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    pipedrive_api_token: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    plan: PlanType
    stripe_customer_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str
