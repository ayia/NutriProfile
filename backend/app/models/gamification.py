from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Achievement(Base):
    """Succès débloqués par l'utilisateur."""

    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    achievement_type = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    icon = Column(String(10), nullable=False)
    points = Column(Integer, default=0)

    unlocked_at = Column(DateTime, default=datetime.utcnow)
    seen = Column(Boolean, default=False)

    # Relations
    user = relationship("User", back_populates="achievements")

    def __repr__(self):
        return f"<Achievement {self.name}>"


class Streak(Base):
    """Séries de jours consécutifs."""

    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    streak_type = Column(String(50), nullable=False)  # logging, activity, water, calories
    current_count = Column(Integer, default=0)
    best_count = Column(Integer, default=0)
    last_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="streaks")

    def __repr__(self):
        return f"<Streak {self.streak_type} - {self.current_count}j>"


class Notification(Base):
    """Notifications utilisateur."""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    notification_type = Column(String(50), nullable=False)  # achievement, reminder, tip, coach
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)
    icon = Column(String(10), nullable=True)
    action_url = Column(String(200), nullable=True)
    data = Column(JSON, nullable=True)

    read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.title}>"


class UserStats(Base):
    """Statistiques globales de l'utilisateur pour gamification."""

    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Points et niveau
    total_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    xp_current = Column(Integer, default=0)
    xp_next_level = Column(Integer, default=100)

    # Compteurs totaux
    total_meals_logged = Column(Integer, default=0)
    total_activities = Column(Integer, default=0)
    total_recipes_generated = Column(Integer, default=0)
    total_photos_analyzed = Column(Integer, default=0)
    total_weight_logs = Column(Integer, default=0)

    # Records
    best_streak_logging = Column(Integer, default=0)
    best_streak_activity = Column(Integer, default=0)
    best_streak_calories = Column(Integer, default=0)

    # Achievements count
    achievements_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="stats")

    def __repr__(self):
        return f"<UserStats Level {self.level} - {self.total_points}pts>"


# Définitions des achievements
ACHIEVEMENTS = {
    # Premiers pas
    "first_meal": {
        "name": "Premier repas",
        "description": "Enregistre ton premier repas",
        "icon": "🍽️",
        "points": 10,
    },
    "first_activity": {
        "name": "En mouvement",
        "description": "Enregistre ta première activité",
        "icon": "🏃",
        "points": 10,
    },
    "first_recipe": {
        "name": "Chef débutant",
        "description": "Génère ta première recette",
        "icon": "👨‍🍳",
        "points": 10,
    },
    "first_photo": {
        "name": "Photographe culinaire",
        "description": "Analyse ta première photo",
        "icon": "📸",
        "points": 10,
    },
    "first_weight": {
        "name": "Première pesée",
        "description": "Enregistre ton premier poids",
        "icon": "⚖️",
        "points": 10,
    },

    # Séries
    "streak_3": {
        "name": "Régularité",
        "description": "3 jours consécutifs de suivi",
        "icon": "🔥",
        "points": 25,
    },
    "streak_7": {
        "name": "Semaine parfaite",
        "description": "7 jours consécutifs de suivi",
        "icon": "⭐",
        "points": 50,
    },
    "streak_14": {
        "name": "Deux semaines !",
        "description": "14 jours consécutifs de suivi",
        "icon": "🌟",
        "points": 100,
    },
    "streak_30": {
        "name": "Un mois !",
        "description": "30 jours consécutifs de suivi",
        "icon": "🏆",
        "points": 200,
    },

    # Quantité
    "meals_10": {
        "name": "Bon appétit",
        "description": "10 repas enregistrés",
        "icon": "🥗",
        "points": 25,
    },
    "meals_50": {
        "name": "Régime suivi",
        "description": "50 repas enregistrés",
        "icon": "🍲",
        "points": 75,
    },
    "meals_100": {
        "name": "Centenaire",
        "description": "100 repas enregistrés",
        "icon": "💯",
        "points": 150,
    },

    "activities_10": {
        "name": "Sportif",
        "description": "10 activités enregistrées",
        "icon": "💪",
        "points": 25,
    },
    "activities_50": {
        "name": "Athlète",
        "description": "50 activités enregistrées",
        "icon": "🏅",
        "points": 100,
    },

    # Objectifs
    "goal_calories_5": {
        "name": "Dans les clous",
        "description": "5 jours avec objectif calories atteint",
        "icon": "🎯",
        "points": 50,
    },
    "goal_protein_5": {
        "name": "Protéiné",
        "description": "5 jours avec objectif protéines atteint",
        "icon": "🥩",
        "points": 50,
    },

    # Spéciaux
    "early_bird": {
        "name": "Lève-tôt",
        "description": "Petit-déjeuner enregistré avant 8h",
        "icon": "🌅",
        "points": 15,
    },
    "night_owl": {
        "name": "Couche-tard",
        "description": "Repas enregistré après 22h",
        "icon": "🦉",
        "points": 15,
    },
    "hydration_master": {
        "name": "Hydratation parfaite",
        "description": "2L d'eau en une journée",
        "icon": "💧",
        "points": 25,
    },
    "weight_goal": {
        "name": "Objectif atteint !",
        "description": "Atteins ton objectif de poids",
        "icon": "🎉",
        "points": 500,
    },
}


def calculate_level(total_xp: int) -> tuple[int, int, int]:
    """
    Calcule le niveau basé sur l'XP total.
    Retourne: (level, xp_current, xp_next_level)
    """
    level = 1
    xp_remaining = total_xp
    xp_for_level = 100

    while xp_remaining >= xp_for_level:
        xp_remaining -= xp_for_level
        level += 1
        xp_for_level = int(xp_for_level * 1.5)  # +50% à chaque niveau

    return level, xp_remaining, xp_for_level
