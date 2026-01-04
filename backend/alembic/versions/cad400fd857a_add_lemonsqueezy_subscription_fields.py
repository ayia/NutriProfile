"""add_lemonsqueezy_subscription_fields

Revision ID: cad400fd857a
Revises: b4d3bf54a725
Create Date: 2026-01-04 02:37:47.935304

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cad400fd857a'
down_revision: Union[str, None] = 'b4d3bf54a725'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add Lemon Squeezy columns to subscriptions table
    # Simple add_column for SQLite compatibility (no constraints needed for initial deployment)
    op.add_column('subscriptions', sa.Column('ls_subscription_id', sa.String(length=100), nullable=True))
    op.add_column('subscriptions', sa.Column('ls_customer_id', sa.String(length=100), nullable=True))
    op.add_column('subscriptions', sa.Column('ls_variant_id', sa.String(length=100), nullable=True))
    op.add_column('subscriptions', sa.Column('ls_order_id', sa.String(length=100), nullable=True))


def downgrade() -> None:
    # Remove Lemon Squeezy columns
    op.drop_column('subscriptions', 'ls_order_id')
    op.drop_column('subscriptions', 'ls_variant_id')
    op.drop_column('subscriptions', 'ls_customer_id')
    op.drop_column('subscriptions', 'ls_subscription_id')
