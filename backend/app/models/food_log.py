from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class FoodLog(Base):
    """Journal des repas avec analyse d'image."""

    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Image
    image_url = Column(String(500), nullable=True)
    image_analyzed = Column(Boolean, default=False)

    # Métadonnées
    meal_type = Column(String(20), nullable=False)  # breakfast, lunch, dinner, snack
    meal_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    description = Column(Text, nullable=True)

    # Résultat analyse IA
    detected_items = Column(JSON, nullable=True)  # Liste des aliments détectés
    confidence_score = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)

    # Valeurs nutritionnelles (totales)
    total_calories = Column(Integer, nullable=True)
    total_protein = Column(Float, nullable=True)
    total_carbs = Column(Float, nullable=True)
    total_fat = Column(Float, nullable=True)
    total_fiber = Column(Float, nullable=True)

    # Corrections utilisateur
    user_corrected = Column(Boolean, default=False)
    corrected_items = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="food_logs")

    def __repr__(self):
        return f"<FoodLog {self.id} - {self.meal_type} - {self.meal_date}>"


class FoodItem(Base):
    """Aliment individuel dans un repas."""

    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    food_log_id = Column(Integer, ForeignKey("food_logs.id", ondelete="CASCADE"), nullable=False)

    # Identification
    name = Column(String(200), nullable=False)
    quantity = Column(String(50), nullable=False)
    unit = Column(String(20), nullable=False)  # g, ml, pièce, portion, etc.

    # Valeurs nutritionnelles
    calories = Column(Integer, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)

    # Source et confiance
    source = Column(String(20), default="ai")  # ai, manual, database
    confidence = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    food_log = relationship("FoodLog", backref="items")

    def __repr__(self):
        return f"<FoodItem {self.name} - {self.quantity}{self.unit}>"


class DailyNutrition(Base):
    """Résumé nutritionnel journalier."""

    __tablename__ = "daily_nutrition"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False)

    # Totaux journaliers
    total_calories = Column(Integer, default=0)
    total_protein = Column(Float, default=0)
    total_carbs = Column(Float, default=0)
    total_fat = Column(Float, default=0)
    total_fiber = Column(Float, default=0)

    # Objectifs (copiés du profil pour historique)
    target_calories = Column(Integer, nullable=True)
    target_protein = Column(Float, nullable=True)
    target_carbs = Column(Float, nullable=True)
    target_fat = Column(Float, nullable=True)

    # Statistiques
    meals_count = Column(Integer, default=0)
    water_ml = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="daily_nutrition")

    def __repr__(self):
        return f"<DailyNutrition {self.user_id} - {self.date}>"
