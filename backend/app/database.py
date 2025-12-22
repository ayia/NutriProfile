from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

# Configuration adaptée pour SQLite vs PostgreSQL
engine_kwargs = {
    "echo": settings.DEBUG,
}

# SQLite ne supporte pas pool_pre_ping
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["pool_pre_ping"] = True
else:
    # SQLite nécessite check_same_thread=False pour async
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs,
)

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
