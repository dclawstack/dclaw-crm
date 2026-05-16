from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
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
)
import app.models  # noqa: F401 — ensures all models are registered with Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
