"""create subscription tables

Revision ID: 007
Revises: 689a6e706aff
Create Date: 2024-12-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007'
down_revision: Union[str, None] = '689a6e706aff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add subscription_tier column to users table
    op.add_column(
        'users',
        sa.Column('subscription_tier', sa.String(20), nullable=False, server_default='free')
    )

    # Table subscriptions
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('paddle_subscription_id', sa.String(100), nullable=True),
        sa.Column('paddle_customer_id', sa.String(100), nullable=True),
        sa.Column('paddle_price_id', sa.String(100), nullable=True),
        sa.Column('paddle_transaction_id', sa.String(100), nullable=True),
        sa.Column('tier', sa.String(20), nullable=False, server_default='free'),
        sa.Column('status', sa.String(20), nullable=False, server_default='active'),
        sa.Column('current_period_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancel_at_period_end', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscriptions_id'), 'subscriptions', ['id'], unique=False)
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=True)
    op.create_index(op.f('ix_subscriptions_paddle_subscription_id'), 'subscriptions', ['paddle_subscription_id'], unique=True)

    # Table usage_tracking
    op.create_table(
        'usage_tracking',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('vision_analyses', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('recipe_generations', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('coach_messages', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'date', name='unique_user_date')
    )
    op.create_index(op.f('ix_usage_tracking_id'), 'usage_tracking', ['id'], unique=False)
    op.create_index(op.f('ix_usage_tracking_user_date'), 'usage_tracking', ['user_id', 'date'], unique=False)


def downgrade() -> None:
    # Drop usage_tracking table
    op.drop_index(op.f('ix_usage_tracking_user_date'), table_name='usage_tracking')
    op.drop_index(op.f('ix_usage_tracking_id'), table_name='usage_tracking')
    op.drop_table('usage_tracking')

    # Drop subscriptions table
    op.drop_index(op.f('ix_subscriptions_paddle_subscription_id'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_user_id'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_id'), table_name='subscriptions')
    op.drop_table('subscriptions')

    # Remove subscription_tier column from users
    op.drop_column('users', 'subscription_tier')
