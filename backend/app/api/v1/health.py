from fastapi import APIRouter
from pydantic import BaseModel

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class HealthResponse(BaseModel):
    """Réponse du health check."""
    status: str
    version: str
    environment: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint pour Fly.io."""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
    )
