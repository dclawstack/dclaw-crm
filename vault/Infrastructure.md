# Infrastructure

## Docker Compose (Local Dev)

`docker-compose.yml` spins up three services:

| Service | Image | Port |
|---------|-------|------|
| `postgres` | postgres:15 | 5432 |
| `backend` | `backend/Dockerfile` | 8000 |
| `frontend` | `frontend/Dockerfile` | 3000 |

```bash
cp .env.example .env   # fill in secrets
docker compose up --build
```

## Helm Chart

`helm/` is a Kubernetes Helm 3 chart for production deployment.

| File | Purpose |
|------|---------|
| `Chart.yaml` | Chart metadata and version |
| `values.yaml` | Default configuration values |
| `templates/deployment.yaml` | Backend + frontend Deployments |
| `templates/service.yaml` | ClusterIP / LoadBalancer Services |
| `templates/secrets.yaml` | Secret manifest (DB credentials, etc.) |
| `templates/_helpers.tpl` | Named template helpers |

```bash
helm install dclaw-crm ./helm -f helm/values.yaml
helm upgrade dclaw-crm ./helm -f helm/values.yaml
```

## CI/CD

`.github/workflows/ci.yml` — GitHub Actions pipeline runs on push/PR to `main`:
- Lints and tests the backend (pytest)
- Lints and builds the frontend (next build)

## Environment Variables

See `.env.example` for the full list. Key vars:

| Variable | Used By |
|----------|---------|
| `DATABASE_URL` | Backend SQLAlchemy |
| `NEXT_PUBLIC_API_URL` | Frontend API client |
| `SECRET_KEY` | Backend JWT / session |

## Related Notes

- [[Directory-Structure]]
- [[Database]]
