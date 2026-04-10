# FollowUp SaaS

SaaS de cadência de follow-up com editor visual, integração Pipedrive + SendGrid + Stripe e biblioteca de aulas.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + React Query + Zustand |
| Backend | FastAPI + SQLAlchemy (async) + Alembic |
| Banco de dados | PostgreSQL 15 |
| Cache / Fila | Redis + Celery |
| Pagamentos | Stripe |
| E-mails | SendGrid |
| CRM | Pipedrive |

## Estrutura

```
.
├── backend/
│   ├── app/
│   │   ├── core/         # Config, DB, Security, Deps
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── api/v1/       # Rotas: auth, leads, cadences, lessons, stripe, pipedrive
│   │   ├── services/     # SendGrid, Pipedrive, Stripe
│   │   └── tasks/        # Celery workers (envio automático de etapas)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/        # Landing, Pricing, Login, Register, Dashboard pages
│       ├── components/   # Layout, UI components
│       ├── services/     # API client (axios)
│       └── store/        # Zustand auth store
└── docker-compose.yml
```

## Início Rápido

### 1. Clonar e configurar

```bash
git clone <repo>
cd Claude-Follow-up
cp .env.example .env
# Edite .env com suas chaves (Stripe, SendGrid, Pipedrive)
```

### 2. Subir com Docker Compose

```bash
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

### 3. Desenvolvimento local (sem Docker)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

### Frontend
- **Landing Page** — Hero, features, testimonials, CTA
- **Pricing** — 4 planos (Free, Starter, Pro, Enterprise) com checkout Stripe
- **Dashboard** — KPIs, gráficos de área/barra/pizza, feed de atividade
- **Leads** — Tabela paginada com busca, filtros, CRUD completo, sync Pipedrive
- **Editor de Cadências** — Drag-and-drop (DnD Kit), timeline visual, suporte a Email/Call/LinkedIn/WhatsApp/Task
- **Biblioteca de Aulas** — Grid por categoria, progresso, controle de acesso por plano
- **Configurações** — Perfil, assinatura Stripe, integração Pipedrive

### Backend (API REST)
- **Auth** — JWT (access + refresh tokens), registro, login
- **Leads** — CRUD, paginação, filtros, estatísticas
- **Cadências** — CRUD, etapas, enroll de leads
- **Aulas** — Categorias, progresso por usuário, controle de plano
- **Stripe** — Checkout session, billing portal, webhook
- **Pipedrive** — Listar persons/deals, sync bidirecional, push lead
- **Celery** — Processamento automático de etapas de cadência

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|----------|-----------|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `STRIPE_PRICE_*` | IDs dos preços no Stripe |
| `SENDGRID_API_KEY` | Chave da API SendGrid |
| `SENDGRID_FROM_EMAIL` | E-mail remetente |
| `SECRET_KEY` | Chave JWT (gere com `openssl rand -hex 32`) |
| `DATABASE_URL` | URL do PostgreSQL |

## API Endpoints

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me

GET/POST        /api/v1/leads
GET/PATCH/DELETE /api/v1/leads/{id}
GET             /api/v1/leads/stats/summary

GET/POST        /api/v1/cadences
GET/PATCH/DELETE /api/v1/cadences/{id}
POST            /api/v1/cadences/{id}/enroll
GET             /api/v1/cadences/{id}/enrollments

GET             /api/v1/lessons
GET             /api/v1/lessons/{slug}
GET             /api/v1/lessons/categories
POST            /api/v1/lessons/{id}/progress

POST            /api/v1/stripe/checkout
POST            /api/v1/stripe/portal
POST            /api/v1/stripe/webhook

GET             /api/v1/pipedrive/persons
GET             /api/v1/pipedrive/deals
POST            /api/v1/pipedrive/sync-persons
POST            /api/v1/pipedrive/push-lead
```
