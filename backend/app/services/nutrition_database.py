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
# Extended with 200+ foods including Moroccan/Mediterranean dishes
FOOD_TRANSLATIONS: dict[str, dict[str, str]] = {
    "fr": {
        # ============ PROTÉINES ============
        # Viandes
        "poulet": "chicken",
        "poulet grillé": "grilled chicken",
        "poulet rôti": "roasted chicken",
        "blanc de poulet": "chicken breast",
        "cuisse de poulet": "chicken thigh",
        "aile de poulet": "chicken wing",
        "boeuf": "beef",
        "steak": "beef steak",
        "steak haché": "ground beef",
        "viande hachée": "ground beef",
        "boeuf bourguignon": "beef stew",
        "porc": "pork",
        "côtelette de porc": "pork chop",
        "filet de porc": "pork tenderloin",
        "agneau": "lamb",
        "gigot d'agneau": "leg of lamb",
        "côtelette d'agneau": "lamb chop",
        "veau": "veal",
        "escalope de veau": "veal cutlet",
        "dinde": "turkey",
        "escalope de dinde": "turkey breast",
        "canard": "duck",
        "magret de canard": "duck breast",
        "jambon": "ham",
        "bacon": "bacon",
        "saucisse": "sausage",
        "saucisses": "sausage",
        "merguez": "lamb sausage",
        "chipolata": "pork sausage",
        # Poissons & Fruits de mer
        "saumon": "salmon",
        "saumon fumé": "smoked salmon",
        "filet de saumon": "salmon fillet",
        "thon": "tuna",
        "thon en boîte": "canned tuna",
        "sardine": "sardine",
        "sardines": "sardines",
        "maquereau": "mackerel",
        "cabillaud": "cod",
        "morue": "cod",
        "sole": "sole fish",
        "bar": "sea bass",
        "loup de mer": "sea bass",
        "dorade": "sea bream",
        "truite": "trout",
        "hareng": "herring",
        "anchois": "anchovy",
        "crevette": "shrimp",
        "crevettes": "shrimp",
        "gambas": "prawns",
        "langoustine": "langoustine",
        "homard": "lobster",
        "crabe": "crab",
        "moule": "mussel",
        "moules": "mussels",
        "huître": "oyster",
        "huîtres": "oysters",
        "calamar": "squid",
        "calamars": "squid",
        "poulpe": "octopus",
        "fruits de mer": "seafood",
        # Oeufs
        "oeuf": "egg",
        "oeufs": "eggs",
        "œuf": "egg",
        "œufs": "eggs",
        "oeuf dur": "hard boiled egg",
        "oeufs brouillés": "scrambled eggs",
        "omelette": "omelette",
        "oeuf au plat": "fried egg",
        # ============ FÉCULENTS ============
        # Céréales & Grains
        "riz": "rice",
        "riz blanc": "white rice",
        "riz complet": "brown rice",
        "riz basmati": "basmati rice",
        "riz pilaf": "rice pilaf",
        "pates": "pasta",
        "pâtes": "pasta",
        "spaghetti": "spaghetti",
        "spaghettis": "spaghetti",
        "tagliatelles": "tagliatelle",
        "penne": "penne pasta",
        "fusilli": "fusilli pasta",
        "macaroni": "macaroni",
        "lasagne": "lasagna",
        "lasagnes": "lasagna",
        "ravioli": "ravioli",
        "raviolis": "ravioli",
        "gnocchi": "gnocchi",
        "nouilles": "noodles",
        "vermicelles": "vermicelli",
        "quinoa": "quinoa",
        "boulgour": "bulgur",
        "semoule": "semolina",
        "couscous": "couscous",
        "avoine": "oats",
        "flocons d'avoine": "oatmeal",
        "porridge": "oatmeal",
        "orge": "barley",
        "épeautre": "spelt",
        "millet": "millet",
        "sarrasin": "buckwheat",
        "blé": "wheat",
        # Pain & Boulangerie
        "pain": "bread",
        "pain blanc": "white bread",
        "pain complet": "whole wheat bread",
        "pain de mie": "sandwich bread",
        "baguette": "french baguette",
        "croissant": "croissant",
        "brioche": "brioche",
        "pain au chocolat": "chocolate croissant",
        "tartine": "toast with spread",
        "toast": "toast",
        "muffin": "muffin",
        "pancake": "pancake",
        "crêpe": "crepe",
        "crêpes": "crepes",
        "gaufre": "waffle",
        "gaufres": "waffles",
        # Pommes de terre
        "pomme de terre": "potato",
        "pommes de terre": "potatoes",
        "patate": "potato",
        "patates": "potatoes",
        "purée": "mashed potatoes",
        "purée de pommes de terre": "mashed potatoes",
        "frites": "french fries",
        "pommes frites": "french fries",
        "patate douce": "sweet potato",
        "patates douces": "sweet potatoes",
        "gratin dauphinois": "potato gratin",
        "pommes sautées": "sauteed potatoes",
        "pommes rissolées": "hash browns",
        # ============ LÉGUMES ============
        # Légumes verts
        "salade": "lettuce",
        "laitue": "lettuce",
        "épinard": "spinach",
        "épinards": "spinach",
        "brocoli": "broccoli",
        "chou": "cabbage",
        "chou-fleur": "cauliflower",
        "chou rouge": "red cabbage",
        "chou de bruxelles": "brussels sprouts",
        "kale": "kale",
        "roquette": "arugula",
        "cresson": "watercress",
        "mâche": "lamb's lettuce",
        "endive": "endive",
        "blette": "swiss chard",
        "asperge": "asparagus",
        "asperges": "asparagus",
        "artichaut": "artichoke",
        "haricots verts": "green beans",
        "haricot vert": "green beans",
        "petit pois": "green peas",
        "petits pois": "green peas",
        "pois": "peas",
        "fève": "fava beans",
        "fèves": "fava beans",
        # Légumes racines
        "carotte": "carrot",
        "carottes": "carrots",
        "navet": "turnip",
        "radis": "radish",
        "betterave": "beet",
        "céleri": "celery",
        "céleri-rave": "celeriac",
        "panais": "parsnip",
        "topinambour": "jerusalem artichoke",
        # Légumes fruits
        "tomate": "tomato",
        "tomates": "tomatoes",
        "tomate cerise": "cherry tomato",
        "tomates cerises": "cherry tomatoes",
        "courgette": "zucchini",
        "courgettes": "zucchini",
        "aubergine": "eggplant",
        "aubergines": "eggplant",
        "poivron": "bell pepper",
        "poivron rouge": "red bell pepper",
        "poivron vert": "green bell pepper",
        "poivron jaune": "yellow bell pepper",
        "piment": "chili pepper",
        "concombre": "cucumber",
        "avocat": "avocado",
        "avocats": "avocados",
        "courge": "squash",
        "butternut": "butternut squash",
        "potiron": "pumpkin",
        "citrouille": "pumpkin",
        # Alliacés & Aromatiques
        "oignon": "onion",
        "oignons": "onions",
        "échalote": "shallot",
        "ail": "garlic",
        "poireau": "leek",
        "poireaux": "leeks",
        "ciboulette": "chives",
        "persil": "parsley",
        "coriandre": "cilantro",
        "menthe": "mint",
        "basilic": "basil",
        # Champignons
        "champignon": "mushroom",
        "champignons": "mushrooms",
        "champignon de paris": "white mushroom",
        "shiitake": "shiitake mushroom",
        "pleurote": "oyster mushroom",
        "cèpe": "porcini mushroom",
        "truffe": "truffle",
        # ============ FRUITS ============
        # Fruits courants
        "pomme": "apple",
        "pommes": "apples",
        "banane": "banana",
        "bananes": "bananas",
        "orange": "orange",
        "oranges": "oranges",
        "clémentine": "clementine",
        "mandarine": "tangerine",
        "pamplemousse": "grapefruit",
        "citron": "lemon",
        "citron vert": "lime",
        "poire": "pear",
        "poires": "pears",
        "pêche": "peach",
        "pêches": "peaches",
        "nectarine": "nectarine",
        "abricot": "apricot",
        "abricots": "apricots",
        "prune": "plum",
        "prunes": "plums",
        "cerise": "cherry",
        "cerises": "cherries",
        "raisin": "grape",
        "raisins": "grapes",
        "raisin sec": "raisin",
        "raisins secs": "raisins",
        "datte": "date",
        "dattes": "dates",
        "figue": "fig",
        "figues": "figs",
        # Fruits exotiques
        "mangue": "mango",
        "mangues": "mangoes",
        "ananas": "pineapple",
        "papaye": "papaya",
        "kiwi": "kiwi",
        "kiwis": "kiwis",
        "grenade": "pomegranate",
        "litchi": "lychee",
        "fruit de la passion": "passion fruit",
        "noix de coco": "coconut",
        "goyave": "guava",
        # Baies
        "fraise": "strawberry",
        "fraises": "strawberries",
        "framboise": "raspberry",
        "framboises": "raspberries",
        "myrtille": "blueberry",
        "myrtilles": "blueberries",
        "mûre": "blackberry",
        "mûres": "blackberries",
        "cassis": "blackcurrant",
        "groseille": "redcurrant",
        # Melons
        "melon": "melon",
        "melon cantaloup": "cantaloupe",
        "pasteque": "watermelon",
        "pastèque": "watermelon",
        # ============ PRODUITS LAITIERS ============
        "lait": "milk",
        "lait entier": "whole milk",
        "lait demi-écrémé": "semi-skimmed milk",
        "lait écrémé": "skim milk",
        "lait d'amande": "almond milk",
        "lait de soja": "soy milk",
        "lait de coco": "coconut milk",
        "fromage": "cheese",
        "emmental": "swiss cheese",
        "gruyère": "gruyere cheese",
        "comté": "comte cheese",
        "camembert": "camembert cheese",
        "brie": "brie cheese",
        "roquefort": "blue cheese",
        "chèvre": "goat cheese",
        "fromage de chèvre": "goat cheese",
        "mozzarella": "mozzarella",
        "parmesan": "parmesan cheese",
        "feta": "feta cheese",
        "ricotta": "ricotta cheese",
        "mascarpone": "mascarpone",
        "fromage blanc": "fromage blanc",
        "yaourt": "yogurt",
        "yogourt": "yogurt",
        "yaourt grec": "greek yogurt",
        "beurre": "butter",
        "crème": "cream",
        "crème fraîche": "sour cream",
        "crème liquide": "heavy cream",
        "crème chantilly": "whipped cream",
        # ============ LÉGUMINEUSES ============
        "lentilles": "lentils",
        "lentilles vertes": "green lentils",
        "lentilles corail": "red lentils",
        "pois chiches": "chickpeas",
        "pois chiche": "chickpeas",
        "haricots": "beans",
        "haricots rouges": "red kidney beans",
        "haricots blancs": "white beans",
        "haricots noirs": "black beans",
        "flageolets": "flageolet beans",
        "fèves": "fava beans",
        "edamame": "edamame",
        "soja": "soybean",
        "tofu": "tofu",
        "tempeh": "tempeh",
        "houmous": "hummus",
        "hummus": "hummus",
        # ============ FRUITS À COQUE & GRAINES ============
        "amande": "almond",
        "amandes": "almonds",
        "noix": "walnut",
        "noix de cajou": "cashew",
        "cacahuète": "peanut",
        "cacahuètes": "peanuts",
        "arachide": "peanut",
        "arachides": "peanuts",
        "noisette": "hazelnut",
        "noisettes": "hazelnuts",
        "pistache": "pistachio",
        "pistaches": "pistachios",
        "noix de pécan": "pecan",
        "noix du brésil": "brazil nut",
        "noix de macadamia": "macadamia nut",
        "pignon de pin": "pine nut",
        "graine de tournesol": "sunflower seed",
        "graines de tournesol": "sunflower seeds",
        "graine de courge": "pumpkin seed",
        "graines de courge": "pumpkin seeds",
        "graine de chia": "chia seed",
        "graines de chia": "chia seeds",
        "graine de lin": "flax seed",
        "graines de lin": "flax seeds",
        "sésame": "sesame",
        "graines de sésame": "sesame seeds",
        # ============ HUILES & MATIÈRES GRASSES ============
        "huile": "oil",
        "huile d'olive": "olive oil",
        "huile de tournesol": "sunflower oil",
        "huile de colza": "canola oil",
        "huile de coco": "coconut oil",
        "huile de sésame": "sesame oil",
        "mayonnaise": "mayonnaise",
        "vinaigrette": "vinaigrette",
        # ============ PLATS CUISINÉS ============
        # Plats français
        "ratatouille": "ratatouille vegetables",
        "quiche": "quiche",
        "quiche lorraine": "quiche lorraine",
        "gratin": "gratin",
        "cassoulet": "cassoulet beans",
        "pot-au-feu": "beef stew",
        "blanquette de veau": "veal stew",
        "coq au vin": "chicken stew",
        "boeuf bourguignon": "beef stew",
        "tartiflette": "potato gratin with cheese",
        "choucroute": "sauerkraut with meat",
        "croque-monsieur": "grilled ham and cheese sandwich",
        "salade niçoise": "nicoise salad",
        "salade composée": "mixed salad",
        "soupe": "soup",
        "potage": "soup",
        "velouté": "cream soup",
        "bouillon": "broth",
        # Plats méditerranéens
        "pizza": "pizza",
        "risotto": "risotto",
        "carpaccio": "carpaccio beef",
        "bruschetta": "bruschetta",
        "minestrone": "minestrone soup",
        "pesto": "pesto sauce",
        "tzatziki": "tzatziki",
        "falafel": "falafel",
        "taboulé": "tabbouleh",
        "moussaka": "moussaka",
        "dolma": "stuffed grape leaves",
        "kebab": "kebab",
        "shawarma": "shawarma",
        "gyros": "gyros",
        # Plats asiatiques
        "sushi": "sushi",
        "sashimi": "sashimi",
        "maki": "sushi roll",
        "ramen": "ramen noodles",
        "pho": "pho soup",
        "pad thai": "pad thai",
        "curry": "curry",
        "riz cantonais": "fried rice",
        "riz sauté": "fried rice",
        "nouilles sautées": "stir fried noodles",
        "nems": "spring rolls",
        "rouleau de printemps": "spring roll",
        "dim sum": "dim sum",
        "wok": "stir fry",
        "poulet tikka": "chicken tikka",
        "butter chicken": "butter chicken",
        "biryani": "biryani rice",
        "naan": "naan bread",
        "samosa": "samosa",
        "daal": "lentil curry",
        # Plats américains
        "hamburger": "hamburger",
        "burger": "hamburger",
        "cheeseburger": "cheeseburger",
        "hot dog": "hot dog",
        "wrap": "wrap",
        "burrito": "burrito",
        "tacos": "tacos",
        "quesadilla": "quesadilla",
        "nachos": "nachos with cheese",
        "sandwich": "sandwich",
        "club sandwich": "club sandwich",
        "bagel": "bagel",
        "bowl": "bowl",
        "poke bowl": "poke bowl",
        "buddha bowl": "buddha bowl",
        # ============ PLATS MAROCAINS & MAGHREBINS ============
        "tagine": "lamb stew",
        "tajine": "lamb stew",
        "tagine de poulet": "chicken stew",
        "tagine d'agneau": "lamb stew",
        "couscous royal": "couscous with meat",
        "couscous aux légumes": "vegetable couscous",
        "pastilla": "chicken pastry pie",
        "bastilla": "chicken pastry pie",
        "harira": "moroccan soup",
        "bissara": "fava bean soup",
        "msemen": "moroccan flatbread",
        "meloui": "moroccan pancake",
        "baghrir": "moroccan crepe",
        "mille trous": "moroccan crepe",
        "rfissa": "chicken with lentils",
        "tanjia": "slow cooked beef",
        "kefta": "ground meat balls",
        "brochettes": "meat skewers",
        "mechoui": "roasted lamb",
        "zaalouk": "eggplant salad",
        "taktouka": "pepper and tomato salad",
        "chakhchoukha": "bread with meat sauce",
        "chorba": "soup",
        "brick": "fried pastry with egg",
        "mhadjeb": "stuffed flatbread",
        "makroud": "semolina date cookie",
        "chebakia": "fried pastry with honey",
        "sellou": "almond flour sweet",
        "ghriba": "moroccan cookie",
        "cornes de gazelle": "almond pastry",
        "beghrir": "moroccan pancake",
        "khobz": "moroccan bread",
        "batbout": "moroccan pita bread",
        "matlouh": "algerian bread",
        # ============ BOISSONS ============
        "eau": "water",
        "café": "coffee",
        "thé": "tea",
        "thé à la menthe": "mint tea",
        "jus d'orange": "orange juice",
        "jus de pomme": "apple juice",
        "smoothie": "smoothie",
        "soda": "soda",
        "coca": "cola",
        "limonade": "lemonade",
        "vin": "wine",
        "bière": "beer",
        # ============ DESSERTS & SUCRERIES ============
        "chocolat": "chocolate",
        "chocolat noir": "dark chocolate",
        "chocolat au lait": "milk chocolate",
        "gâteau": "cake",
        "tarte": "pie",
        "tarte aux pommes": "apple pie",
        "cheesecake": "cheesecake",
        "mousse au chocolat": "chocolate mousse",
        "crème brûlée": "creme brulee",
        "tiramisu": "tiramisu",
        "glace": "ice cream",
        "sorbet": "sorbet",
        "biscuit": "cookie",
        "biscuits": "cookies",
        "macaron": "macaron",
        "éclair": "eclair",
        "miel": "honey",
        "confiture": "jam",
        "sirop d'érable": "maple syrup",
        "sucre": "sugar",
        # ============ CONDIMENTS & SAUCES ============
        "sel": "salt",
        "poivre": "pepper",
        "moutarde": "mustard",
        "ketchup": "ketchup",
        "sauce soja": "soy sauce",
        "vinaigre": "vinegar",
        "vinaigre balsamique": "balsamic vinegar",
        "sauce tomate": "tomato sauce",
        "harissa": "harissa paste",
        "ras el hanout": "moroccan spice mix",
    },
    "de": {
        # Protéines
        "huhn": "chicken",
        "hähnchen": "chicken",
        "hühnerbrust": "chicken breast",
        "rindfleisch": "beef",
        "steak": "beef steak",
        "hackfleisch": "ground beef",
        "schweinefleisch": "pork",
        "schnitzel": "schnitzel pork",
        "lamm": "lamb",
        "kalb": "veal",
        "pute": "turkey",
        "ente": "duck",
        "schinken": "ham",
        "speck": "bacon",
        "wurst": "sausage",
        "bratwurst": "bratwurst",
        "lachs": "salmon",
        "thunfisch": "tuna",
        "forelle": "trout",
        "kabeljau": "cod",
        "garnele": "shrimp",
        "garnelen": "shrimp",
        "ei": "egg",
        "eier": "eggs",
        # Féculents
        "reis": "rice",
        "nudeln": "pasta",
        "spaghetti": "spaghetti",
        "brot": "bread",
        "brötchen": "bread roll",
        "vollkornbrot": "whole wheat bread",
        "kartoffel": "potato",
        "kartoffeln": "potatoes",
        "pommes": "french fries",
        "kartoffelpüree": "mashed potatoes",
        "süßkartoffel": "sweet potato",
        "haferflocken": "oatmeal",
        # Légumes
        "tomate": "tomato",
        "tomaten": "tomatoes",
        "karotte": "carrot",
        "karotten": "carrots",
        "möhre": "carrot",
        "brokkoli": "broccoli",
        "spinat": "spinach",
        "salat": "lettuce",
        "kopfsalat": "lettuce",
        "gurke": "cucumber",
        "zucchini": "zucchini",
        "aubergine": "eggplant",
        "paprika": "bell pepper",
        "zwiebel": "onion",
        "knoblauch": "garlic",
        "pilz": "mushroom",
        "pilze": "mushrooms",
        "champignon": "mushroom",
        "kohl": "cabbage",
        "blumenkohl": "cauliflower",
        "rosenkohl": "brussels sprouts",
        # Fruits
        "apfel": "apple",
        "äpfel": "apples",
        "banane": "banana",
        "orange": "orange",
        "zitrone": "lemon",
        "birne": "pear",
        "pfirsich": "peach",
        "kirsche": "cherry",
        "erdbeere": "strawberry",
        "erdbeeren": "strawberries",
        "himbeere": "raspberry",
        "heidelbeere": "blueberry",
        "traube": "grape",
        "trauben": "grapes",
        "mango": "mango",
        "ananas": "pineapple",
        "wassermelone": "watermelon",
        "melone": "melon",
        "kiwi": "kiwi",
        # Produits laitiers
        "milch": "milk",
        "käse": "cheese",
        "joghurt": "yogurt",
        "butter": "butter",
        "sahne": "cream",
        "quark": "quark",
        # Légumineuses
        "linsen": "lentils",
        "kichererbsen": "chickpeas",
        "bohnen": "beans",
        "tofu": "tofu",
        # Noix
        "mandel": "almond",
        "mandeln": "almonds",
        "walnuss": "walnut",
        "haselnuss": "hazelnut",
        "erdnuss": "peanut",
        # Plats
        "suppe": "soup",
        "gulasch": "goulash",
        "currywurst": "curry sausage",
        "döner": "doner kebab",
        "pizza": "pizza",
        "burger": "hamburger",
        "sandwich": "sandwich",
        # Desserts
        "kuchen": "cake",
        "torte": "cake",
        "schokolade": "chocolate",
        "eis": "ice cream",
        "honig": "honey",
    },
    "es": {
        # Protéines
        "pollo": "chicken",
        "pechuga de pollo": "chicken breast",
        "pollo asado": "roasted chicken",
        "carne": "meat",
        "carne de res": "beef",
        "carne de vaca": "beef",
        "bistec": "beef steak",
        "carne molida": "ground beef",
        "cerdo": "pork",
        "chuleta de cerdo": "pork chop",
        "cordero": "lamb",
        "ternera": "veal",
        "pavo": "turkey",
        "pato": "duck",
        "jamón": "ham",
        "tocino": "bacon",
        "chorizo": "chorizo sausage",
        "salchicha": "sausage",
        "salmon": "salmon",
        "salmón": "salmon",
        "atún": "tuna",
        "atun": "tuna",
        "bacalao": "cod",
        "trucha": "trout",
        "sardina": "sardine",
        "camarón": "shrimp",
        "camarones": "shrimp",
        "gamba": "shrimp",
        "gambas": "shrimp",
        "langosta": "lobster",
        "cangrejo": "crab",
        "mejillón": "mussel",
        "mejillones": "mussels",
        "calamar": "squid",
        "pulpo": "octopus",
        "huevo": "egg",
        "huevos": "eggs",
        "tortilla española": "spanish omelette",
        # Féculents
        "arroz": "rice",
        "arroz blanco": "white rice",
        "arroz integral": "brown rice",
        "paella": "paella rice",
        "pasta": "pasta",
        "fideos": "noodles",
        "pan": "bread",
        "pan integral": "whole wheat bread",
        "patata": "potato",
        "patatas": "potatoes",
        "patatas fritas": "french fries",
        "puré de patatas": "mashed potatoes",
        "batata": "sweet potato",
        "quinoa": "quinoa",
        "avena": "oats",
        # Légumes
        "tomate": "tomato",
        "tomates": "tomatoes",
        "zanahoria": "carrot",
        "zanahorias": "carrots",
        "brocoli": "broccoli",
        "brócoli": "broccoli",
        "espinaca": "spinach",
        "espinacas": "spinach",
        "lechuga": "lettuce",
        "ensalada": "salad",
        "pepino": "cucumber",
        "calabacín": "zucchini",
        "berenjena": "eggplant",
        "pimiento": "bell pepper",
        "pimiento rojo": "red bell pepper",
        "pimiento verde": "green bell pepper",
        "cebolla": "onion",
        "ajo": "garlic",
        "champiñón": "mushroom",
        "champiñones": "mushrooms",
        "seta": "mushroom",
        "col": "cabbage",
        "coliflor": "cauliflower",
        "judías verdes": "green beans",
        "guisantes": "green peas",
        "aguacate": "avocado",
        "aguacates": "avocados",
        "maíz": "corn",
        # Fruits
        "manzana": "apple",
        "manzanas": "apples",
        "platano": "banana",
        "plátano": "banana",
        "naranja": "orange",
        "limón": "lemon",
        "lima": "lime",
        "pera": "pear",
        "melocotón": "peach",
        "cereza": "cherry",
        "cerezas": "cherries",
        "fresa": "strawberry",
        "fresas": "strawberries",
        "frambuesa": "raspberry",
        "arándano": "blueberry",
        "uva": "grape",
        "uvas": "grapes",
        "mango": "mango",
        "piña": "pineapple",
        "sandía": "watermelon",
        "melón": "melon",
        "kiwi": "kiwi",
        # Produits laitiers
        "leche": "milk",
        "queso": "cheese",
        "yogur": "yogurt",
        "mantequilla": "butter",
        "nata": "cream",
        "crema": "cream",
        # Légumineuses
        "lentejas": "lentils",
        "garbanzos": "chickpeas",
        "frijoles": "beans",
        "judías": "beans",
        "alubias": "white beans",
        # Noix
        "almendra": "almond",
        "almendras": "almonds",
        "nuez": "walnut",
        "nueces": "walnuts",
        "cacahuete": "peanut",
        "avellana": "hazelnut",
        "pistacho": "pistachio",
        # Plats
        "sopa": "soup",
        "gazpacho": "gazpacho soup",
        "tortilla": "omelette",
        "empanada": "empanada",
        "croqueta": "croquette",
        "croquetas": "croquettes",
        "tapa": "tapas",
        "tapas": "tapas",
        "bocadillo": "sandwich",
        "pizza": "pizza",
        "hamburguesa": "hamburger",
        "burrito": "burrito",
        "tacos": "tacos",
        "enchiladas": "enchiladas",
        "quesadilla": "quesadilla",
        # Desserts
        "tarta": "pie",
        "pastel": "cake",
        "flan": "flan",
        "churros": "churros",
        "chocolate": "chocolate",
        "helado": "ice cream",
        "miel": "honey",
    },
    "pt": {
        # Protéines
        "frango": "chicken",
        "peito de frango": "chicken breast",
        "frango assado": "roasted chicken",
        "carne": "meat",
        "carne bovina": "beef",
        "bife": "beef steak",
        "carne moída": "ground beef",
        "porco": "pork",
        "costela": "ribs",
        "cordeiro": "lamb",
        "vitela": "veal",
        "peru": "turkey",
        "pato": "duck",
        "presunto": "ham",
        "bacon": "bacon",
        "linguiça": "sausage",
        "salmao": "salmon",
        "salmão": "salmon",
        "atum": "tuna",
        "bacalhau": "cod",
        "sardinha": "sardine",
        "camarão": "shrimp",
        "camarões": "shrimp",
        "lagosta": "lobster",
        "caranguejo": "crab",
        "lula": "squid",
        "polvo": "octopus",
        "ovo": "egg",
        "ovos": "eggs",
        # Féculents
        "arroz": "rice",
        "arroz branco": "white rice",
        "arroz integral": "brown rice",
        "massa": "pasta",
        "macarrão": "pasta",
        "espaguete": "spaghetti",
        "pao": "bread",
        "pão": "bread",
        "pão integral": "whole wheat bread",
        "batata": "potato",
        "batatas": "potatoes",
        "batata frita": "french fries",
        "batatas fritas": "french fries",
        "purê de batata": "mashed potatoes",
        "batata doce": "sweet potato",
        "mandioca": "cassava",
        "aveia": "oats",
        "quinoa": "quinoa",
        # Légumes
        "tomate": "tomato",
        "tomates": "tomatoes",
        "cenoura": "carrot",
        "cenouras": "carrots",
        "brocolis": "broccoli",
        "brócolis": "broccoli",
        "espinafre": "spinach",
        "alface": "lettuce",
        "salada": "salad",
        "pepino": "cucumber",
        "abobrinha": "zucchini",
        "berinjela": "eggplant",
        "pimentão": "bell pepper",
        "cebola": "onion",
        "alho": "garlic",
        "cogumelo": "mushroom",
        "cogumelos": "mushrooms",
        "couve": "cabbage",
        "couve-flor": "cauliflower",
        "feijão verde": "green beans",
        "ervilha": "green peas",
        "abacate": "avocado",
        "milho": "corn",
        # Fruits
        "maca": "apple",
        "maçã": "apple",
        "maçãs": "apples",
        "banana": "banana",
        "bananas": "bananas",
        "laranja": "orange",
        "limão": "lemon",
        "pera": "pear",
        "pêssego": "peach",
        "cereja": "cherry",
        "morango": "strawberry",
        "morangos": "strawberries",
        "framboesa": "raspberry",
        "mirtilo": "blueberry",
        "uva": "grape",
        "uvas": "grapes",
        "manga": "mango",
        "abacaxi": "pineapple",
        "melancia": "watermelon",
        "melão": "melon",
        "kiwi": "kiwi",
        "mamão": "papaya",
        "maracujá": "passion fruit",
        # Produits laitiers
        "leite": "milk",
        "queijo": "cheese",
        "iogurte": "yogurt",
        "manteiga": "butter",
        "creme": "cream",
        # Légumineuses
        "lentilha": "lentils",
        "lentilhas": "lentils",
        "grão de bico": "chickpeas",
        "feijão": "beans",
        "feijão preto": "black beans",
        "feijão vermelho": "red beans",
        # Noix
        "amêndoa": "almond",
        "amêndoas": "almonds",
        "noz": "walnut",
        "nozes": "walnuts",
        "amendoim": "peanut",
        "avelã": "hazelnut",
        "castanha": "chestnut",
        "castanha de caju": "cashew",
        # Plats
        "sopa": "soup",
        "feijoada": "black bean stew",
        "moqueca": "fish stew",
        "coxinha": "chicken croquette",
        "pastel": "fried pastry",
        "pão de queijo": "cheese bread",
        "tapioca": "tapioca",
        "açaí": "acai",
        "pizza": "pizza",
        "hambúrguer": "hamburger",
        # Desserts
        "bolo": "cake",
        "torta": "pie",
        "pudim": "pudding",
        "brigadeiro": "chocolate truffle",
        "chocolate": "chocolate",
        "sorvete": "ice cream",
        "mel": "honey",
    },
    "zh": {
        # Protéines
        "鸡肉": "chicken",
        "鸡胸肉": "chicken breast",
        "鸡腿": "chicken thigh",
        "鸡翅": "chicken wing",
        "牛肉": "beef",
        "牛排": "beef steak",
        "牛肉末": "ground beef",
        "猪肉": "pork",
        "排骨": "pork ribs",
        "羊肉": "lamb",
        "鸭肉": "duck",
        "火腿": "ham",
        "培根": "bacon",
        "香肠": "sausage",
        "三文鱼": "salmon",
        "鲑鱼": "salmon",
        "金枪鱼": "tuna",
        "鳕鱼": "cod",
        "虾": "shrimp",
        "大虾": "prawns",
        "龙虾": "lobster",
        "螃蟹": "crab",
        "蛤蜊": "clam",
        "贝类": "shellfish",
        "鱿鱼": "squid",
        "章鱼": "octopus",
        "鸡蛋": "egg",
        "蛋": "egg",
        "煎蛋": "fried egg",
        "炒蛋": "scrambled eggs",
        "豆腐": "tofu",
        # Féculents
        "米饭": "rice",
        "白米饭": "white rice",
        "糙米": "brown rice",
        "炒饭": "fried rice",
        "面条": "noodles",
        "拉面": "ramen noodles",
        "面": "noodles",
        "意大利面": "pasta",
        "面包": "bread",
        "馒头": "steamed bun",
        "包子": "steamed stuffed bun",
        "饺子": "dumplings",
        "馄饨": "wontons",
        "土豆": "potato",
        "马铃薯": "potato",
        "薯条": "french fries",
        "红薯": "sweet potato",
        "燕麦": "oats",
        "粥": "congee",
        # Légumes
        "番茄": "tomato",
        "西红柿": "tomato",
        "胡萝卜": "carrot",
        "西兰花": "broccoli",
        "菠菜": "spinach",
        "生菜": "lettuce",
        "白菜": "chinese cabbage",
        "大白菜": "napa cabbage",
        "卷心菜": "cabbage",
        "花椰菜": "cauliflower",
        "黄瓜": "cucumber",
        "西葫芦": "zucchini",
        "茄子": "eggplant",
        "辣椒": "chili pepper",
        "青椒": "green pepper",
        "红椒": "red pepper",
        "洋葱": "onion",
        "葱": "scallion",
        "大蒜": "garlic",
        "姜": "ginger",
        "蘑菇": "mushroom",
        "香菇": "shiitake mushroom",
        "木耳": "wood ear mushroom",
        "豆芽": "bean sprouts",
        "芹菜": "celery",
        "玉米": "corn",
        "毛豆": "edamame",
        "四季豆": "green beans",
        "豌豆": "peas",
        # Fruits
        "苹果": "apple",
        "香蕉": "banana",
        "橙子": "orange",
        "柠檬": "lemon",
        "梨": "pear",
        "桃子": "peach",
        "樱桃": "cherry",
        "草莓": "strawberry",
        "蓝莓": "blueberry",
        "葡萄": "grape",
        "芒果": "mango",
        "菠萝": "pineapple",
        "西瓜": "watermelon",
        "哈密瓜": "melon",
        "猕猴桃": "kiwi",
        "木瓜": "papaya",
        "荔枝": "lychee",
        "龙眼": "longan",
        "柿子": "persimmon",
        "椰子": "coconut",
        # Produits laitiers
        "牛奶": "milk",
        "奶酪": "cheese",
        "酸奶": "yogurt",
        "黄油": "butter",
        "奶油": "cream",
        # Légumineuses
        "扁豆": "lentils",
        "鹰嘴豆": "chickpeas",
        "豆子": "beans",
        "红豆": "red beans",
        "黑豆": "black beans",
        "绿豆": "mung beans",
        "黄豆": "soybeans",
        # Noix et graines
        "杏仁": "almond",
        "核桃": "walnut",
        "腰果": "cashew",
        "花生": "peanut",
        "榛子": "hazelnut",
        "开心果": "pistachio",
        "芝麻": "sesame",
        "葵花籽": "sunflower seeds",
        "南瓜籽": "pumpkin seeds",
        # Plats chinois
        "炒菜": "stir fry",
        "宫保鸡丁": "kung pao chicken",
        "糖醋排骨": "sweet and sour pork",
        "红烧肉": "braised pork belly",
        "麻婆豆腐": "mapo tofu",
        "鱼香肉丝": "fish flavored pork",
        "回锅肉": "twice cooked pork",
        "水煮鱼": "boiled fish in spicy sauce",
        "火锅": "hot pot",
        "小笼包": "soup dumplings",
        "春卷": "spring roll",
        "蛋炒饭": "egg fried rice",
        "酸辣汤": "hot and sour soup",
        "汤": "soup",
        # Desserts
        "蛋糕": "cake",
        "月饼": "mooncake",
        "汤圆": "glutinous rice balls",
        "巧克力": "chocolate",
        "冰淇淋": "ice cream",
        "蜂蜜": "honey",
    },
    "ar": {
        # Protéines
        "دجاج": "chicken",
        "صدر دجاج": "chicken breast",
        "فخذ دجاج": "chicken thigh",
        "لحم": "meat",
        "لحم بقر": "beef",
        "ستيك": "beef steak",
        "لحم مفروم": "ground beef",
        "لحم خنزير": "pork",
        "لحم ضأن": "lamb",
        "لحم غنم": "lamb",
        "لحم عجل": "veal",
        "ديك رومي": "turkey",
        "بط": "duck",
        "لحم مقدد": "bacon",
        "نقانق": "sausage",
        "سلمون": "salmon",
        "تونة": "tuna",
        "سمك القد": "cod",
        "سردين": "sardine",
        "جمبري": "shrimp",
        "روبيان": "shrimp",
        "سرطان البحر": "crab",
        "محار": "oyster",
        "حبار": "squid",
        "أخطبوط": "octopus",
        "بيض": "egg",
        "بيضة": "egg",
        # Féculents
        "أرز": "rice",
        "رز": "rice",
        "أرز أبيض": "white rice",
        "أرز بني": "brown rice",
        "مكرونة": "pasta",
        "معكرونة": "pasta",
        "سباغيتي": "spaghetti",
        "خبز": "bread",
        "خبز عربي": "pita bread",
        "عيش": "bread",
        "بطاطس": "potato",
        "بطاطا": "potato",
        "بطاطس مقلية": "french fries",
        "بطاطا حلوة": "sweet potato",
        "شوفان": "oats",
        "كينوا": "quinoa",
        "برغل": "bulgur",
        "كسكس": "couscous",
        "فريكة": "freekeh",
        # Légumes
        "طماطم": "tomato",
        "بندورة": "tomato",
        "جزر": "carrot",
        "بروكلي": "broccoli",
        "سبانخ": "spinach",
        "خس": "lettuce",
        "سلطة": "salad",
        "خيار": "cucumber",
        "كوسة": "zucchini",
        "باذنجان": "eggplant",
        "فلفل": "bell pepper",
        "فلفل أحمر": "red pepper",
        "فلفل أخضر": "green pepper",
        "بصل": "onion",
        "ثوم": "garlic",
        "فطر": "mushroom",
        "ملفوف": "cabbage",
        "كرنب": "cabbage",
        "قرنبيط": "cauliflower",
        "فاصوليا خضراء": "green beans",
        "بازلاء": "peas",
        "أفوكادو": "avocado",
        "ذرة": "corn",
        # Fruits
        "تفاح": "apple",
        "موز": "banana",
        "برتقال": "orange",
        "ليمون": "lemon",
        "كمثرى": "pear",
        "خوخ": "peach",
        "كرز": "cherry",
        "فراولة": "strawberry",
        "توت": "berries",
        "توت أزرق": "blueberry",
        "عنب": "grape",
        "مانجو": "mango",
        "أناناس": "pineapple",
        "بطيخ": "watermelon",
        "شمام": "melon",
        "كيوي": "kiwi",
        "تمر": "date",
        "تين": "fig",
        "رمان": "pomegranate",
        "جوز الهند": "coconut",
        # Produits laitiers
        "حليب": "milk",
        "لبن": "milk",
        "جبن": "cheese",
        "جبنة": "cheese",
        "زبادي": "yogurt",
        "لبنة": "labneh",
        "زبدة": "butter",
        "قشطة": "cream",
        # Légumineuses
        "عدس": "lentils",
        "حمص": "chickpeas",
        "فول": "fava beans",
        "فاصوليا": "beans",
        "فاصوليا حمراء": "red beans",
        "فاصوليا سوداء": "black beans",
        # Noix
        "لوز": "almond",
        "جوز": "walnut",
        "كاجو": "cashew",
        "فول سوداني": "peanut",
        "بندق": "hazelnut",
        "فستق": "pistachio",
        # Plats arabes/moyen-orientaux
        "فلافل": "falafel",
        "شاورما": "shawarma",
        "كباب": "kebab",
        "كبة": "kibbeh",
        "منسف": "mansaf lamb rice",
        "مقلوبة": "maqluba rice",
        "محشي": "stuffed vegetables",
        "ورق عنب": "stuffed grape leaves",
        "تبولة": "tabbouleh",
        "فتوش": "fattoush salad",
        "حمص": "hummus",
        "بابا غنوج": "baba ganoush",
        "متبل": "moutabal",
        "مجدرة": "mujaddara lentils",
        "كشري": "koshari",
        "طاجين": "tagine stew",
        "شوربة": "soup",
        "شوربة عدس": "lentil soup",
        "ملوخية": "molokhia soup",
        "فريكة": "freekeh",
        # Desserts
        "كنافة": "kunafa",
        "بقلاوة": "baklava",
        "قطايف": "qatayef",
        "بسبوسة": "basbousa",
        "مهلبية": "muhallabia",
        "شوكولاتة": "chocolate",
        "آيس كريم": "ice cream",
        "عسل": "honey",
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
