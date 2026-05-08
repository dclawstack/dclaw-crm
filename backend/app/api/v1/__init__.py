from app.api.v1.customers import router as customers_router
from app.api.v1.deals import router as deals_router
from app.api.v1.activities import router as activities_router
from app.api.v1.dashboard import router as dashboard_router

__all__ = [
    "customers_router",
    "deals_router",
    "activities_router",
    "dashboard_router",
]
