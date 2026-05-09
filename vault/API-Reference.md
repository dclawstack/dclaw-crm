# API Reference

Base URL: `http://localhost:8000` (local) or configured via `NEXT_PUBLIC_API_URL`.

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check — returns `{"status": "ok"}` |

## Customers `/api/v1/customers`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/customers` | List all customers (paginated) |
| POST | `/api/v1/customers` | Create a customer |
| GET | `/api/v1/customers/{id}` | Get customer by ID |
| PUT | `/api/v1/customers/{id}` | Update customer |
| DELETE | `/api/v1/customers/{id}` | Delete customer |

## Deals `/api/v1/deals`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/deals` | List all deals (paginated) |
| POST | `/api/v1/deals` | Create a deal |
| GET | `/api/v1/deals/{id}` | Get deal by ID |
| PUT | `/api/v1/deals/{id}` | Update deal |
| DELETE | `/api/v1/deals/{id}` | Delete deal |

## Activities `/api/v1/activities`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/activities` | List all activities (paginated) |
| POST | `/api/v1/activities` | Log an activity |
| GET | `/api/v1/activities/{id}` | Get activity by ID |
| PUT | `/api/v1/activities/{id}` | Update activity |
| DELETE | `/api/v1/activities/{id}` | Delete activity |

## Dashboard `/api/v1/dashboard`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/dashboard` | Summary stats (customer count, deal totals, recent activity) |

## Interactive Docs

FastAPI auto-generates docs when running locally:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Related Notes

- [[Backend]]
- [[Frontend]]
