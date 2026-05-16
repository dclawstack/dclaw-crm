# DClaw CRM

**Author:** Satish Manpuri

A full-stack CRM built on FastAPI + Next.js 14, backed by PostgreSQL. Ships all 15 v1.2 features: Kanban pipeline, global search, notes, task queue, customer status lifecycle, deal health scoring, audit log, webhooks, CSV import/export, dashboard date range, contacts model, AI enrichment, JWT auth, RBAC, and revenue forecast.

---

## Quick Start (Docker — recommended)

**Prerequisites:** Docker + Docker Compose installed.

```bash
# 1. Start all services (Postgres + Backend + Frontend)
docker compose up -d --build

# 2. Run the database migration (first time only)
docker compose exec backend alembic upgrade head

# 3. Check everything is healthy
docker compose ps
```

That's it. All three services start together with health checks.

---

## Access URLs

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend (UI)** | http://localhost:3006 | Next.js app |
| **Backend API** | http://localhost:8095 | FastAPI |
| **API Docs (Swagger)** | http://localhost:8095/docs | Interactive API explorer |
| **API Docs (ReDoc)** | http://localhost:8095/redoc | Alternative docs |
| **Health check** | http://localhost:8095/health/ | Returns `{"status":"ok"}` |
| **PostgreSQL** | localhost:**5435** | Host port (internal: 5432) |

### Database connection string (for GUI tools like TablePlus, DBeaver, psql)

```
Host:     localhost
Port:     5435
Database: dclaw_crm
User:     postgres
Password: postgres
```

```bash
# psql from terminal
psql -h localhost -p 5435 -U postgres -d dclaw_crm
```

---

## Running Locally (without Docker)

### Backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5435/dclaw_crm"
export SECRET_KEY="dev-secret-key-change-in-production"

# Run migrations
alembic upgrade head

# Start the backend (auto-reload)
uvicorn app.main:app --host 0.0.0.0 --port 8095 --reload
```

Backend is now at http://localhost:8095

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set the API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8095" > .env.local

# Start the dev server
npm run dev -- --port 3006
```

Frontend is now at http://localhost:3006

---

## Environment Variables

### Backend (`backend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_crm` | PostgreSQL async DSN |
| `SECRET_KEY` | `changeme` | JWT signing secret — **change in production** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT token lifetime |
| `CLEARBIT_API_KEY` | `` | Optional — enables AI enrichment via Clearbit |

### Frontend (`frontend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8095` | Backend base URL |

---

## Database Migrations

```bash
# Apply all pending migrations
docker compose exec backend alembic upgrade head

# Check current revision
docker compose exec backend alembic current

# Show migration history
docker compose exec backend alembic history

# Roll back one step
docker compose exec backend alembic downgrade -1
```

Migration files live in `backend/alembic/versions/`:
- `84518ffd1972` — v1.0 base: customers, deals, activities
- `v1_2_add_features` — v1.2: notes, contacts, audit_log, webhook_endpoints, webhook_deliveries, users; extends enums

---

## Running Tests

```bash
# Backend tests (requires a running Postgres — uses a separate test DB automatically)
docker compose exec backend pytest -v

# Or locally with the test DB
cd backend
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5435/dclaw_crm_test" pytest -v

# Frontend type check
cd frontend
npx tsc --noEmit

# Frontend build (full validation)
cd frontend
npm run build
```

---

## Common Docker Commands

```bash
# Start services
docker compose up -d

# Start with a fresh build (after code changes)
docker compose up -d --build

# View logs
docker compose logs -f                  # all services
docker compose logs -f backend          # backend only
docker compose logs -f frontend         # frontend only

# Stop services
docker compose down

# Stop and delete volumes (wipes the database)
docker compose down -v

# Open a shell in the backend container
docker compose exec backend bash

# Open psql in the DB container
docker compose exec postgres psql -U postgres -d dclaw_crm
```

---

## API Overview

All endpoints are under `/api/v1/`. Explore interactively at http://localhost:8095/docs.

| Domain | Endpoints |
|--------|-----------|
| Customers | `GET/POST /customers/` · `GET/PUT/DELETE /customers/{id}` · `PATCH /customers/{id}/status` · `POST /customers/{id}/enrich` · `GET /customers/export` · `POST /customers/import` |
| Deals | `GET/POST /deals/` · `GET/PUT/DELETE /deals/{id}` · `PATCH /deals/{id}/stage` · `GET /deals/{id}/health` · `GET /deals/export` · `POST /deals/import` |
| Activities | `GET/POST /activities/` · `PATCH /activities/{id}/complete` · `GET /activities/due-today` · `GET /activities/overdue` |
| Notes | `GET/POST /notes/` · `GET/PUT/DELETE /notes/{id}` |
| Contacts | `GET/POST /customers/{id}/contacts/` · `PUT/DELETE /contacts/{id}` |
| Search | `GET /search/?q=` |
| Dashboard | `GET /dashboard/?from_date=&to_date=` |
| Forecast | `GET /forecast/?from_date=&to_date=` |
| Audit Log | `GET /audit-log/?entity_type=&entity_id=` |
| Webhooks | `GET/POST /webhooks/` · `DELETE /webhooks/{id}` · `GET /webhooks/{id}/deliveries` |
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` |

---

## Ports at a Glance

| Service | Host Port | Container Port |
|---------|-----------|----------------|
| Frontend | **3006** | 3006 |
| Backend | **8095** | 8095 |
| PostgreSQL | **5435** | 5432 |
