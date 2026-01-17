"""create favorite_foods table

Revision ID: 008_favorite_foods
Revises: f8e9a7b2c3d4
Create Date: 2026-01-17 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008_favorite_foods'
down_revision: Union[str, None] = 'f8e9a7b2c3d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create favorite_foods table for quick food access."""

    op.create_table(
        'favorite_foods',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),

        # Food identification
        sa.Column('name', sa.String(200), nullable=False),  # Normalized name (lowercase)
        sa.Column('display_name', sa.String(200), nullable=False),  # Display name

        # Default nutrition values (per 100g)
        sa.Column('default_calories', sa.Integer(), nullable=True),
        sa.Column('default_protein', sa.Float(), nullable=True),
        sa.Column('default_carbs', sa.Float(), nullable=True),
        sa.Column('default_fat', sa.Float(), nullable=True),

        # Preferred portion
        sa.Column('default_quantity', sa.String(50), nullable=True),
        sa.Column('default_unit', sa.String(20), nullable=True),

        # Usage counter for sorting
        sa.Column('use_count', sa.Integer(), default=0),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Index for fast lookups by user
    op.create_index(
        'idx_favorite_foods_user',
        'favorite_foods',
        ['user_id', 'use_count'],
        postgresql_using='btree'
    )

    # Unique constraint: one favorite per food name per user
    op.create_unique_constraint(
        'uq_favorite_foods_user_name',
        'favorite_foods',
        ['user_id', 'name']
    )


def downgrade() -> None:
    """Drop favorite_foods table."""

    op.drop_constraint('uq_favorite_foods_user_name', 'favorite_foods', type_='unique')
    op.drop_index('idx_favorite_foods_user', table_name='favorite_foods')
    op.drop_table('favorite_foods')
