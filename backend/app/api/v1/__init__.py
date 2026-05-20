from app.api.v1.customers import router as customers_router
from app.api.v1.deals import router as deals_router
from app.api.v1.activities import router as activities_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.search import router as search_router
from app.api.v1.notes import router as notes_router
from app.api.v1.contacts import router as contacts_router
from app.api.v1.audit_log import router as audit_log_router
from app.api.v1.webhooks import router as webhooks_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.auth import router as auth_router
from app.api.v1.sse import router as sse_router

__all__ = [
    "customers_router",
    "deals_router",
    "activities_router",
    "dashboard_router",
    "search_router",
    "notes_router",
    "contacts_router",
    "audit_log_router",
    "webhooks_router",
    "forecast_router",
    "auth_router",
    "sse_router",
]
