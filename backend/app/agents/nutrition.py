"""
Agent Nutrition - Estimation LLM des valeurs nutritionnelles.

Utilisé comme fallback quand USDA API ne trouve pas l'aliment.
Particulièrement utile pour :
- Plats composés (tagine, couscous, paella, etc.)
- Aliments régionaux/exotiques
- Recettes maison
- Plats de restaurant
"""

import json
import re
import structlog
from typing import Optional
from pydantic import BaseModel

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability
from app.llm.client import HuggingFaceClient, get_hf_client
from app.services.nutrition_database import NutritionData

logger = structlog.get_logger()


class NutritionEstimationInput(BaseModel):
    """Input pour estimation nutritionnelle."""

    food_name: str
    quantity_g: float = 100.0
    context: Optional[str] = None  # Ex: "plat marocain", "restaurant italien"


class NutritionAgent(BaseAgent[NutritionEstimationInput, NutritionData]):
    """Agent pour estimer les valeurs nutritionnelles via LLM."""

    name = "NutritionAgent"
    capability = ModelCapability.NUTRITION_ESTIMATION
    confidence_threshold = 0.6

    def build_prompt(self, input_data: NutritionEstimationInput) -> str:
        """Construit le prompt pour estimation nutritionnelle."""
        prompt = f"""Tu es un expert en nutrition. Estime les valeurs nutritionnelles pour l'aliment suivant.

**Aliment** : {input_data.food_name}
**Quantité** : {input_data.quantity_g}g
"""
        if input_data.context:
            prompt += f"**Contexte** : {input_data.context}\n"

        prompt += """
**Instructions** :
1. Estime les valeurs nutritionnelles pour la quantité donnée
2. Si c'est un plat composé, estime les ingrédients probables et leurs proportions
3. Fournis les valeurs TOTALES pour la portion spécifiée

**Format de réponse STRICT (JSON uniquement)** :
```json
{
  "calories": <nombre>,
  "protein_g": <nombre>,
  "carbs_g": <nombre>,
  "fat_g": <nombre>,
  "fiber_g": <nombre>,
  "confidence": <0.0-1.0>,
  "reasoning": "<explication brève>"
}
```

**Exemples** :
- Poulet grillé 150g → {"calories": 248, "protein_g": 46, "carbs_g": 0, "fat_g": 5, "fiber_g": 0, "confidence": 0.9}
- Tagine marocain 300g → {"calories": 420, "protein_g": 25, "carbs_g": 35, "fat_g": 18, "fiber_g": 6, "confidence": 0.7}

Réponds UNIQUEMENT avec le JSON, sans texte additionnel.
"""
        return prompt

    def parse_response(
        self, raw_response: str, input_data: NutritionEstimationInput
    ) -> NutritionData:
        """Parse la réponse JSON du LLM."""
        try:
            # Extraire JSON depuis la réponse (peut contenir du texte avant/après)
            json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
            if not json_match:
                logger.warning("nutrition_no_json_found", response=raw_response[:200])
                raise ValueError("No JSON found in response")

            json_str = json_match.group(0)
            data = json.loads(json_str)

            # Validation des champs requis
            required_fields = ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g"]
            if not all(field in data for field in required_fields):
                logger.warning("nutrition_missing_fields", data=data)
                raise ValueError(f"Missing required fields: {required_fields}")

            # Créer NutritionData
            return NutritionData(
                food_name=input_data.food_name,
                calories=float(data["calories"]),
                protein=float(data["protein_g"]),
                carbs=float(data["carbs_g"]),
                fat=float(data["fat_g"]),
                fiber=float(data["fiber_g"]),
                source="llm",
                confidence=min(float(data.get("confidence", 0.7)), 0.85),  # Cap à 0.85 pour LLM
                portion_size_g=input_data.quantity_g,
            )

        except json.JSONDecodeError as e:
            logger.error("nutrition_json_decode_error", error=str(e), response=raw_response[:200])
            raise
        except (ValueError, KeyError) as e:
            logger.error("nutrition_value_error", error=str(e))
            raise

    def calculate_confidence(self, result: NutritionData, raw_response: str) -> float:
        """Calcule le score de confiance."""
        # Le score de confiance vient du LLM lui-même
        # On cap à 0.85 car les LLMs peuvent être trop confiants
        return min(result.confidence, 0.85)

    def deterministic_fallback(self, input_data: NutritionEstimationInput) -> NutritionData:
        """
        Fallback : Valeurs par défaut basées sur des moyennes.

        Utilisé quand LLM échoue.
        """
        logger.warning("nutrition_agent_fallback", food=input_data.food_name)

        # Valeurs par défaut conservatrices (aliment moyen)
        factor = input_data.quantity_g / 100.0

        return NutritionData(
            food_name=input_data.food_name,
            calories=150 * factor,  # 150 kcal/100g (moyenne)
            protein=8 * factor,
            carbs=20 * factor,
            fat=4 * factor,
            fiber=2 * factor,
            source="default",
            confidence=0.3,  # Très faible confiance
            portion_size_g=input_data.quantity_g,
        )


# Helper function pour utilisation externe
async def estimate_nutrition_llm(
    food_name: str, quantity_g: float = 100.0, context: Optional[str] = None
) -> Optional[NutritionData]:
    """
    Estime les valeurs nutritionnelles via LLM.

    Args:
        food_name: Nom de l'aliment
        quantity_g: Quantité en grammes
        context: Contexte additionnel (optionnel)

    Returns:
        NutritionData si succès, None sinon
    """
    client = get_hf_client()
    agent = NutritionAgent(client)

    input_data = NutritionEstimationInput(
        food_name=food_name, quantity_g=quantity_g, context=context
    )

    response = await agent.process(input_data)

    # Seulement retourner si confiance > seuil
    if response.confidence >= agent.confidence_threshold:
        return response.result

    return None
