"""add water and activity targets to profile

Revision ID: b4d3bf54a725
Revises: 007
Create Date: 2025-12-28 15:57:10.916773

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4d3bf54a725'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add water and activity target columns to profiles table
    op.add_column('profiles', sa.Column('water_target_ml', sa.Integer(), server_default='2000', nullable=False))
    op.add_column('profiles', sa.Column('activity_target_min', sa.Integer(), server_default='30', nullable=False))


def downgrade() -> None:
    op.drop_column('profiles', 'activity_target_min')
    op.drop_column('profiles', 'water_target_ml')
