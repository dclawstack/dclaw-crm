# Directory Structure

```
dclaw-crm/
├── backend/                        # FastAPI Python backend
│   ├── alembic/                    # Database migration tool
│   │   ├── env.py                  # Alembic environment config
│   │   ├── script.py.mako          # Migration template
│   │   └── versions/               # Migration scripts
│   │       └── 84518ffd1972_add_customer_deal_activity_models.py
│   ├── alembic.ini                 # Alembic config file
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py             # FastAPI app factory, router registration
│   │   │   ├── routes/
│   │   │   │   └── health.py       # GET /health liveness check
│   │   │   └── v1/                 # Versioned API handlers
│   │   │       ├── activities.py   # CRUD for activities
│   │   │       ├── customers.py    # CRUD for customers
│   │   │       ├── dashboard.py    # Dashboard summary endpoint
│   │   │       └── deals.py        # CRUD for deals
│   │   ├── core/
│   │   │   ├── config.py           # Settings (env vars via pydantic-settings)
│   │   │   └── database.py         # SQLAlchemy engine + session factory
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── base.py             # DeclarativeBase
│   │   │   ├── customer.py         # Customer model
│   │   │   ├── deal.py             # Deal model
│   │   │   └── activity.py         # Activity model
│   │   ├── repositories/           # Data access layer
│   │   │   ├── base_repo.py        # Generic CRUD repo
│   │   │   ├── customer_repo.py
│   │   │   ├── deal_repo.py
│   │   │   └── activity_repo.py
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   │   ├── common.py           # Shared pagination schema
│   │   │   ├── customer.py
│   │   │   ├── deal.py
│   │   │   └── activity.py
│   │   ├── services/               # Business logic layer (to be populated)
│   │   └── utils/                  # Shared utilities
│   ├── tests/                      # Pytest test suite
│   │   ├── conftest.py             # Test fixtures (DB, client)
│   │   ├── test_customers.py
│   │   ├── test_deals.py
│   │   ├── test_activities.py
│   │   ├── test_dashboard.py
│   │   └── test_health.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                       # Next.js 14 frontend (App Router)
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── globals.css         # Tailwind base styles
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx        # Customers list
│   │   │   │   └── [id]/page.tsx   # Customer detail
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx        # Deals list
│   │   │   │   └── [id]/page.tsx   # Deal detail
│   │   │   └── activities/
│   │   │       └── page.tsx        # Activities list
│   │   ├── components/
│   │   │   └── ui/                 # shadcn/ui v3-compatible components
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── select.tsx
│   │   │       ├── table.tsx
│   │   │       └── tabs.tsx
│   │   └── lib/
│   │       ├── api.ts              # Typed API client (fetch wrappers)
│   │       └── utils.ts            # cn() and shared utilities
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── helm/                           # Kubernetes Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── secrets.yaml
│       ├── _helpers.tpl
│       └── NOTES.txt
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI pipeline
│
├── vault/                          # Obsidian vault notes (this folder)
│
├── docker-compose.yml              # Local dev stack (backend + frontend + postgres)
├── .env.example                    # Environment variable template
├── AGENTS.md                       # AI agent coding guidelines
├── AGENT-PROMPTS.md                # Reusable agent prompts
├── PLAN-v1.2.md                    # Implementation plan
├── PRODUCT-SPEC.md                 # Product specification
├── SCALING-PLAYBOOK.md             # Scaling strategies
└── README.md                       # Project overview
```

## Layer Summary

| Layer | Technology | Location |
|-------|-----------|----------|
| API | FastAPI + Uvicorn | `backend/app/api/` |
| ORM | SQLAlchemy 2.x | `backend/app/models/` |
| Validation | Pydantic v2 | `backend/app/schemas/` |
| Migrations | Alembic | `backend/alembic/` |
| Frontend | Next.js 14 App Router | `frontend/src/app/` |
| UI Components | shadcn/ui (Tailwind) | `frontend/src/components/ui/` |
| Container | Docker / Docker Compose | `docker-compose.yml` |
| Kubernetes | Helm 3 | `helm/` |
| CI | GitHub Actions | `.github/workflows/ci.yml` |

## Related Notes

- [[Backend]]
- [[Frontend]]
- [[Infrastructure]]
- [[Database]]
