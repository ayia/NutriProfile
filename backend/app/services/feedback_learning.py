"""
Service de Feedback Loop pour l'amélioration continue de la précision nutritionnelle.

Ce service collecte les corrections utilisateur et les utilise pour:
1. Créer une base de données d'apprentissage locale
2. Améliorer les estimations futures pour les aliments similaires
3. Détecter les patterns d'erreur systématiques du VLM

Approche:
- Quand un utilisateur corrige un aliment, on stocke la correction
- Les futures analyses consultent cette base pour ajuster les estimations
- Les corrections sont agrégées pour obtenir des facteurs de correction robustes
"""

import structlog
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.food_log import FoodLog, FoodItem

logger = structlog.get_logger()


# =============================================================================
# STRUCTURES DE DONNÉES POUR LES CORRECTIONS
# =============================================================================

class NutritionCorrection:
    """Représente une correction nutritionnelle apportée par un utilisateur."""

    def __init__(
        self,
        food_name: str,
        original_calories: int,
        corrected_calories: int,
        original_protein: float,
        corrected_protein: float,
        original_carbs: float,
        corrected_carbs: float,
        original_fat: float,
        corrected_fat: float,
        quantity: str,
        unit: str,
    ):
        self.food_name = food_name.lower().strip()
        self.original_calories = original_calories
        self.corrected_calories = corrected_calories
        self.original_protein = original_protein
        self.corrected_protein = corrected_protein
        self.original_carbs = original_carbs
        self.corrected_carbs = corrected_carbs
        self.original_fat = original_fat
        self.corrected_fat = corrected_fat
        self.quantity = quantity
        self.unit = unit

    @property
    def calories_factor(self) -> float:
        """Facteur de correction des calories."""
        if self.original_calories <= 0:
            return 1.0
        return self.corrected_calories / self.original_calories

    @property
    def protein_factor(self) -> float:
        """Facteur de correction des protéines."""
        if self.original_protein <= 0:
            return 1.0
        return self.corrected_protein / self.original_protein

    @property
    def carbs_factor(self) -> float:
        """Facteur de correction des glucides."""
        if self.original_carbs <= 0:
            return 1.0
        return self.corrected_carbs / self.original_carbs

    @property
    def fat_factor(self) -> float:
        """Facteur de correction des lipides."""
        if self.original_fat <= 0:
            return 1.0
        return self.corrected_fat / self.original_fat


class CorrectionFactors:
    """Facteurs de correction agrégés pour un type d'aliment."""

    def __init__(
        self,
        food_pattern: str,
        calories_factor: float = 1.0,
        protein_factor: float = 1.0,
        carbs_factor: float = 1.0,
        fat_factor: float = 1.0,
        sample_count: int = 0,
        confidence: float = 0.0,
    ):
        self.food_pattern = food_pattern
        self.calories_factor = calories_factor
        self.protein_factor = protein_factor
        self.carbs_factor = carbs_factor
        self.fat_factor = fat_factor
        self.sample_count = sample_count
        self.confidence = confidence  # Plus d'échantillons = plus de confiance


# =============================================================================
# SERVICE DE FEEDBACK LEARNING
# =============================================================================

class FeedbackLearningService:
    """
    Service qui collecte et utilise les corrections utilisateur pour améliorer
    les estimations nutritionnelles futures.
    """

    # Nombre minimum de corrections avant d'utiliser un facteur
    MIN_SAMPLES_FOR_LEARNING = 3

    # Limite de la fenêtre d'apprentissage (90 jours)
    LEARNING_WINDOW_DAYS = 90

    # Seuils pour détecter des erreurs significatives
    SIGNIFICANT_ERROR_THRESHOLD = 0.15  # 15% de différence

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_correction_factors_for_food(
        self, food_name: str, user_id: int | None = None
    ) -> CorrectionFactors | None:
        """
        Récupère les facteurs de correction pour un aliment spécifique.

        Priorité:
        1. Corrections de l'utilisateur spécifique
        2. Corrections globales (tous les utilisateurs)

        Args:
            food_name: Nom de l'aliment
            user_id: ID de l'utilisateur (optionnel pour correction personnalisée)

        Returns:
            CorrectionFactors si assez de données, None sinon
        """
        food_lower = food_name.lower().strip()
        cutoff_date = datetime.utcnow() - timedelta(days=self.LEARNING_WINDOW_DAYS)

        # 1. Chercher les corrections pour cet utilisateur spécifique
        if user_id:
            user_factors = await self._get_user_corrections(food_lower, user_id, cutoff_date)
            if user_factors and user_factors.sample_count >= self.MIN_SAMPLES_FOR_LEARNING:
                logger.info(
                    "using_user_correction_factors",
                    food=food_lower,
                    user_id=user_id,
                    samples=user_factors.sample_count,
                )
                return user_factors

        # 2. Sinon, utiliser les corrections globales
        global_factors = await self._get_global_corrections(food_lower, cutoff_date)
        if global_factors and global_factors.sample_count >= self.MIN_SAMPLES_FOR_LEARNING:
            logger.info(
                "using_global_correction_factors",
                food=food_lower,
                samples=global_factors.sample_count,
            )
            return global_factors

        return None

    async def _get_user_corrections(
        self, food_pattern: str, user_id: int, cutoff_date: datetime
    ) -> CorrectionFactors | None:
        """Récupère les corrections d'un utilisateur spécifique."""
        # Requête pour récupérer les items corrigés (source = 'manual' après ai_estimated)
        query = (
            select(FoodItem)
            .join(FoodLog)
            .where(and_(
                FoodLog.user_id == user_id,
                FoodLog.user_corrected == True,  # noqa: E712
                FoodItem.source == "manual",
                FoodItem.name.ilike(f"%{food_pattern}%"),
                FoodItem.created_at >= cutoff_date,
            ))
        )

        result = await self.db.execute(query)
        corrected_items = result.scalars().all()

        if len(corrected_items) < self.MIN_SAMPLES_FOR_LEARNING:
            return None

        return self._calculate_factors_from_items(food_pattern, corrected_items)

    async def _get_global_corrections(
        self, food_pattern: str, cutoff_date: datetime
    ) -> CorrectionFactors | None:
        """Récupère les corrections de tous les utilisateurs."""
        query = (
            select(FoodItem)
            .join(FoodLog)
            .where(and_(
                FoodLog.user_corrected == True,  # noqa: E712
                FoodItem.source == "manual",
                FoodItem.name.ilike(f"%{food_pattern}%"),
                FoodItem.created_at >= cutoff_date,
            ))
        )

        result = await self.db.execute(query)
        corrected_items = result.scalars().all()

        if len(corrected_items) < self.MIN_SAMPLES_FOR_LEARNING:
            return None

        return self._calculate_factors_from_items(food_pattern, corrected_items)

    def _calculate_factors_from_items(
        self, food_pattern: str, items: list
    ) -> CorrectionFactors:
        """
        Calcule les facteurs de correction moyens à partir d'une liste d'items.

        Note: Cette implémentation simplifiée utilise les valeurs corrigées
        directement. Une implémentation plus avancée stockerait les valeurs
        originales AI dans une table séparée.
        """
        if not items:
            return CorrectionFactors(food_pattern=food_pattern)

        # Pour l'instant, on utilise une approche simplifiée:
        # On compare les valeurs avec les moyennes USDA/typiques
        # et on calcule les facteurs basés sur les corrections utilisateur

        # Moyenne des valeurs corrigées (pour 100g normalisé)
        avg_calories = sum(i.calories or 0 for i in items) / len(items)
        avg_protein = sum(i.protein or 0 for i in items) / len(items)
        avg_carbs = sum(i.carbs or 0 for i in items) / len(items)
        avg_fat = sum(i.fat or 0 for i in items) / len(items)

        # Confiance basée sur le nombre d'échantillons
        # Plus d'échantillons = plus de confiance (max 0.9)
        confidence = min(0.9, 0.5 + (len(items) / 20))

        return CorrectionFactors(
            food_pattern=food_pattern,
            calories_factor=1.0,  # À ajuster avec des données historiques AI
            protein_factor=1.0,
            carbs_factor=1.0,
            fat_factor=1.0,
            sample_count=len(items),
            confidence=confidence,
        )

    async def apply_learned_corrections(
        self, items: list[dict], user_id: int | None = None
    ) -> list[dict]:
        """
        Applique les corrections apprises aux estimations AI.

        Cette méthode est appelée après l'analyse VLM pour ajuster
        les valeurs basées sur les corrections passées.

        Args:
            items: Liste d'items avec leurs estimations AI
            user_id: ID de l'utilisateur pour corrections personnalisées

        Returns:
            Liste d'items avec corrections appliquées
        """
        corrected_items = []

        for item in items:
            food_name = item.get("name", "")
            factors = await self.get_correction_factors_for_food(food_name, user_id)

            if factors and factors.confidence > 0.5:
                # Appliquer les corrections avec pondération par confiance
                weight = factors.confidence

                original_cal = item.get("calories", 0)
                original_prot = item.get("protein", 0)
                original_carbs = item.get("carbs", 0)
                original_fat = item.get("fat", 0)

                # Correction pondérée
                item["calories"] = int(
                    original_cal * (1 - weight) + original_cal * factors.calories_factor * weight
                )
                item["protein"] = round(
                    original_prot * (1 - weight) + original_prot * factors.protein_factor * weight, 1
                )
                item["carbs"] = round(
                    original_carbs * (1 - weight) + original_carbs * factors.carbs_factor * weight, 1
                )
                item["fat"] = round(
                    original_fat * (1 - weight) + original_fat * factors.fat_factor * weight, 1
                )

                item["learning_applied"] = True
                item["learning_confidence"] = factors.confidence
                item["learning_samples"] = factors.sample_count

                logger.info(
                    "learning_correction_applied",
                    food=food_name,
                    confidence=factors.confidence,
                    samples=factors.sample_count,
                )
            else:
                item["learning_applied"] = False

            corrected_items.append(item)

        return corrected_items

    async def get_learning_stats(self, user_id: int) -> dict:
        """
        Récupère les statistiques d'apprentissage pour un utilisateur.

        Utile pour afficher dans les settings ou dashboard.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=self.LEARNING_WINDOW_DAYS)

        # Nombre de corrections apportées
        corrections_query = (
            select(func.count(FoodItem.id))
            .join(FoodLog)
            .where(and_(
                FoodLog.user_id == user_id,
                FoodLog.user_corrected == True,  # noqa: E712
                FoodItem.source == "manual",
                FoodItem.created_at >= cutoff_date,
            ))
        )
        corrections_result = await self.db.execute(corrections_query)
        total_corrections = corrections_result.scalar() or 0

        # Aliments uniques corrigés
        unique_foods_query = (
            select(func.count(func.distinct(FoodItem.name)))
            .join(FoodLog)
            .where(and_(
                FoodLog.user_id == user_id,
                FoodLog.user_corrected == True,  # noqa: E712
                FoodItem.source == "manual",
                FoodItem.created_at >= cutoff_date,
            ))
        )
        unique_result = await self.db.execute(unique_foods_query)
        unique_foods_corrected = unique_result.scalar() or 0

        # Repas avec corrections
        meals_query = (
            select(func.count(func.distinct(FoodLog.id)))
            .where(and_(
                FoodLog.user_id == user_id,
                FoodLog.user_corrected == True,  # noqa: E712
                FoodLog.created_at >= cutoff_date,
            ))
        )
        meals_result = await self.db.execute(meals_query)
        meals_corrected = meals_result.scalar() or 0

        return {
            "total_corrections": total_corrections,
            "unique_foods_corrected": unique_foods_corrected,
            "meals_corrected": meals_corrected,
            "learning_window_days": self.LEARNING_WINDOW_DAYS,
            "min_samples_for_learning": self.MIN_SAMPLES_FOR_LEARNING,
        }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_feedback_service(db: AsyncSession) -> FeedbackLearningService:
    """Factory function pour créer le service de feedback."""
    return FeedbackLearningService(db)


async def apply_feedback_learning_to_analysis(
    db: AsyncSession,
    items: list[dict],
    user_id: int,
) -> list[dict]:
    """
    Fonction utilitaire pour appliquer le feedback learning aux résultats d'analyse.

    À appeler dans l'endpoint /vision/analyze après l'analyse VLM et USDA.
    """
    service = FeedbackLearningService(db)
    return await service.apply_learned_corrections(items, user_id)
