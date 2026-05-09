# Backend

FastAPI application following a layered architecture.

## Entry Point

`backend/app/api/main.py` — creates the `FastAPI` app instance and mounts all routers.

## Layer Architecture

```
Request → Router (api/v1/) → Repository (repositories/) → Model (models/) → DB
                           ↑
                     Schema (schemas/) — validates in/out
```

## Domains

| Domain | Router | Repo | Model | Schema |
|--------|--------|------|-------|--------|
| Customers | `v1/customers.py` | `customer_repo.py` | `customer.py` | `customer.py` |
| Deals | `v1/deals.py` | `deal_repo.py` | `deal.py` | `deal.py` |
| Activities | `v1/activities.py` | `activity_repo.py` | `activity.py` | `activity.py` |
| Dashboard | `v1/dashboard.py` | — | — | — |
| Health | `routes/health.py` | — | — | — |

## Core Config

- **`core/config.py`** — pydantic-settings `Settings` class; reads from env vars / `.env`
- **`core/database.py`** — SQLAlchemy async engine and `get_db` session dependency

## Repositories

`base_repo.py` provides generic `get`, `get_all`, `create`, `update`, `delete` methods.
Domain repos inherit from it and add domain-specific queries.

## Testing

Tests live in `backend/tests/`. `conftest.py` sets up an in-process test DB and a `TestClient`.

Run:
```bash
cd backend
pytest
```

## Related Notes

- [[Directory-Structure]]
- [[Database]]
- [[API-Reference]]
