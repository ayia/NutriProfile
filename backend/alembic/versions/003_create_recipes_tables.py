"""create recipes tables

Revision ID: 003
Revises: 002
Create Date: 2024-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table recipes
    op.create_table(
        'recipes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('ingredients', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('instructions', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('prep_time', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('cook_time', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('servings', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('calories', sa.Integer(), nullable=True),
        sa.Column('protein_g', sa.Integer(), nullable=True),
        sa.Column('carbs_g', sa.Integer(), nullable=True),
        sa.Column('fat_g', sa.Integer(), nullable=True),
        sa.Column('fiber_g', sa.Integer(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('meal_type', sa.String(length=50), nullable=False, server_default="'lunch'"),
        sa.Column('diet_types', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('is_generated', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('model_used', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recipes_id'), 'recipes', ['id'], unique=False)
    op.create_index(op.f('ix_recipes_meal_type'), 'recipes', ['meal_type'], unique=False)

    # Table favorite_recipes
    op.create_table(
        'favorite_recipes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'recipe_id', name='uq_user_recipe_favorite')
    )
    op.create_index(op.f('ix_favorite_recipes_user_id'), 'favorite_recipes', ['user_id'], unique=False)

    # Table recipe_history
    op.create_table(
        'recipe_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('input_ingredients', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('meal_type', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recipe_history_user_id'), 'recipe_history', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_recipe_history_user_id'), table_name='recipe_history')
    op.drop_table('recipe_history')

    op.drop_index(op.f('ix_favorite_recipes_user_id'), table_name='favorite_recipes')
    op.drop_table('favorite_recipes')

    op.drop_index(op.f('ix_recipes_meal_type'), table_name='recipes')
    op.drop_index(op.f('ix_recipes_id'), table_name='recipes')
    op.drop_table('recipes')
