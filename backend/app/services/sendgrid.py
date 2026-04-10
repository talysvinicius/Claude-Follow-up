import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, To, From, Subject, HtmlContent, PlainTextContent
from app.core.config import settings

logger = logging.getLogger(__name__)


class SendGridService:
    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY) if settings.SENDGRID_API_KEY else None
        self.from_email = settings.SENDGRID_FROM_EMAIL
        self.from_name = settings.SENDGRID_FROM_NAME

    async def send_email(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        html_content: str,
        plain_content: str | None = None,
    ) -> dict:
        if not self.client:
            logger.warning("SendGrid not configured. Email not sent to %s", to_email)
            return {"status": "skipped", "reason": "sendgrid_not_configured"}

        message = Mail()
        message.from_email = From(self.from_email, self.from_name)
        message.to = [To(to_email, to_name)]
        message.subject = Subject(subject)
        message.html_content = HtmlContent(html_content)
        if plain_content:
            message.plain_text_content = PlainTextContent(plain_content)

        try:
            response = self.client.send(message)
            message_id = response.headers.get("X-Message-Id", "")
            logger.info("Email sent to %s, message_id=%s", to_email, message_id)
            return {"status": "sent", "message_id": message_id}
        except Exception as exc:
            logger.error("Failed to send email to %s: %s", to_email, exc)
            return {"status": "error", "error": str(exc)}

    async def send_welcome_email(self, to_email: str, full_name: str) -> dict:
        html = f"""
        <h1>Bem-vindo ao FollowUp SaaS, {full_name}!</h1>
        <p>Sua conta foi criada com sucesso.</p>
        <p>Comece criando sua primeira cadência de follow-up e conecte seu Pipedrive.</p>
        <a href="{settings.FRONTEND_URL}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Acessar Dashboard
        </a>
        """
        return await self.send_email(to_email, full_name, "Bem-vindo ao FollowUp SaaS!", html)

    async def send_cadence_step_email(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        body: str,
    ) -> dict:
        html = f"<div style='font-family:sans-serif;max-width:600px;margin:auto'>{body}</div>"
        return await self.send_email(to_email, to_name, subject, html)


sendgrid_service = SendGridService()
