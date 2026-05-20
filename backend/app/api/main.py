import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.config import settings
from app.core.database import init_db
from app.core.rate_limit import limiter
from app.api.routes import health
from app.api.v1 import (
    customers_router,
    deals_router,
    activities_router,
    dashboard_router,
    search_router,
    notes_router,
    contacts_router,
    audit_log_router,
    webhooks_router,
    forecast_router,
    auth_router,
    sse_router,
)
import app.models  # noqa: F401 — ensures all models are registered with Base.metadata

logging.basicConfig(
    level=logging.DEBUG if settings.app_env == "dev" else logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s  %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s v1.2.0 [env=%s]", settings.app_name, settings.app_env)
    await init_db()
    yield
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.app_name,
    version="1.2.0",
    lifespan=lifespan,
    # Hide API schema in production — don't expose endpoint map to the internet
    docs_url="/docs" if settings.app_env == "dev" else None,
    redoc_url=None,
    openapi_url="/openapi.json" if settings.app_env == "dev" else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """Injects X-Request-ID header and logs method/path/status/latency for every request."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "%s %s → %s  %.1fms  rid=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        request_id,
    )
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    # Explicit method list — ["*"] would allow CONNECT/TRACE which have no legitimate CRM use
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(customers_router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(deals_router, prefix="/api/v1/deals", tags=["deals"])
app.include_router(activities_router, prefix="/api/v1/activities", tags=["activities"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(search_router, prefix="/api/v1/search", tags=["search"])
app.include_router(notes_router, prefix="/api/v1/notes", tags=["notes"])
app.include_router(contacts_router, prefix="/api/v1", tags=["contacts"])
app.include_router(audit_log_router, prefix="/api/v1/audit-log", tags=["audit-log"])
app.include_router(webhooks_router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(forecast_router, prefix="/api/v1/forecast", tags=["forecast"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(sse_router, prefix="/api/v1/sse", tags=["sse"])
