#!/usr/bin/env python3
"""Script to update test user password."""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    # Get database URL from environment
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("DATABASE_URL not set")
        return

    # Convert to asyncpg format
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://")
    if "?" in db_url:
        db_url = db_url.split("?")[0]

    # Add SSL mode for Fly Postgres
    db_url = db_url + "?ssl=prefer"

    engine = create_async_engine(db_url, echo=False)

    hashed_pw = "$2b$12$RWs5.Bua9.cPi3wHgPccouNkd6MhuJk5J/SPd3LZc/JsqblDWhtWG"
    email = "test.gratuit.perplexity@gmail.com"

    async with engine.begin() as conn:
        result = await conn.execute(
            text(f"UPDATE users SET hashed_password = :pw WHERE email = :email RETURNING id, email"),
            {"pw": hashed_pw, "email": email}
        )
        row = result.fetchone()
        if row:
            print(f"Updated user {row[0]}: {row[1]}")
        else:
            print("User not found")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
