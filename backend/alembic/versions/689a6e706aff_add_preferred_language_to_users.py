"""add_preferred_language_to_users

Revision ID: 689a6e706aff
Revises: 006
Create Date: 2025-12-25 00:36:37.213813

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '689a6e706aff'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajouter la colonne preferred_language avec valeur par défaut 'en'
    op.add_column('users', sa.Column('preferred_language', sa.String(length=5), nullable=False, server_default='en'))


def downgrade() -> None:
    op.drop_column('users', 'preferred_language')
