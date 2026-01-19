"""add favorite meals table

Revision ID: 12a0f296ebc2
Revises: 008_favorite_foods
Create Date: 2026-01-18 23:14:15.799959

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12a0f296ebc2'
down_revision: Union[str, None] = '008_favorite_foods'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'favorite_meals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('items', sa.JSON(), nullable=False),
        sa.Column('total_calories', sa.Float(), nullable=True),
        sa.Column('total_protein', sa.Float(), nullable=True),
        sa.Column('total_carbs', sa.Float(), nullable=True),
        sa.Column('total_fat', sa.Float(), nullable=True),
        sa.Column('use_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_favorite_meals_user_id'), 'favorite_meals', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_favorite_meals_user_id'), table_name='favorite_meals')
    op.drop_table('favorite_meals')
