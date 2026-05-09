# Database

PostgreSQL 15, accessed via SQLAlchemy 2.x ORM. Migrations managed by Alembic.

## Models

| Model | Table | Key Fields |
|-------|-------|------------|
| `Customer` | `customers` | `id`, `name`, `email`, `phone`, `company`, `status`, `created_at` |
| `Deal` | `deals` | `id`, `title`, `customer_id`, `value`, `stage`, `created_at` |
| `Activity` | `activities` | `id`, `deal_id`, `customer_id`, `type`, `notes`, `created_at` |

All models inherit from `models/base.py` (`DeclarativeBase`).

## Migrations

Alembic config: `backend/alembic.ini`
Migration scripts: `backend/alembic/versions/`

```bash
cd backend

# Create a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Apply pending migrations
alembic upgrade head

# Roll back one step
alembic downgrade -1
```

Current migrations:
- `84518ffd1972` — Add Customer, Deal, Activity models

## Connection

`backend/app/core/database.py` creates the SQLAlchemy engine from `DATABASE_URL` (env var).
`get_db()` is a FastAPI dependency that yields a session per request.

## Related Notes

- [[Backend]]
- [[Infrastructure]]
