"""create gamification tables

Revision ID: 006
Revises: 005
Create Date: 2024-12-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table achievements
    op.create_table(
        'achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('achievement_type', sa.String(50), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('icon', sa.String(10), nullable=False),
        sa.Column('points', sa.Integer(), default=0),
        sa.Column('unlocked_at', sa.DateTime(), nullable=True),
        sa.Column('seen', sa.Boolean(), default=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)
    op.create_index(op.f('ix_achievements_user_id'), 'achievements', ['user_id'], unique=False)

    # Table streaks
    op.create_table(
        'streaks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('streak_type', sa.String(50), nullable=False),
        sa.Column('current_count', sa.Integer(), default=0),
        sa.Column('best_count', sa.Integer(), default=0),
        sa.Column('last_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_streaks_id'), 'streaks', ['id'], unique=False)
    op.create_index(op.f('ix_streaks_user_type'), 'streaks', ['user_id', 'streak_type'], unique=True)

    # Table notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('notification_type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(10), nullable=True),
        sa.Column('action_url', sa.String(200), nullable=True),
        sa.Column('data', sa.JSON(), nullable=True),
        sa.Column('read', sa.Boolean(), default=False),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)

    # Table user_stats
    op.create_table(
        'user_stats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_points', sa.Integer(), default=0),
        sa.Column('level', sa.Integer(), default=1),
        sa.Column('xp_current', sa.Integer(), default=0),
        sa.Column('xp_next_level', sa.Integer(), default=100),
        sa.Column('total_meals_logged', sa.Integer(), default=0),
        sa.Column('total_activities', sa.Integer(), default=0),
        sa.Column('total_recipes_generated', sa.Integer(), default=0),
        sa.Column('total_photos_analyzed', sa.Integer(), default=0),
        sa.Column('total_weight_logs', sa.Integer(), default=0),
        sa.Column('best_streak_logging', sa.Integer(), default=0),
        sa.Column('best_streak_activity', sa.Integer(), default=0),
        sa.Column('best_streak_calories', sa.Integer(), default=0),
        sa.Column('achievements_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_stats_id'), 'user_stats', ['id'], unique=False)
    op.create_index(op.f('ix_user_stats_user_id'), 'user_stats', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_stats_user_id'), table_name='user_stats')
    op.drop_index(op.f('ix_user_stats_id'), table_name='user_stats')
    op.drop_table('user_stats')

    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')

    op.drop_index(op.f('ix_streaks_user_type'), table_name='streaks')
    op.drop_index(op.f('ix_streaks_id'), table_name='streaks')
    op.drop_table('streaks')

    op.drop_index(op.f('ix_achievements_user_id'), table_name='achievements')
    op.drop_index(op.f('ix_achievements_id'), table_name='achievements')
    op.drop_table('achievements')
