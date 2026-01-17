"""
Rate limiting configuration for NutriProfile API.
Uses slowapi with Redis backend for production.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.config import get_settings

settings = get_settings()


def get_user_identifier(request: Request) -> str:
    """
    Get user identifier for rate limiting.
    Uses user_id from JWT if available, otherwise falls back to IP.
    """
    # Try to get user_id from request state (set by auth dependency)
    if hasattr(request.state, "user_id") and request.state.user_id:
        return f"user:{request.state.user_id}"

    # Fall back to IP address
    return get_remote_address(request)


# Create limiter with Redis storage in production
limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["100/minute"],  # Default rate limit
    storage_uri=settings.REDIS_URL if hasattr(settings, 'REDIS_URL') and settings.REDIS_URL else "memory://",
    strategy="fixed-window",
    headers_enabled=True,  # Add X-RateLimit headers to responses
)


# Rate limit decorators for different endpoints
# These can be imported and used as decorators on endpoint functions

# Vision analysis - expensive AI operation
VISION_LIMIT = "10/minute"

# Recipe generation - expensive AI operation
RECIPE_LIMIT = "5/minute"

# Coach messages - moderate AI operation
COACH_LIMIT = "20/minute"

# Authentication - prevent brute force
AUTH_LIMIT = "5/minute"

# General API - standard limit
GENERAL_LIMIT = "100/minute"


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Custom handler for rate limit exceeded errors."""
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Trop de requêtes. Veuillez réessayer plus tard.",
            "error": "rate_limit_exceeded",
            "retry_after": exc.detail.split("per ")[1] if " per " in exc.detail else "1 minute"
        },
        headers={
            "Retry-After": "60",
            "X-RateLimit-Limit": exc.detail,
        }
    )


def setup_rate_limiting(app: FastAPI) -> None:
    """Configure rate limiting for the FastAPI app."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
