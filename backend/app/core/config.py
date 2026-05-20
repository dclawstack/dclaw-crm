from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import sys


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    app_name: str = "DClaw CRM"
    app_env: str = "dev"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5435/dclaw_crm"

    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.1-8b-instruct"

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60

    # Comma-separated allowed CORS origins; defaults include local dev ports
    allowed_origins: str = "http://localhost:3006,http://localhost:3000"

    clearbit_api_key: str = ""

    # Deal health score weights
    health_activity_recent_points: int = 25
    health_probability_ok_points: int = 20
    health_stuck_stage_penalty: int = 15
    health_close_date_set_points: int = 10
    health_close_date_overdue_penalty: int = 20

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    s = Settings()
    if s.app_env != "dev" and s.secret_key == "change-me-in-production":
        print("FATAL: SECRET_KEY must be set in production.", file=sys.stderr)
        sys.exit(1)
    return s


settings = get_settings()
