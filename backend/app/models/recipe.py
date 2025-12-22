from datetime import datetime
from sqlalchemy import String, DateTime, Integer, Float, ForeignKey, JSON, Text, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Recipe(Base):
    """Modèle de recette générée ou sauvegardée."""

    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Informations de base
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Ingrédients et instructions (JSON)
    ingredients: Mapped[list] = mapped_column(JSON, default=list)
    instructions: Mapped[list] = mapped_column(JSON, default=list)

    # Temps
    prep_time: Mapped[int] = mapped_column(Integer, default=15)  # minutes
    cook_time: Mapped[int] = mapped_column(Integer, default=15)  # minutes
    servings: Mapped[int] = mapped_column(Integer, default=2)

    # Nutrition par portion
    calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protein_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    carbs_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fat_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fiber_g: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Métadonnées
    tags: Mapped[list] = mapped_column(JSON, default=list)
    meal_type: Mapped[str] = mapped_column(String(50), default="lunch")  # breakfast, lunch, dinner, snack
    diet_types: Mapped[list] = mapped_column(JSON, default=list)  # vegan, vegetarian, etc.

    # Source
    is_generated: Mapped[bool] = mapped_column(Boolean, default=True)  # True si générée par IA
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class FavoriteRecipe(Base):
    """Recettes favorites d'un utilisateur."""

    __tablename__ = "favorite_recipes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)

    # Notes personnelles
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1-5

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relations
    recipe = relationship("Recipe")


class RecipeHistory(Base):
    """Historique des recettes générées pour un utilisateur."""

    __tablename__ = "recipe_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)

    # Contexte de génération
    input_ingredients: Mapped[list] = mapped_column(JSON, default=list)
    meal_type: Mapped[str] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relations
    recipe = relationship("Recipe")
