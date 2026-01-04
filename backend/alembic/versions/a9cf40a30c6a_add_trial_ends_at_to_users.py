"""add trial_ends_at to users

Revision ID: a9cf40a30c6a
Revises: cad400fd857a
Create Date: 2026-01-04 21:43:43.479897

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9cf40a30c6a'
down_revision: Union[str, None] = 'cad400fd857a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add trial_ends_at column to users table
    op.add_column('users', sa.Column('trial_ends_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove trial_ends_at column from users table
    op.drop_column('users', 'trial_ends_at')
