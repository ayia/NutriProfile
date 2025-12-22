import json
import re
import base64
from typing import Any

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability


class VisionInput:
    """Données d'entrée pour l'agent de vision."""

    def __init__(
        self,
        image_base64: str,
        image_type: str = "image/jpeg",
        context: str | None = None,
    ):
        self.image_base64 = image_base64
        self.image_type = image_type
        self.context = context  # Ex: "petit-déjeuner", "restaurant", etc.


class FoodItem:
    """Un aliment détecté dans l'image."""

    def __init__(
        self,
        name: str,
        quantity: str,
        unit: str,
        calories: int,
        protein: float,
        carbs: float,
        fat: float,
        confidence: float = 0.8,
    ):
        self.name = name
        self.quantity = quantity
        self.unit = unit
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.confidence = confidence

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "confidence": self.confidence,
        }


class FoodAnalysis:
    """Résultat complet de l'analyse d'image."""

    def __init__(
        self,
        items: list[FoodItem],
        meal_type: str | None = None,
        total_calories: int = 0,
        total_protein: float = 0,
        total_carbs: float = 0,
        total_fat: float = 0,
        description: str = "",
    ):
        self.items = items
        self.meal_type = meal_type
        self.description = description

        # Calcul des totaux si non fournis
        if total_calories == 0 and items:
            self.total_calories = sum(item.calories for item in items)
            self.total_protein = sum(item.protein for item in items)
            self.total_carbs = sum(item.carbs for item in items)
            self.total_fat = sum(item.fat for item in items)
        else:
            self.total_calories = total_calories
            self.total_protein = total_protein
            self.total_carbs = total_carbs
            self.total_fat = total_fat

    def to_dict(self) -> dict:
        return {
            "items": [item.to_dict() for item in self.items],
            "meal_type": self.meal_type,
            "total_calories": self.total_calories,
            "total_protein": round(self.total_protein, 1),
            "total_carbs": round(self.total_carbs, 1),
            "total_fat": round(self.total_fat, 1),
            "description": self.description,
        }


class VisionAgent(BaseAgent[VisionInput, FoodAnalysis]):
    """
    Agent d'analyse d'images alimentaires.

    Utilise des modèles vision-language pour:
    - Identifier les aliments dans une photo
    - Estimer les portions
    - Calculer les valeurs nutritionnelles
    """

    name = "VisionAgent"
    capability = ModelCapability.FOOD_DETECTION
    confidence_threshold = 0.5
    vlm_model = "Qwen/Qwen2.5-VL-72B-Instruct"

    async def process(self, input_data: VisionInput, model=None) -> AgentResponse:
        """
        Traitement spécifique pour la vision utilisant l'API VLM.
        Override la méthode de base pour utiliser vision_chat.
        """
        import structlog

        logger = structlog.get_logger()

        prompt = self.build_prompt(input_data)

        logger.info(
            "vision_agent_processing",
            agent=self.name,
            model=self.vlm_model,
        )

        try:
            # Utiliser la nouvelle méthode vision_chat
            raw_response = await self.client.vision_chat(
                image_base64=input_data.image_base64,
                prompt=prompt,
                model_id=self.vlm_model,
                max_tokens=800,
            )

            if not raw_response:
                logger.warning("vision_empty_response")
                return await self.fallback(input_data)

            result = self.parse_response(raw_response, input_data)
            confidence = self.calculate_confidence(result, raw_response)

            logger.info(
                "vision_agent_response",
                agent=self.name,
                model=self.vlm_model,
                confidence=confidence,
                items_count=len(result.items),
            )

            return AgentResponse(
                result=result,
                confidence=confidence,
                model_used=self.vlm_model,
                reasoning=result.description,
                used_fallback=False,
            )

        except Exception as e:
            logger.error(
                "vision_agent_error",
                agent=self.name,
                model=self.vlm_model,
                error=str(e),
            )
            return await self.fallback(input_data)

    def build_prompt(self, input_data: VisionInput) -> str:
        """Construit le prompt pour l'analyse d'image."""
        context_hint = ""
        if input_data.context:
            context_hint = f"\nContexte: C'est un {input_data.context}."

        return f"""Analyse cette image de nourriture et identifie tous les aliments visibles.
{context_hint}

Pour chaque aliment détecté, estime:
1. Le nom de l'aliment
2. La quantité approximative
3. L'unité (g, ml, pièce, portion, etc.)
4. Les valeurs nutritionnelles estimées

Réponds UNIQUEMENT en JSON avec ce format exact:
{{
    "description": "Description courte du repas",
    "meal_type": "breakfast|lunch|dinner|snack",
    "items": [
        {{
            "name": "nom de l'aliment",
            "quantity": "100",
            "unit": "g",
            "calories": 150,
            "protein": 5.0,
            "carbs": 20.0,
            "fat": 3.0,
            "confidence": 0.85
        }}
    ]
}}

Sois précis sur les portions. Pour les plats composés, décompose les ingrédients principaux.
Base tes estimations sur des valeurs nutritionnelles moyennes connues."""

    def build_vision_request(self, input_data: VisionInput) -> dict:
        """Construit la requête pour un modèle vision."""
        return {
            "image": input_data.image_base64,
            "image_type": input_data.image_type,
            "prompt": self.build_prompt(input_data),
        }

    def parse_response(self, raw_response: str, input_data: VisionInput) -> FoodAnalysis:
        """Parse la réponse LLM en objet FoodAnalysis."""
        try:
            # Chercher le JSON dans la réponse
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())

                items = []
                for item_data in data.get("items", []):
                    items.append(FoodItem(
                        name=item_data.get("name", "Aliment inconnu"),
                        quantity=str(item_data.get("quantity", "1")),
                        unit=item_data.get("unit", "portion"),
                        calories=int(item_data.get("calories", 0)),
                        protein=float(item_data.get("protein", 0)),
                        carbs=float(item_data.get("carbs", 0)),
                        fat=float(item_data.get("fat", 0)),
                        confidence=float(item_data.get("confidence", 0.7)),
                    ))

                return FoodAnalysis(
                    items=items,
                    meal_type=data.get("meal_type"),
                    description=data.get("description", ""),
                )
            else:
                raise ValueError("No JSON found in response")

        except (json.JSONDecodeError, ValueError):
            return self.deterministic_fallback(input_data)

    def calculate_confidence(self, result: FoodAnalysis, raw_response: str) -> float:
        """Calcule le score de confiance global."""
        if not result.items:
            return 0.3

        # Moyenne des confiances individuelles
        avg_confidence = sum(item.confidence for item in result.items) / len(result.items)

        # Bonus si on a une description et un type de repas
        if result.description:
            avg_confidence += 0.05
        if result.meal_type:
            avg_confidence += 0.05

        return min(avg_confidence, 1.0)

    def deterministic_fallback(self, input_data: VisionInput) -> FoodAnalysis:
        """Fallback quand l'analyse échoue."""
        # Retourner un résultat minimal demandant une correction manuelle
        return FoodAnalysis(
            items=[
                FoodItem(
                    name="Repas non identifié",
                    quantity="1",
                    unit="portion",
                    calories=500,
                    protein=20,
                    carbs=50,
                    fat=20,
                    confidence=0.3,
                )
            ],
            meal_type=input_data.context or "lunch",
            description="Analyse automatique non disponible. Veuillez corriger manuellement.",
        )


# Tables de référence nutritionnelle pour validation
NUTRITION_REFERENCE = {
    # Fruits
    "pomme": {"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "unit": "100g"},
    "banane": {"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "unit": "100g"},
    "orange": {"calories": 47, "protein": 0.9, "carbs": 12, "fat": 0.1, "unit": "100g"},

    # Protéines
    "poulet": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "unit": "100g"},
    "saumon": {"calories": 208, "protein": 20, "carbs": 0, "fat": 13, "unit": "100g"},
    "oeuf": {"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "unit": "100g"},
    "boeuf": {"calories": 250, "protein": 26, "carbs": 0, "fat": 15, "unit": "100g"},

    # Féculents
    "riz": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "unit": "100g"},
    "pâtes": {"calories": 131, "protein": 5, "carbs": 25, "fat": 1.1, "unit": "100g"},
    "pain": {"calories": 265, "protein": 9, "carbs": 49, "fat": 3.2, "unit": "100g"},
    "pomme de terre": {"calories": 77, "protein": 2, "carbs": 17, "fat": 0.1, "unit": "100g"},

    # Légumes
    "salade": {"calories": 15, "protein": 1.4, "carbs": 2.9, "fat": 0.2, "unit": "100g"},
    "tomate": {"calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2, "unit": "100g"},
    "carotte": {"calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2, "unit": "100g"},
    "brocoli": {"calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4, "unit": "100g"},

    # Produits laitiers
    "yaourt": {"calories": 59, "protein": 10, "carbs": 3.6, "fat": 0.7, "unit": "100g"},
    "fromage": {"calories": 402, "protein": 25, "carbs": 1.3, "fat": 33, "unit": "100g"},
    "lait": {"calories": 42, "protein": 3.4, "carbs": 5, "fat": 1, "unit": "100ml"},
}


def validate_nutrition(item: FoodItem) -> FoodItem:
    """Valide et corrige les valeurs nutritionnelles si aberrantes."""
    name_lower = item.name.lower()

    # Chercher une correspondance dans la référence
    for ref_name, ref_values in NUTRITION_REFERENCE.items():
        if ref_name in name_lower:
            # Vérifier si les valeurs sont plausibles (tolérance de 50%)
            if item.calories > ref_values["calories"] * 3:
                # Valeur aberrante, utiliser la référence
                try:
                    qty = float(item.quantity)
                    factor = qty / 100 if item.unit == "g" else 1
                except ValueError:
                    factor = 1

                return FoodItem(
                    name=item.name,
                    quantity=item.quantity,
                    unit=item.unit,
                    calories=int(ref_values["calories"] * factor),
                    protein=ref_values["protein"] * factor,
                    carbs=ref_values["carbs"] * factor,
                    fat=ref_values["fat"] * factor,
                    confidence=item.confidence * 0.8,  # Réduire la confiance
                )
            break

    return item


def get_vision_agent() -> VisionAgent:
    """Retourne une instance de l'agent vision."""
    return VisionAgent()
