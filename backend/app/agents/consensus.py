from typing import Any
from pydantic import BaseModel, Field
import structlog
from statistics import mean, stdev

from app.agents.base import AgentResponse

logger = structlog.get_logger()


class ConsensusResult(BaseModel):
    """Résultat de la validation de consensus."""

    is_valid: bool = Field(..., description="Consensus atteint")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confiance globale")
    merged_result: Any = Field(..., description="Résultat fusionné")
    agreement_score: float = Field(..., description="Score d'accord entre modèles")
    individual_scores: list[float] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    disagreements: list[str] = Field(default_factory=list)


class ConsensusValidator:
    """
    Valide et fusionne les résultats de plusieurs modèles.

    Stratégies de consensus par type de tâche:
    - Recettes: fusion des ingrédients communs + moyenne des temps
    - Vision: intersection des aliments détectés + moyenne des quantités
    - Nutrition: moyenne pondérée avec exclusion des outliers
    """

    def __init__(self, min_confidence: float = 0.6):
        self.min_confidence = min_confidence

    def validate(
        self,
        responses: list[AgentResponse],
        task_type: str,
        min_agreement: int = 2,
    ) -> ConsensusResult:
        """Valide et fusionne les réponses."""
        if not responses:
            return ConsensusResult(
                is_valid=False,
                confidence=0.0,
                merged_result=None,
                agreement_score=0.0,
                warnings=["Aucune réponse à valider"],
            )

        # Filtrer les réponses avec confiance suffisante
        valid_responses = [r for r in responses if r.confidence >= self.min_confidence]

        if len(valid_responses) < min_agreement:
            logger.warning(
                "insufficient_valid_responses",
                total=len(responses),
                valid=len(valid_responses),
                required=min_agreement,
            )
            # Utiliser toutes les réponses si pas assez de valides
            valid_responses = responses

        # Calculer les scores individuels
        individual_scores = [r.confidence for r in valid_responses]

        # Sélectionner la stratégie de fusion
        merge_strategy = self._get_merge_strategy(task_type)
        merged_result, disagreements = merge_strategy(valid_responses)

        # Calculer le score d'accord
        agreement_score = self._calculate_agreement(valid_responses, task_type)

        # Calculer la confiance globale
        global_confidence = self._calculate_global_confidence(
            individual_scores, agreement_score
        )

        # Générer les warnings
        warnings = []
        if len(valid_responses) < min_agreement:
            warnings.append(f"Seulement {len(valid_responses)} modèles ont répondu")
        if agreement_score < 0.7:
            warnings.append(f"Faible accord entre modèles ({agreement_score:.2f})")
        if disagreements:
            warnings.append(f"{len(disagreements)} désaccords détectés")

        is_valid = (
            len(valid_responses) >= min_agreement
            and agreement_score >= 0.5
            and global_confidence >= self.min_confidence
        )

        logger.info(
            "consensus_result",
            task_type=task_type,
            is_valid=is_valid,
            confidence=global_confidence,
            agreement=agreement_score,
            models_count=len(valid_responses),
        )

        return ConsensusResult(
            is_valid=is_valid,
            confidence=global_confidence,
            merged_result=merged_result,
            agreement_score=agreement_score,
            individual_scores=individual_scores,
            warnings=warnings,
            disagreements=disagreements,
        )

    def _get_merge_strategy(self, task_type: str):
        """Retourne la stratégie de fusion appropriée."""
        strategies = {
            "recipe_generation": self._merge_recipes,
            "food_detection": self._merge_detections,
            "nutrition_validation": self._merge_nutrition,
            "profile_analysis": self._merge_profiles,
            "coaching": self._merge_coaching,
        }
        return strategies.get(task_type, self._merge_default)

    def _merge_recipes(
        self, responses: list[AgentResponse]
    ) -> tuple[dict[str, Any], list[str]]:
        """Fusionne les recettes: ingrédients communs + moyenne temps."""
        disagreements = []
        results = [r.result for r in responses if r.result]

        if not results:
            return {}, ["Pas de recettes à fusionner"]

        # Si c'est une liste de recettes, prendre la première de chaque
        if isinstance(results[0], list):
            results = [r[0] if r else {} for r in results]

        # Fusionner les ingrédients (intersection)
        all_ingredients = [set(r.get("ingredients", [])) for r in results if isinstance(r, dict)]
        common_ingredients = list(set.intersection(*all_ingredients)) if all_ingredients else []

        # Moyenne des temps de préparation
        prep_times = [
            r.get("prep_time", 0) for r in results
            if isinstance(r, dict) and r.get("prep_time")
        ]
        avg_prep_time = mean(prep_times) if prep_times else 0

        # Prendre le titre le plus fréquent
        titles = [r.get("title", "") for r in results if isinstance(r, dict)]
        title = max(set(titles), key=titles.count) if titles else ""

        # Détecter les désaccords sur les ingrédients
        if all_ingredients:
            all_unique = set.union(*all_ingredients)
            if len(all_unique) > len(common_ingredients) * 1.5:
                disagreements.append("Désaccord significatif sur les ingrédients")

        return {
            "title": title,
            "ingredients": common_ingredients,
            "prep_time": round(avg_prep_time),
            "sources_count": len(results),
        }, disagreements

    def _merge_detections(
        self, responses: list[AgentResponse]
    ) -> tuple[dict[str, Any], list[str]]:
        """Fusionne les détections: intersection + moyenne quantités."""
        disagreements = []
        results = [r.result for r in responses if r.result]

        if not results:
            return {"foods": []}, ["Pas de détections à fusionner"]

        # Collecter tous les aliments détectés
        all_foods: dict[str, list[float]] = {}
        for result in results:
            foods = result.get("foods", []) if isinstance(result, dict) else []
            for food in foods:
                name = food.get("name", "") if isinstance(food, dict) else str(food)
                quantity = food.get("quantity", 1.0) if isinstance(food, dict) else 1.0
                if name:
                    all_foods.setdefault(name.lower(), []).append(quantity)

        # Garder seulement les aliments détectés par au moins 2 modèles
        min_detections = min(2, len(results))
        common_foods = []
        for name, quantities in all_foods.items():
            if len(quantities) >= min_detections:
                common_foods.append({
                    "name": name,
                    "quantity": round(mean(quantities), 1),
                    "detection_count": len(quantities),
                })

        # Détecter les désaccords
        total_unique = len(all_foods)
        if total_unique > len(common_foods) * 2:
            disagreements.append(f"Fort désaccord: {total_unique} aliments uniques, {len(common_foods)} en commun")

        return {"foods": common_foods}, disagreements

    def _merge_nutrition(
        self, responses: list[AgentResponse]
    ) -> tuple[dict[str, Any], list[str]]:
        """Fusionne les données nutritionnelles: moyenne pondérée sans outliers."""
        disagreements = []
        results = [r.result for r in responses if r.result and isinstance(r.result, dict)]

        if not results:
            return {}, ["Pas de données nutritionnelles"]

        merged = {}
        numeric_fields = ["calories", "protein", "carbs", "fat", "fiber", "bmr", "tdee"]

        for field in numeric_fields:
            values = [r.get(field) for r in results if r.get(field) is not None]
            if values:
                # Exclure les outliers (> 2 écarts-types)
                if len(values) >= 3:
                    avg = mean(values)
                    std = stdev(values)
                    filtered = [v for v in values if abs(v - avg) <= 2 * std]
                    if filtered:
                        values = filtered
                    else:
                        disagreements.append(f"Outliers sur {field}")

                merged[field] = round(mean(values), 1)

        return merged, disagreements

    def _merge_profiles(
        self, responses: list[AgentResponse]
    ) -> tuple[dict[str, Any], list[str]]:
        """Fusionne les analyses de profil."""
        return self._merge_nutrition(responses)

    def _merge_coaching(
        self, responses: list[AgentResponse]
    ) -> tuple[dict[str, Any], list[str]]:
        """Fusionne les conseils de coaching."""
        results = [r.result for r in responses if r.result]

        if not results:
            return {"advice": ""}, []

        # Prendre le conseil avec la plus haute confiance
        best_response = max(responses, key=lambda r: r.confidence)
        return best_response.result, []

    def _merge_default(
        self, responses: list[AgentResponse]
    ) -> tuple[Any, list[str]]:
        """Fusion par défaut: prendre le résultat avec la plus haute confiance."""
        if not responses:
            return None, []

        best = max(responses, key=lambda r: r.confidence)
        return best.result, []

    def _calculate_agreement(
        self, responses: list[AgentResponse], task_type: str
    ) -> float:
        """Calcule le score d'accord entre les modèles."""
        if len(responses) < 2:
            return 1.0

        confidences = [r.confidence for r in responses]

        # Variance des confiances (plus c'est bas, plus l'accord est fort)
        if len(confidences) >= 2:
            variance = stdev(confidences) if len(confidences) > 1 else 0
            agreement_from_confidence = max(0, 1 - variance * 2)
        else:
            agreement_from_confidence = 1.0

        return round(agreement_from_confidence, 2)

    def _calculate_global_confidence(
        self, individual_scores: list[float], agreement_score: float
    ) -> float:
        """Calcule la confiance globale."""
        if not individual_scores:
            return 0.0

        avg_confidence = mean(individual_scores)

        # Pondérer par l'accord
        global_conf = avg_confidence * 0.7 + agreement_score * 0.3

        return round(global_conf, 2)
