from contextlib import asynccontextmanager
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.config import get_settings
from app.api.v1 import api_router

settings = get_settings()

# Configuration structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application."""
    logger.info("Starting NutriProfile API", version=settings.APP_VERSION)
    yield
    logger.info("Shutting down NutriProfile API")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API de nutrition personnalisée avec système multi-agents LLM",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router)


# Health check racine (pour Fly.io)
@app.get("/health")
async def root_health():
    """Health check racine."""
    return {"status": "healthy", "version": settings.APP_VERSION}


# Error handler pour debug
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Gestionnaire global d'erreurs pour afficher les détails."""
    error_detail = traceback.format_exc()
    logger.error("Unhandled exception", error=str(exc), traceback=error_detail, path=str(request.url))
    print(f"ERROR: {exc}")
    print(error_detail)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": error_detail}
    )
