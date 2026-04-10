import stripe
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

PLAN_PRICES = {
    "starter": settings.STRIPE_PRICE_STARTER,
    "pro": settings.STRIPE_PRICE_PRO,
    "enterprise": settings.STRIPE_PRICE_ENTERPRISE,
}


class StripeService:
    async def create_customer(self, email: str, name: str) -> str | None:
        if not settings.STRIPE_SECRET_KEY:
            return None
        try:
            customer = stripe.Customer.create(email=email, name=name)
            return customer.id
        except stripe.StripeError as e:
            logger.error("Stripe create_customer error: %s", e)
            return None

    async def create_checkout_session(
        self,
        customer_id: str,
        plan: str,
        success_url: str,
        cancel_url: str,
    ) -> str | None:
        price_id = PLAN_PRICES.get(plan)
        if not price_id or not settings.STRIPE_SECRET_KEY:
            return None
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{"price": price_id, "quantity": 1}],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return session.url
        except stripe.StripeError as e:
            logger.error("Stripe checkout error: %s", e)
            return None

    async def create_portal_session(self, customer_id: str, return_url: str) -> str | None:
        if not settings.STRIPE_SECRET_KEY:
            return None
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session.url
        except stripe.StripeError as e:
            logger.error("Stripe portal error: %s", e)
            return None

    def construct_webhook_event(self, payload: bytes, sig_header: str) -> stripe.Event | None:
        try:
            return stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.SignatureVerificationError) as e:
            logger.error("Webhook error: %s", e)
            return None

    async def cancel_subscription(self, subscription_id: str) -> bool:
        if not settings.STRIPE_SECRET_KEY:
            return False
        try:
            stripe.Subscription.cancel(subscription_id)
            return True
        except stripe.StripeError as e:
            logger.error("Stripe cancel error: %s", e)
            return False


stripe_service = StripeService()
