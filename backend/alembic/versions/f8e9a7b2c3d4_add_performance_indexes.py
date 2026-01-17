"""add performance indexes

Revision ID: f8e9a7b2c3d4
Revises: a9cf40a30c6a
Create Date: 2026-01-17 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8e9a7b2c3d4'
down_revision: Union[str, None] = 'a9cf40a30c6a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add performance indexes for frequently queried tables."""

    # food_logs: user_id + created_at (DESC) for dashboard recent meals
    op.create_index(
        'idx_food_logs_user_date',
        'food_logs',
        ['user_id', sa.text('created_at DESC')],
        postgresql_using='btree'
    )

    # food_logs: user_id + meal_type + created_at for filtered queries
    op.create_index(
        'idx_food_logs_meal_type',
        'food_logs',
        ['user_id', 'meal_type', sa.text('created_at DESC')],
        postgresql_using='btree'
    )

    # activity_logs: user_id + activity_date (DESC) for tracking page
    op.create_index(
        'idx_activities_user_date',
        'activity_logs',
        ['user_id', sa.text('activity_date DESC')],
        postgresql_using='btree'
    )

    # weight_logs: user_id + log_date (DESC) for weight chart
    op.create_index(
        'idx_weight_logs_user_date',
        'weight_logs',
        ['user_id', sa.text('log_date DESC')],
        postgresql_using='btree'
    )

    # daily_nutrition: user_id + date (DESC) for dashboard stats
    op.create_index(
        'idx_daily_nutrition_user_date',
        'daily_nutrition',
        ['user_id', sa.text('date DESC')],
        postgresql_using='btree'
    )

    # usage_tracking: user_id + date for limit checks (already has unique constraint, but composite index helps)
    op.create_index(
        'idx_usage_tracking_user_date',
        'usage_tracking',
        ['user_id', 'date'],
        postgresql_using='btree'
    )

    # subscriptions: user_id for tier checks (already unique, but explicit index)
    # Skip this one as user_id already has unique constraint which creates an index

    # subscriptions: ls_subscription_id for webhook lookups
    # Skip this one as ls_subscription_id already has unique constraint

    # food_items: food_log_id for JOIN performance
    op.create_index(
        'idx_food_items_log_id',
        'food_items',
        ['food_log_id'],
        postgresql_using='btree'
    )


def downgrade() -> None:
    """Remove performance indexes."""

    op.drop_index('idx_food_items_log_id', table_name='food_items')
    op.drop_index('idx_usage_tracking_user_date', table_name='usage_tracking')
    op.drop_index('idx_daily_nutrition_user_date', table_name='daily_nutrition')
    op.drop_index('idx_weight_logs_user_date', table_name='weight_logs')
    op.drop_index('idx_activities_user_date', table_name='activity_logs')
    op.drop_index('idx_food_logs_meal_type', table_name='food_logs')
    op.drop_index('idx_food_logs_user_date', table_name='food_logs')
