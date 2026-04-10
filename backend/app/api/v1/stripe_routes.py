from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, PlanType
from app.services.stripe import stripe_service
from app.core.config import settings

router = APIRouter(prefix="/stripe", tags=["stripe"])


class CheckoutRequest(BaseModel):
    plan: str


@router.post("/checkout")
async def create_checkout(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.plan not in ("starter", "pro", "enterprise"):
        raise HTTPException(status_code=400, detail="Invalid plan")

    if not current_user.stripe_customer_id:
        customer_id = await stripe_service.create_customer(current_user.email, current_user.full_name)
        if customer_id:
            current_user.stripe_customer_id = customer_id
            await db.commit()

    url = await stripe_service.create_checkout_session(
        customer_id=current_user.stripe_customer_id or "",
        plan=payload.plan,
        success_url=f"{settings.FRONTEND_URL}/dashboard?checkout=success",
        cancel_url=f"{settings.FRONTEND_URL}/pricing?checkout=cancelled",
    )
    if not url:
        raise HTTPException(status_code=500, detail="Could not create checkout session")
    return {"checkout_url": url}


@router.post("/portal")
async def billing_portal(
    current_user: User = Depends(get_current_user),
):
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found")

    url = await stripe_service.create_portal_session(
        customer_id=current_user.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/dashboard/settings",
    )
    if not url:
        raise HTTPException(status_code=500, detail="Could not create portal session")
    return {"portal_url": url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    event = stripe_service.construct_webhook_event(payload, sig_header)
    if not event:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")

        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()
        if user:
            user.stripe_subscription_id = subscription_id
            # Determine plan from metadata or price
            plan_name = session.get("metadata", {}).get("plan", "starter")
            try:
                user.plan = PlanType(plan_name)
            except ValueError:
                user.plan = PlanType.starter
            await db.commit()

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
        user = result.scalar_one_or_none()
        if user:
            user.plan = PlanType.free
            user.stripe_subscription_id = None
            await db.commit()

    return {"status": "ok"}
