import asyncio
from logging.config import fileConfig
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

from app.config import get_settings
from app.database import Base
# Import tous les modèles pour qu'Alembic les détecte
from app.models import (  # noqa: F401
    User, Profile, Recipe, FavoriteRecipe, RecipeHistory,
    FoodLog, FoodItem, DailyNutrition,
    ActivityLog, WeightLog, Goal,
    Achievement, Streak, Notification, UserStats,
)


def convert_database_url(url: str) -> str:
    """Convert database URL for asyncpg compatibility."""
    # Convert postgres:// or postgresql:// to postgresql+asyncpg://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Remove sslmode parameter (asyncpg doesn't support it as a query param)
    if "sslmode=" in url:
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        query_params.pop("sslmode", None)
        new_query = urlencode(query_params, doseq=True)
        url = urlunparse(parsed._replace(query=new_query))

    return url


config = context.config
settings = get_settings()

# Override la database URL avec celle de la config
database_url = convert_database_url(settings.DATABASE_URL)

config.set_main_option("sqlalchemy.url", database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    # Build connect_args based on database type
    connect_args = {}
    if not database_url.startswith("sqlite"):
        # Disable SSL for Fly.io internal PostgreSQL connections
        connect_args["ssl"] = False

    connectable = create_async_engine(
        database_url,
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
