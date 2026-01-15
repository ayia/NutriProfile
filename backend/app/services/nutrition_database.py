"""
Service pour rechercher les informations nutritionnelles dans différentes sources.

Sources (par ordre de priorité) :
1. USDA FoodData Central API (300,000 aliments, gratuit)
2. Agent LLM Nutrition (HuggingFace, pour plats composés/exotiques)
3. Saisie manuelle utilisateur (fallback ultime)
"""

import httpx
import structlog
from typing import Optional
from dataclasses import dataclass

from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


@dataclass
class NutritionData:
    """Données nutritionnelles standardisées (pour 100g)."""

    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    source: str  # "usda", "llm", "manual"
    confidence: float = 1.0
    portion_size_g: float = 100.0  # Taille de référence (100g par défaut)


class USDANutritionService:
    """Service pour interroger l'API USDA FoodData Central."""

    BASE_URL = "https://api.nal.usda.gov/fdc/v1"

    def __init__(self):
        self.api_key = settings.USDA_API_KEY
        self.client = httpx.AsyncClient(timeout=10.0)

    async def search_food(self, query: str, max_results: int = 5) -> list[NutritionData]:
        """
        Recherche un aliment dans la base USDA.

        Args:
            query: Nom de l'aliment (ex: "chicken breast", "riz", "pomme")
            max_results: Nombre maximum de résultats

        Returns:
            Liste de NutritionData trouvés
        """
        if not self.api_key:
            logger.warning("usda_api_key_missing", message="USDA API key not configured")
            return []

        try:
            url = f"{self.BASE_URL}/foods/search"
            params = {
                "query": query,
                "pageSize": max_results,
                "api_key": self.api_key,
            }

            logger.info("usda_search_request", query=query, max_results=max_results)

            response = await self.client.get(url, params=params)
            response.raise_for_status()

            data = response.json()
            foods = data.get("foods", [])

            logger.info("usda_search_response", query=query, results_count=len(foods))

            return [self._parse_food_item(food) for food in foods if self._parse_food_item(food)]

        except httpx.HTTPStatusError as e:
            logger.error("usda_http_error", status_code=e.response.status_code, error=str(e))
            return []
        except httpx.RequestError as e:
            logger.error("usda_request_error", error=str(e))
            return []
        except Exception as e:
            logger.error("usda_unexpected_error", error=str(e))
            return []

    def _parse_food_item(self, food_data: dict) -> Optional[NutritionData]:
        """
        Parse un aliment USDA en NutritionData.

        Exemple de structure USDA:
        {
          "fdcId": 171477,
          "description": "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
          "foodNutrients": [
            {"nutrientId": 1008, "nutrientName": "Energy", "value": 165, "unitName": "KCAL"},
            {"nutrientId": 1003, "nutrientName": "Protein", "value": 31, "unitName": "G"},
            ...
          ]
        }
        """
        try:
            description = food_data.get("description", "Unknown")
            nutrients = food_data.get("foodNutrients", [])

            # Mapping des nutrientId USDA
            nutrient_map = {
                "Energy": 0.0,          # 1008 - Calories (KCAL)
                "Protein": 0.0,         # 1003 - Protéines (G)
                "Carbohydrate, by difference": 0.0,  # 1005 - Glucides (G)
                "Total lipid (fat)": 0.0,  # 1004 - Lipides (G)
                "Fiber, total dietary": 0.0,  # 1079 - Fibres (G)
            }

            # Extraire les valeurs nutritionnelles
            for nutrient in nutrients:
                nutrient_name = nutrient.get("nutrientName", "")
                value = nutrient.get("value", 0.0)

                if nutrient_name in nutrient_map:
                    nutrient_map[nutrient_name] = float(value)

            # Vérifier qu'on a au moins les calories
            if nutrient_map["Energy"] == 0:
                logger.warning("usda_no_calories", food=description)
                return None

            return NutritionData(
                food_name=description,
                calories=nutrient_map["Energy"],
                protein=nutrient_map["Protein"],
                carbs=nutrient_map["Carbohydrate, by difference"],
                fat=nutrient_map["Total lipid (fat)"],
                fiber=nutrient_map["Fiber, total dietary"],
                source="usda",
                confidence=0.95,  # Haute confiance pour données USDA vérifiées
                portion_size_g=100.0,
            )

        except Exception as e:
            logger.error("usda_parse_error", error=str(e), food_data=food_data)
            return None

    async def close(self):
        """Ferme le client HTTP."""
        await self.client.aclose()


async def search_nutrition(food_name: str, quantity_g: float = 100.0) -> Optional[NutritionData]:
    """
    Recherche les informations nutritionnelles pour un aliment.

    Waterfall :
    1. USDA API (300k aliments, gratuit)
    2. (Future: Agent LLM pour plats composés)

    Args:
        food_name: Nom de l'aliment
        quantity_g: Quantité en grammes

    Returns:
        NutritionData si trouvé, None sinon
    """
    # 1. Essayer USDA API
    service = USDANutritionService()

    try:
        results = await service.search_food(food_name, max_results=1)

        if results:
            nutrition = results[0]

            # Ajuster pour la quantité demandée
            factor = quantity_g / nutrition.portion_size_g
            nutrition.calories *= factor
            nutrition.protein *= factor
            nutrition.carbs *= factor
            nutrition.fat *= factor
            nutrition.fiber *= factor
            nutrition.portion_size_g = quantity_g

            logger.info(
                "nutrition_found",
                food=food_name,
                source="usda",
                calories=nutrition.calories,
            )

            return nutrition

        logger.warning("nutrition_not_found", food=food_name)
        return None

    finally:
        await service.close()
