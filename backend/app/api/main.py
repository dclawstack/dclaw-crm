from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health
from app.api.v1 import customers_router, deals_router, activities_router, dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(customers_router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(deals_router, prefix="/api/v1/deals", tags=["deals"])
app.include_router(activities_router, prefix="/api/v1/activities", tags=["activities"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
