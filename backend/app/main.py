from contextlib import asynccontextmanager
import traceback
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

from app.config import get_settings
from app.api.v1 import api_router

# Forcer le rechargement des settings à chaque démarrage
get_settings.cache_clear()
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


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware pour ajouter les headers de sécurité."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Protection contre le clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Protection XSS
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Politique de référent stricte
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Cache control pour les données sensibles
        if "/api/" in str(request.url):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
        return response


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
    # Désactiver la documentation en production
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS - DOIT être ajouté en premier (exécuté en dernier dans la chaîne)
# pour que les requêtes preflight OPTIONS soient traitées correctement
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=600,  # Cache preflight pendant 10 minutes
)

# Middleware de sécurité (ajouté après CORS)
app.add_middleware(SecurityHeadersMiddleware)

# Routes
app.include_router(api_router)


# Health check racine (pour Fly.io)
@app.get("/health")
async def root_health():
    """Health check racine."""
    return {"status": "healthy", "version": settings.APP_VERSION}


# Error handler sécurisé
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Gestionnaire global d'erreurs sécurisé."""
    # Générer un ID unique pour le suivi
    error_id = str(uuid.uuid4())[:8]
    error_detail = traceback.format_exc()

    # Logger les détails côté serveur uniquement
    logger.error(
        "Unhandled exception",
        error_id=error_id,
        error=str(exc),
        traceback=error_detail,
        path=str(request.url),
        method=request.method,
    )

    # En mode debug, afficher dans la console
    if settings.DEBUG:
        print(f"ERROR [{error_id}]: {exc}")
        print(error_detail)

    # Retourner une réponse générique au client (JAMAIS le traceback)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Une erreur interne s'est produite",
            "error_id": error_id,
            # Ajouter le message d'erreur seulement en mode debug
            **({"debug_message": str(exc)} if settings.DEBUG else {}),
        }
    )
