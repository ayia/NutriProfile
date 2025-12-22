"""Dependencies for API endpoints."""

from app.api.v1.auth import get_current_user
from app.database import get_db

__all__ = ["get_current_user", "get_db"]
