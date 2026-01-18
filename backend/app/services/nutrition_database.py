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


# =====================================================
# FOOD TRANSLATION FOR USDA LOOKUP
# =====================================================

# Translation dictionary: language -> food name -> English equivalent
FOOD_TRANSLATIONS: dict[str, dict[str, str]] = {
    "fr": {
        # Proteins
        "poulet": "chicken",
        "boeuf": "beef",
        "porc": "pork",
        "agneau": "lamb",
        "saumon": "salmon",
        "thon": "tuna",
        "crevette": "shrimp",
        "crevettes": "shrimp",
        "oeuf": "egg",
        "oeufs": "eggs",
        "dinde": "turkey",
        "canard": "duck",
        "jambon": "ham",
        "bacon": "bacon",
        # Grains
        "riz": "rice",
        "pates": "pasta",
        "pâtes": "pasta",
        "pain": "bread",
        "quinoa": "quinoa",
        "avoine": "oats",
        "couscous": "couscous",
        # Vegetables
        "tomate": "tomato",
        "tomates": "tomatoes",
        "carotte": "carrot",
        "carottes": "carrots",
        "brocoli": "broccoli",
        "épinard": "spinach",
        "épinards": "spinach",
        "salade": "lettuce",
        "laitue": "lettuce",
        "courgette": "zucchini",
        "aubergine": "eggplant",
        "poivron": "bell pepper",
        "oignon": "onion",
        "ail": "garlic",
        "champignon": "mushroom",
        "champignons": "mushrooms",
        "haricots verts": "green beans",
        "pomme de terre": "potato",
        "pommes de terre": "potatoes",
        "patate douce": "sweet potato",
        # Fruits
        "pomme": "apple",
        "banane": "banana",
        "orange": "orange",
        "fraise": "strawberry",
        "fraises": "strawberries",
        "raisin": "grape",
        "raisins": "grapes",
        "mangue": "mango",
        "ananas": "pineapple",
        "poire": "pear",
        "pêche": "peach",
        "abricot": "apricot",
        "cerise": "cherry",
        "cerises": "cherries",
        "melon": "melon",
        "pasteque": "watermelon",
        "pastèque": "watermelon",
        "citron": "lemon",
        # Dairy
        "lait": "milk",
        "fromage": "cheese",
        "yaourt": "yogurt",
        "beurre": "butter",
        "crème": "cream",
        # Legumes
        "lentilles": "lentils",
        "pois chiches": "chickpeas",
        "haricots": "beans",
        "haricots rouges": "red beans",
        "haricots blancs": "white beans",
        # Nuts
        "amande": "almond",
        "amandes": "almonds",
        "noix": "walnut",
        "cacahuète": "peanut",
        "cacahuètes": "peanuts",
        "noisette": "hazelnut",
        "noisettes": "hazelnuts",
    },
    "de": {
        "huhn": "chicken",
        "hähnchen": "chicken",
        "rindfleisch": "beef",
        "schweinefleisch": "pork",
        "lachs": "salmon",
        "reis": "rice",
        "nudeln": "pasta",
        "brot": "bread",
        "tomate": "tomato",
        "karotte": "carrot",
        "brokkoli": "broccoli",
        "spinat": "spinach",
        "apfel": "apple",
        "banane": "banana",
        "milch": "milk",
        "käse": "cheese",
        "ei": "egg",
        "eier": "eggs",
    },
    "es": {
        "pollo": "chicken",
        "carne de res": "beef",
        "cerdo": "pork",
        "salmon": "salmon",
        "salmón": "salmon",
        "arroz": "rice",
        "pasta": "pasta",
        "pan": "bread",
        "tomate": "tomato",
        "zanahoria": "carrot",
        "brocoli": "broccoli",
        "brócoli": "broccoli",
        "espinaca": "spinach",
        "manzana": "apple",
        "platano": "banana",
        "plátano": "banana",
        "leche": "milk",
        "queso": "cheese",
        "huevo": "egg",
        "huevos": "eggs",
    },
    "pt": {
        "frango": "chicken",
        "carne bovina": "beef",
        "porco": "pork",
        "salmao": "salmon",
        "salmão": "salmon",
        "arroz": "rice",
        "massa": "pasta",
        "pao": "bread",
        "pão": "bread",
        "tomate": "tomato",
        "cenoura": "carrot",
        "brocolis": "broccoli",
        "brócolis": "broccoli",
        "espinafre": "spinach",
        "maca": "apple",
        "maçã": "apple",
        "banana": "banana",
        "leite": "milk",
        "queijo": "cheese",
        "ovo": "egg",
        "ovos": "eggs",
    },
    "zh": {
        "鸡肉": "chicken",
        "牛肉": "beef",
        "猪肉": "pork",
        "三文鱼": "salmon",
        "米饭": "rice",
        "面条": "noodles",
        "面包": "bread",
        "番茄": "tomato",
        "西红柿": "tomato",
        "胡萝卜": "carrot",
        "西兰花": "broccoli",
        "菠菜": "spinach",
        "苹果": "apple",
        "香蕉": "banana",
        "牛奶": "milk",
        "奶酪": "cheese",
        "鸡蛋": "egg",
    },
    "ar": {
        "دجاج": "chicken",
        "لحم بقر": "beef",
        "لحم خنزير": "pork",
        "سلمون": "salmon",
        "أرز": "rice",
        "معكرونة": "pasta",
        "خبز": "bread",
        "طماطم": "tomato",
        "جزر": "carrot",
        "بروكلي": "broccoli",
        "سبانخ": "spinach",
        "تفاح": "apple",
        "موز": "banana",
        "حليب": "milk",
        "جبن": "cheese",
        "بيض": "egg",
    },
}


def translate_food_to_english(food_name: str, language: str = "en") -> tuple[str, bool]:
    """
    Translate a food name to English for USDA lookup.

    Args:
        food_name: Food name in any supported language
        language: Source language code (fr, de, es, pt, zh, ar)

    Returns:
        Tuple of (english_name, was_translated)
    """
    if language == "en":
        return food_name, False

    food_lower = food_name.lower().strip()
    translations = FOOD_TRANSLATIONS.get(language, {})

    if food_lower in translations:
        return translations[food_lower], True

    # Try partial match for compound foods
    for source, english in translations.items():
        if source in food_lower:
            return english, True

    # No translation found, return original
    return food_name, False


@dataclass
class USDAValidationResult:
    """Result of USDA validation for a detected food item."""
    found: bool
    original_name: str
    usda_food_name: str | None = None
    english_query: str | None = None
    was_translated: bool = False
    calories: float | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None
    fiber: float | None = None
    confidence: float = 0.0


async def validate_against_usda(
    food_name: str,
    quantity_g: float,
    language: str = "en"
) -> USDAValidationResult:
    """
    Validate a food item against USDA database with translation support.

    Args:
        food_name: Food name (in user's language)
        quantity_g: Quantity in grams
        language: User's language code

    Returns:
        USDAValidationResult with nutrition data if found
    """
    # Translate to English if needed
    english_name, was_translated = translate_food_to_english(food_name, language)

    service = USDANutritionService()
    try:
        # Search USDA with English name
        results = await service.search_food(english_name, max_results=1)

        if results:
            nutrition = results[0]

            # Adjust for quantity
            factor = quantity_g / nutrition.portion_size_g

            return USDAValidationResult(
                found=True,
                original_name=food_name,
                usda_food_name=nutrition.food_name,
                english_query=english_name if was_translated else None,
                was_translated=was_translated,
                calories=nutrition.calories * factor,
                protein=nutrition.protein * factor,
                carbs=nutrition.carbs * factor,
                fat=nutrition.fat * factor,
                fiber=nutrition.fiber * factor,
                confidence=0.95,
            )

        # Not found - try original name if it was translated
        if was_translated:
            results = await service.search_food(food_name, max_results=1)
            if results:
                nutrition = results[0]
                factor = quantity_g / nutrition.portion_size_g

                return USDAValidationResult(
                    found=True,
                    original_name=food_name,
                    usda_food_name=nutrition.food_name,
                    english_query=None,
                    was_translated=False,
                    calories=nutrition.calories * factor,
                    protein=nutrition.protein * factor,
                    carbs=nutrition.carbs * factor,
                    fat=nutrition.fat * factor,
                    fiber=nutrition.fiber * factor,
                    confidence=0.95,
                )

        return USDAValidationResult(
            found=False,
            original_name=food_name,
            english_query=english_name if was_translated else None,
            was_translated=was_translated,
        )

    except Exception as e:
        logger.error("usda_validation_error", food=food_name, error=str(e))
        return USDAValidationResult(found=False, original_name=food_name)

    finally:
        await service.close()


async def validate_detected_items_batch(
    items: list[dict],
    language: str = "en"
) -> list[dict]:
    """
    Validate a batch of detected food items against USDA.

    This function is called after VLM analysis to verify/enhance nutrition values.

    Args:
        items: List of detected items from VLM (dicts with name, quantity, unit, etc.)
        language: User's language code

    Returns:
        List of items with updated source and verification status
    """
    validated_items = []

    for item in items:
        name = item.get("name", "")
        quantity_str = item.get("quantity", "100")
        unit = item.get("unit", "g")

        # Parse quantity
        try:
            quantity = float(quantity_str)
        except (ValueError, TypeError):
            quantity = 100.0

        # Convert to grams if needed (rough estimation)
        quantity_g = quantity
        if unit == "ml":
            quantity_g = quantity  # Approximate 1ml = 1g for liquids
        elif unit in ("portion", "piece"):
            quantity_g = quantity * 100  # Rough estimate

        # Validate against USDA
        result = await validate_against_usda(name, quantity_g, language)

        # Create updated item
        updated_item = item.copy()

        if result.found:
            # Update with USDA verified values
            updated_item["calories"] = int(result.calories or 0)
            updated_item["protein"] = round(result.protein or 0, 1)
            updated_item["carbs"] = round(result.carbs or 0, 1)
            updated_item["fat"] = round(result.fat or 0, 1)
            updated_item["source"] = "usda_translation" if result.was_translated else "usda_verified"
            updated_item["usda_food_name"] = result.usda_food_name
            updated_item["original_name"] = result.original_name if result.was_translated else None
            updated_item["needs_verification"] = False
            # Boost confidence for USDA verified items
            original_confidence = item.get("confidence", 0.7)
            updated_item["confidence"] = max(original_confidence, 0.9)

            logger.info(
                "usda_item_validated",
                original=name,
                usda_name=result.usda_food_name,
                translated=result.was_translated,
                source=updated_item["source"],
            )
        else:
            # Keep AI estimation but mark as needing verification
            updated_item["source"] = "ai_estimated"
            updated_item["needs_verification"] = item.get("confidence", 0.7) < 0.7
            updated_item["usda_food_name"] = None
            updated_item["original_name"] = None

            logger.info(
                "usda_item_not_found",
                name=name,
                needs_verification=updated_item["needs_verification"],
            )

        validated_items.append(updated_item)

    return validated_items
