"""create activity tables

Revision ID: 005
Revises: 004
Create Date: 2024-12-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table activity_logs
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(50), nullable=False),
        sa.Column('name', sa.String(200), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('intensity', sa.String(20), default='moderate'),
        sa.Column('calories_burned', sa.Integer(), nullable=True),
        sa.Column('calories_source', sa.String(20), default='estimated'),
        sa.Column('distance_km', sa.Float(), nullable=True),
        sa.Column('steps', sa.Integer(), nullable=True),
        sa.Column('heart_rate_avg', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('activity_date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_logs_id'), 'activity_logs', ['id'], unique=False)
    op.create_index(op.f('ix_activity_logs_user_id'), 'activity_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_activity_logs_activity_date'), 'activity_logs', ['activity_date'], unique=False)

    # Table weight_logs
    op.create_table(
        'weight_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('weight_kg', sa.Float(), nullable=False),
        sa.Column('body_fat_percent', sa.Float(), nullable=True),
        sa.Column('muscle_mass_kg', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('log_date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_weight_logs_id'), 'weight_logs', ['id'], unique=False)
    op.create_index(op.f('ix_weight_logs_user_id'), 'weight_logs', ['user_id'], unique=False)

    # Table goals
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('goal_type', sa.String(50), nullable=False),
        sa.Column('target_value', sa.Float(), nullable=False),
        sa.Column('current_value', sa.Float(), default=0),
        sa.Column('unit', sa.String(20), nullable=False),
        sa.Column('period', sa.String(20), default='daily'),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_completed', sa.Boolean(), default=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_goals_id'), 'goals', ['id'], unique=False)
    op.create_index(op.f('ix_goals_user_id'), 'goals', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_goals_user_id'), table_name='goals')
    op.drop_index(op.f('ix_goals_id'), table_name='goals')
    op.drop_table('goals')

    op.drop_index(op.f('ix_weight_logs_user_id'), table_name='weight_logs')
    op.drop_index(op.f('ix_weight_logs_id'), table_name='weight_logs')
    op.drop_table('weight_logs')

    op.drop_index(op.f('ix_activity_logs_activity_date'), table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_user_id'), table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_id'), table_name='activity_logs')
    op.drop_table('activity_logs')
