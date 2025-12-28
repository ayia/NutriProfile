from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()


def convert_database_url(url: str) -> str:
    """Convert database URL for asyncpg compatibility."""
    # Convert postgres:// or postgresql:// to postgresql+asyncpg://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Remove sslmode parameter (asyncpg doesn't support it as a query param)
    # Fly.io internal connections don't need SSL anyway
    if "sslmode=" in url:
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        query_params.pop("sslmode", None)
        new_query = urlencode(query_params, doseq=True)
        url = urlunparse(parsed._replace(query=new_query))

    return url


database_url = convert_database_url(settings.DATABASE_URL)

# Configuration adaptée pour SQLite vs PostgreSQL
engine_kwargs = {
    "echo": settings.DEBUG,
}

# SQLite ne supporte pas pool_pre_ping
if not database_url.startswith("sqlite"):
    engine_kwargs["pool_pre_ping"] = True
    # Disable SSL for Fly.io internal connections (asyncpg uses ssl=False)
    engine_kwargs["connect_args"] = {"ssl": False}
    # Pool configuration for PostgreSQL
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_timeout"] = 30
    engine_kwargs["pool_recycle"] = 1800  # Recycle connections after 30 minutes
else:
    # SQLite nécessite check_same_thread=False pour async
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(
    database_url,
    **engine_kwargs,
)

# Expose engine for external use (needed for async engine in some cases)
async_engine = engine

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Classe de base pour les modèles SQLAlchemy."""
    pass


async def get_db() -> AsyncSession:
    """Dependency pour obtenir une session DB."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
