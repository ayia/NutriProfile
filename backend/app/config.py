from pydantic_settings import BaseSettings
from pydantic import computed_field
from functools import lru_cache
import json


class Settings(BaseSettings):
    """Configuration de l'application."""

    # Application
    APP_NAME: str = "NutriProfile API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8080

    # Database (SQLite par defaut, configurable via .env)
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/nutriprofile.db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    REFRESH_SECRET_KEY: str = "your-refresh-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Token d'accès court (15 min)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # Refresh token (7 jours)
    ALGORITHM: str = "HS256"

    # Hugging Face
    HUGGINGFACE_TOKEN: str = ""

    # Paddle (Payment Gateway - Merchant of Record)
    PADDLE_API_KEY: str = ""
    PADDLE_WEBHOOK_SECRET: str = ""
    PADDLE_ENVIRONMENT: str = "sandbox"  # "sandbox" ou "production"
    PADDLE_PREMIUM_MONTHLY_PRICE_ID: str = ""
    PADDLE_PREMIUM_YEARLY_PRICE_ID: str = ""
    PADDLE_PRO_MONTHLY_PRICE_ID: str = ""
    PADDLE_PRO_YEARLY_PRICE_ID: str = ""

    # CORS - stocké comme string, converti en liste via computed_field
    CORS_ORIGINS_RAW: str = "https://nutriprofile.pages.dev,https://1bfa8b06.nutriprofile.pages.dev,https://ba2a146d.nutriprofile.pages.dev,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:3000"

    @computed_field
    @property
    def CORS_ORIGINS(self) -> list[str]:
        """Parse CORS_ORIGINS_RAW into a list."""
        v = self.CORS_ORIGINS_RAW
        if not v or v.strip() == "":
            return ["http://localhost:5173"]
        # Essayer JSON d'abord
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
        # Sinon, chaîne séparée par des virgules
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache
def get_settings() -> Settings:
    """Retourne les settings en cache."""
    return Settings()


# Forcer le rechargement des settings au démarrage
get_settings.cache_clear()
