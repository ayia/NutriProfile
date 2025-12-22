"""create profiles table

Revision ID: 002
Revises: 001
Create Date: 2024-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),

        # Informations personnelles
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(20), nullable=False),
        sa.Column('height_cm', sa.Float(), nullable=False),
        sa.Column('weight_kg', sa.Float(), nullable=False),

        # Activité et objectifs
        sa.Column('activity_level', sa.String(20), nullable=False),
        sa.Column('goal', sa.String(20), nullable=False),
        sa.Column('target_weight_kg', sa.Float(), nullable=True),

        # Préférences alimentaires
        sa.Column('diet_type', sa.String(20), nullable=False, server_default='omnivore'),
        sa.Column('allergies', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('excluded_foods', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('favorite_foods', sa.JSON(), nullable=False, server_default='[]'),

        # Données de santé
        sa.Column('medical_conditions', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('medications', sa.JSON(), nullable=False, server_default='[]'),

        # Valeurs calculées
        sa.Column('bmr', sa.Float(), nullable=True),
        sa.Column('tdee', sa.Float(), nullable=True),
        sa.Column('daily_calories', sa.Integer(), nullable=True),
        sa.Column('protein_g', sa.Integer(), nullable=True),
        sa.Column('carbs_g', sa.Integer(), nullable=True),
        sa.Column('fat_g', sa.Integer(), nullable=True),

        # Métadonnées
        sa.Column('is_complete', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),

        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index(op.f('ix_profiles_id'), 'profiles', ['id'], unique=False)
    op.create_index(op.f('ix_profiles_user_id'), 'profiles', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_profiles_user_id'), table_name='profiles')
    op.drop_index(op.f('ix_profiles_id'), table_name='profiles')
    op.drop_table('profiles')

