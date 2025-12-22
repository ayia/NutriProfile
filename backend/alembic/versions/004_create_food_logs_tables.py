"""create food logs tables

Revision ID: 004
Revises: 003
Create Date: 2024-12-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table food_logs
    op.create_table(
        'food_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('image_analyzed', sa.Boolean(), default=False),
        sa.Column('meal_type', sa.String(20), nullable=False),
        sa.Column('meal_date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('detected_items', sa.JSON(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('model_used', sa.String(100), nullable=True),
        sa.Column('total_calories', sa.Integer(), nullable=True),
        sa.Column('total_protein', sa.Float(), nullable=True),
        sa.Column('total_carbs', sa.Float(), nullable=True),
        sa.Column('total_fat', sa.Float(), nullable=True),
        sa.Column('total_fiber', sa.Float(), nullable=True),
        sa.Column('user_corrected', sa.Boolean(), default=False),
        sa.Column('corrected_items', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_food_logs_id'), 'food_logs', ['id'], unique=False)
    op.create_index(op.f('ix_food_logs_user_id'), 'food_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_food_logs_meal_date'), 'food_logs', ['meal_date'], unique=False)

    # Table food_items
    op.create_table(
        'food_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('food_log_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('quantity', sa.String(50), nullable=False),
        sa.Column('unit', sa.String(20), nullable=False),
        sa.Column('calories', sa.Integer(), nullable=True),
        sa.Column('protein', sa.Float(), nullable=True),
        sa.Column('carbs', sa.Float(), nullable=True),
        sa.Column('fat', sa.Float(), nullable=True),
        sa.Column('fiber', sa.Float(), nullable=True),
        sa.Column('source', sa.String(20), default='ai'),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['food_log_id'], ['food_logs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_food_items_id'), 'food_items', ['id'], unique=False)

    # Table daily_nutrition
    op.create_table(
        'daily_nutrition',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('total_calories', sa.Integer(), default=0),
        sa.Column('total_protein', sa.Float(), default=0),
        sa.Column('total_carbs', sa.Float(), default=0),
        sa.Column('total_fat', sa.Float(), default=0),
        sa.Column('total_fiber', sa.Float(), default=0),
        sa.Column('target_calories', sa.Integer(), nullable=True),
        sa.Column('target_protein', sa.Float(), nullable=True),
        sa.Column('target_carbs', sa.Float(), nullable=True),
        sa.Column('target_fat', sa.Float(), nullable=True),
        sa.Column('meals_count', sa.Integer(), default=0),
        sa.Column('water_ml', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_daily_nutrition_id'), 'daily_nutrition', ['id'], unique=False)
    op.create_index(op.f('ix_daily_nutrition_user_date'), 'daily_nutrition', ['user_id', 'date'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_daily_nutrition_user_date'), table_name='daily_nutrition')
    op.drop_index(op.f('ix_daily_nutrition_id'), table_name='daily_nutrition')
    op.drop_table('daily_nutrition')

    op.drop_index(op.f('ix_food_items_id'), table_name='food_items')
    op.drop_table('food_items')

    op.drop_index(op.f('ix_food_logs_meal_date'), table_name='food_logs')
    op.drop_index(op.f('ix_food_logs_user_id'), table_name='food_logs')
    op.drop_index(op.f('ix_food_logs_id'), table_name='food_logs')
    op.drop_table('food_logs')
