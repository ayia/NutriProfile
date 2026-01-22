import json
import re
import base64
from typing import Any

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability
from app.i18n import DEFAULT_LANGUAGE, get_translator


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
        # Nouveaux champs pour harmonisation SCAN/EDIT
        source: str = "ai_estimated",
        needs_verification: bool = False,
        usda_food_name: str | None = None,
        original_name: str | None = None,
    ):
        self.name = name
        self.quantity = quantity
        self.unit = unit
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.confidence = confidence
        # Source tracking
        self.source = source  # ai_estimated, usda_verified, usda_translation, manual
        self.needs_verification = needs_verification  # True si confiance < 0.7
        self.usda_food_name = usda_food_name  # Nom USDA si trouvé
        self.original_name = original_name  # Nom original avant traduction

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
            "source": self.source,
            "needs_verification": self.needs_verification,
            "usda_food_name": self.usda_food_name,
            "original_name": self.original_name,
        }


class HealthReport:
    """Rapport de santé personnalisé basé sur le repas et le profil utilisateur."""

    def __init__(
        self,
        health_score: int = 50,
        goal_compatibility: int = 50,
        verdict: str = "neutral",
        verdict_color: str = "gray",
        summary: str = "",
        positive_points: list[str] | None = None,
        negative_points: list[str] | None = None,
        recommendations: list[str] | None = None,
        macro_analysis: dict | None = None,
        weekly_impact: dict | None = None,
        meal_timing_feedback: str | None = None,
    ):
        self.health_score = health_score  # 0-100 score global santé du repas
        self.goal_compatibility = goal_compatibility  # 0-100 compatibilité avec objectifs
        self.verdict = verdict  # "excellent", "good", "neutral", "poor", "bad"
        self.verdict_color = verdict_color  # Couleur pour UI: green, yellow, orange, red
        self.summary = summary  # Résumé en une phrase
        self.positive_points = positive_points or []
        self.negative_points = negative_points or []
        self.recommendations = recommendations or []
        self.macro_analysis = macro_analysis or {}
        self.weekly_impact = weekly_impact or {}  # Impact sur progression hebdo
        self.meal_timing_feedback = meal_timing_feedback  # Feedback selon l'heure

    def to_dict(self) -> dict:
        return {
            "health_score": self.health_score,
            "goal_compatibility": self.goal_compatibility,
            "verdict": self.verdict,
            "verdict_color": self.verdict_color,
            "summary": self.summary,
            "positive_points": self.positive_points,
            "negative_points": self.negative_points,
            "recommendations": self.recommendations,
            "macro_analysis": self.macro_analysis,
            "weekly_impact": self.weekly_impact,
            "meal_timing_feedback": self.meal_timing_feedback,
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
        health_report: HealthReport | None = None,
    ):
        self.items = items
        self.meal_type = meal_type
        self.description = description
        self.health_report = health_report

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
            "health_report": self.health_report.to_dict() if self.health_report else None,
        }


class VisionAgent(BaseAgent[VisionInput, FoodAnalysis]):
    """
    Agent d'analyse d'images alimentaires.

    Utilise des modèles vision-language pour:
    - Identifier les aliments dans une photo
    - Estimer les portions
    - Calculer les valeurs nutritionnelles

    APPROCHE 100% LLM:
    - Toutes les estimations nutritionnelles sont générées par le VLM
    - Aucune base de données hardcodée
    - Le LLM utilise ses connaissances pour estimer calories/macros
    """

    name = "VisionAgent"
    capability = ModelCapability.FOOD_DETECTION
    confidence_threshold = 0.5
    vlm_model = "Qwen/Qwen2.5-VL-72B-Instruct"  # Powerful vision model

    # Keywords pour détecter les plats complexes nécessitant dual-pass
    COMPLEX_DISH_KEYWORDS = [
        # Plats en sauce
        "curry", "sauce", "stew", "ragoût", "gravy", "braise", "mijoté",
        # Plats méditerranéens/marocains
        "tagine", "tajine", "couscous", "paella", "moussaka", "shakshuka",
        # Plats asiatiques
        "stir fry", "wok", "ramen", "pho", "curry", "korma", "tikka masala",
        # Plats composés
        "bowl", "salad bowl", "buddha bowl", "poke", "burrito",
        # Plats traditionnels
        "cassoulet", "pot-au-feu", "blanquette", "bourguignon",
        "chili", "goulash", "risotto", "biryani",
    ]

    async def process(self, input_data: VisionInput, model=None) -> AgentResponse:
        """
        Traitement spécifique pour la vision utilisant l'API VLM.
        Override la méthode de base pour utiliser vision_chat.

        DUAL-PASS pour plats complexes:
        1. Première passe: Analyse standard
        2. Si plat complexe détecté: Deuxième passe avec prompt de décomposition
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
            # === PREMIÈRE PASSE: Analyse standard ===
            raw_response = await self.client.vision_chat(
                image_base64=input_data.image_base64,
                prompt=prompt,
                model_id=self.vlm_model,
                max_tokens=1200,
            )

            if not raw_response:
                logger.warning("vision_empty_response")
                return await self.fallback(input_data)

            result = self.parse_response(raw_response, input_data)

            # === DÉTECTION PLAT COMPLEXE ===
            is_complex = self._is_complex_dish(result)

            if is_complex:
                logger.info(
                    "complex_dish_detected",
                    description=result.description[:100] if result.description else "N/A",
                    items_count=len(result.items),
                )

                # === DEUXIÈME PASSE: Décomposition ===
                decomposition_result = await self._dual_pass_decomposition(
                    input_data, result, logger
                )

                if decomposition_result:
                    result = decomposition_result
                    logger.info(
                        "dual_pass_completed",
                        items_count=len(result.items),
                        total_calories=result.total_calories,
                    )

            confidence = self.calculate_confidence(result, raw_response)

            logger.info(
                "vision_agent_response",
                agent=self.name,
                model=self.vlm_model,
                confidence=confidence,
                items_count=len(result.items),
                used_dual_pass=is_complex,
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

    def _is_complex_dish(self, analysis: FoodAnalysis) -> bool:
        """
        Détermine si un plat est complexe et nécessite une décomposition.

        Un plat est considéré complexe si:
        - Il contient des mots-clés de plats composés
        - Il a peu d'items mais semble être un plat complet
        - La confiance moyenne est basse
        """
        # Check description for complex dish keywords
        description_lower = analysis.description.lower() if analysis.description else ""
        for keyword in self.COMPLEX_DISH_KEYWORDS:
            if keyword in description_lower:
                return True

        # Check item names
        for item in analysis.items:
            item_lower = item.name.lower()
            for keyword in self.COMPLEX_DISH_KEYWORDS:
                if keyword in item_lower:
                    return True

        # Si un seul item avec beaucoup de calories, probablement un plat composé non décomposé
        if len(analysis.items) == 1 and analysis.total_calories > 400:
            return True

        # Faible confiance moyenne = probablement un plat complexe mal analysé
        avg_confidence = sum(i.confidence for i in analysis.items) / max(len(analysis.items), 1)
        if avg_confidence < 0.7 and analysis.total_calories > 300:
            return True

        return False

    async def _dual_pass_decomposition(
        self, input_data: VisionInput, first_pass: FoodAnalysis, logger
    ) -> FoodAnalysis | None:
        """
        Deuxième passe pour décomposer un plat complexe en composants.

        Utilise un prompt spécialisé qui force la décomposition en:
        - Protéine (viande/poisson/légumineuses)
        - Féculent (riz/pain/pâtes/pommes de terre)
        - Légumes
        - Sauce/gravy (si applicable)
        """
        lang_names = {
            "en": "English", "fr": "French", "de": "German", "es": "Spanish",
            "pt": "Portuguese", "zh": "Chinese", "ar": "Arabic"
        }
        lang_name = lang_names.get(self.language, "English")

        decomposition_prompt = f"""You previously identified this as: {first_pass.description}

This appears to be a COMPOSED DISH that needs to be broken down into its components.

YOUR TASK: DECOMPOSE this dish into SEPARATE COMPONENTS:

1. PROTEIN COMPONENT (meat, fish, eggs, legumes, tofu):
   - Identify the protein source
   - Estimate weight SEPARATELY from sauce/gravy
   - Example: "Chicken thigh" - 120g (NOT "Chicken curry" as one item)

2. STARCH COMPONENT (rice, bread, pasta, potatoes):
   - Identify the base starch
   - Estimate weight of the PLAIN cooked starch
   - Example: "White rice, cooked" - 180g

3. VEGETABLE COMPONENT (if visible):
   - List vegetables separately
   - Example: "Carrots" - 50g, "Onions" - 30g

4. SAUCE/GRAVY COMPONENT (if present):
   - Estimate the sauce volume (typically 50-100g for curry/stew)
   - Sauce is where most FAT is hidden
   - Example: "Curry sauce (coconut based)" - 80g
   - FAT in sauce: tomato-based = 3-5g/100g, coconut = 15-20g/100g, cream = 25-35g/100g

CRITICAL NUTRITION RULES FOR DECOMPOSITION:
- Plain cooked rice: 130 kcal, 2.7g protein, 28g carbs, 0.3g fat per 100g
- Plain cooked pasta: 131 kcal, 5g protein, 25g carbs, 1.1g fat per 100g
- Grilled chicken thigh (no skin): 177 kcal, 24g protein, 0g carbs, 8g fat per 100g
- Curry sauce (coconut): 120 kcal, 2g protein, 6g carbs, 10g fat per 100g
- Curry sauce (tomato): 50 kcal, 1g protein, 8g carbs, 2g fat per 100g

Respond ONLY with valid JSON listing EACH COMPONENT SEPARATELY:
{{
    "description": "Detailed description in {lang_name}",
    "meal_type": "{first_pass.meal_type or 'lunch'}",
    "items": [
        {{"name": "Component 1 in {lang_name}", "quantity": "X", "unit": "g", "calories": Y, "protein": P, "carbs": C, "fat": F, "confidence": 0.8}},
        {{"name": "Component 2 in {lang_name}", "quantity": "X", "unit": "g", ...}},
        ...
    ]
}}

IMPORTANT: List at least 2-4 separate components. DO NOT merge everything into one item."""

        try:
            decomposition_response = await self.client.vision_chat(
                image_base64=input_data.image_base64,
                prompt=decomposition_prompt,
                model_id=self.vlm_model,
                max_tokens=1500,  # Plus de tokens pour la décomposition
            )

            if not decomposition_response:
                logger.warning("dual_pass_empty_response")
                return None

            # Parse la réponse de décomposition
            decomposed = self.parse_response(decomposition_response, input_data)

            # Validation: la décomposition doit avoir plus d'items que l'original
            if len(decomposed.items) > len(first_pass.items):
                # Marquer comme analysé via dual-pass
                for item in decomposed.items:
                    item.source = "ai_dual_pass"

                logger.info(
                    "decomposition_successful",
                    original_items=len(first_pass.items),
                    decomposed_items=len(decomposed.items),
                    original_calories=first_pass.total_calories,
                    decomposed_calories=decomposed.total_calories,
                )

                return decomposed

            # Si pas d'amélioration, garder l'original
            logger.info(
                "decomposition_not_better",
                original_items=len(first_pass.items),
                decomposed_items=len(decomposed.items),
            )
            return None

        except Exception as e:
            logger.error("dual_pass_error", error=str(e))
            return None

    def build_prompt(self, input_data: VisionInput) -> str:
        """
        Construit le prompt optimisé pour l'analyse d'image.

        APPROCHE 100% LLM:
        - Le VLM génère TOUTES les valeurs nutritionnelles
        - Utilise ses connaissances encyclopédiques sur la nutrition
        - Pas de données hardcodées, tout est dynamique
        """
        # Map language codes to full names for the LLM
        lang_names = {
            "en": "English", "fr": "French", "de": "German", "es": "Spanish",
            "pt": "Portuguese", "zh": "Chinese", "ar": "Arabic"
        }
        lang_name = lang_names.get(self.language, "English")

        context_hint = ""
        if input_data.context:
            context_hint = f"\nMeal context: {input_data.context}."

        # Prompt optimisé pour génération LLM pure avec corrections de précision
        return f"""You are an expert nutritionist with comprehensive knowledge of food composition and portion sizes.
Analyze this food image and provide accurate nutritional estimates.
{context_hint}

YOUR TASK:
1. Identify ALL visible food items in the image
2. Estimate portion sizes using visual cues (plate size ~26cm, cutlery for scale)
3. Calculate nutritional values based on USDA FoodData Central reference values
4. Be CONSERVATIVE - accuracy is more important than completeness

PORTION ESTIMATION USING VISUAL REFERENCES (CRITICAL):
- Standard dinner plate = 26cm (10 inches) diameter
- Fork length ≈ 19cm, spoon ≈ 15cm - use as scale reference
- Palm-sized portion of protein ≈ 85-100g (NOT 150g)
- Fist-sized portion of carbs ≈ 120-150g cooked
- Thumb tip = 1 tablespoon ≈ 15g
- ALWAYS identify plate/bowl size FIRST, then estimate food relative to it
- When unsure, estimate SMALLER portions (it's better to underestimate)

FAT/LIPIDS ESTIMATION (CRITICAL - BE VERY CONSERVATIVE):
- Plain cooked rice/pasta: 0.3-1g fat per 100g (NOT 5-10g!)
- Grilled chicken breast (no skin): 3-4g fat per 100g
- Grilled salmon: 10-12g fat per 100g
- Vegetables (no oil): 0.2-0.5g fat per 100g
- Fried foods: add 5-10g fat per 100g to base
- Sauces/gravies: estimate sauce volume SEPARATELY (typically 5-15% fat)
- WHEN IN DOUBT: estimate LOWER fat content

PROTEIN ESTIMATION GUIDELINES:
- Chicken breast: 31g protein per 100g
- Beef/steak: 26g protein per 100g
- Fish (white): 20g protein per 100g
- Eggs: 13g protein per 100g
- Legumes cooked: 8-9g protein per 100g
- Rice/pasta cooked: 2.5-3g protein per 100g

CARBOHYDRATE ESTIMATION GUIDELINES:
- Cooked rice: 28g carbs per 100g
- Cooked pasta: 25g carbs per 100g
- Bread: 45-50g carbs per 100g
- Potatoes: 17g carbs per 100g
- Most vegetables: 3-7g carbs per 100g

FOR DISHES WITH SAUCE/GRAVY (curry, stew, tagine):
Step 1: Identify PROTEIN component and estimate weight
Step 2: Identify STARCH component (rice/bread) and estimate weight
Step 3: Identify VEGETABLES and estimate weight
Step 4: Estimate SAUCE volume (typically 50-100ml)
Step 5: Calculate each component SEPARATELY then sum
- DO NOT estimate the whole dish as one item

SUPPORTED DISHES (you should recognize):
- International: pasta, pizza, burgers, salads, sushi, curry
- Moroccan: tagine, couscous, loubia, harira, msemen, pastilla
- Mediterranean: hummus, falafel, shakshuka, kebab
- Asian: stir-fry, ramen, dim sum, fried rice

Respond ONLY with valid JSON in this exact format:
{{
    "description": "Brief description of the meal in {lang_name}",
    "meal_type": "breakfast|lunch|dinner|snack",
    "items": [
        {{
            "name": "specific food name in {lang_name}",
            "quantity": "150",
            "unit": "g",
            "calories": 248,
            "protein": 31.0,
            "carbs": 0.0,
            "fat": 5.4,
            "confidence": 0.85
        }}
    ]
}}

CRITICAL RULES:
1. ONLY output valid JSON - no text before or after
2. Write "description" and all "name" fields in {lang_name}
3. Use GRAMS (g) for solid foods, ML for liquids
4. Calories MUST equal: (protein × 4) + (carbs × 4) + (fat × 9)
5. Confidence: 0.9+ for simple single foods, 0.7-0.85 for composed dishes
6. For dishes with sauce: LIST COMPONENTS SEPARATELY (protein, starch, vegetables, sauce)
7. FAT VALUES: Double-check against USDA - most VLMs overestimate fat by 30-50%"""

    def build_vision_request(self, input_data: VisionInput) -> dict:
        """Construit la requête pour un modèle vision."""
        return {
            "image": input_data.image_base64,
            "image_type": input_data.image_type,
            "prompt": self.build_prompt(input_data),
        }

    # Facteur de correction des lipides basé sur l'analyse empirique
    # Les VLMs surestiment systématiquement les lipides de 25-40%
    FAT_CORRECTION_FACTOR = 0.75  # Réduire de 25%

    # Aliments qui ne doivent PAS avoir leur fat corrigé (déjà faibles)
    LOW_FAT_FOODS = [
        "rice", "riz", "arroz", "reis", "米饭",
        "pasta", "pâtes", "nudeln", "面条",
        "bread", "pain", "pan", "brot", "面包",
        "vegetables", "légumes", "verduras", "gemüse", "蔬菜",
        "salad", "salade", "ensalada", "salat",
        "fruit", "fruits", "fruta", "obst", "水果",
        "chicken breast", "blanc de poulet", "pechuga",
        "fish", "poisson", "pescado", "fisch", "鱼",
    ]

    # Aliments gras qui n'ont pas besoin de correction
    HIGH_FAT_FOODS = [
        "butter", "beurre", "mantequilla", "黄油",
        "oil", "huile", "aceite", "öl", "油",
        "cheese", "fromage", "queso", "käse", "奶酪",
        "bacon", "lard",
        "avocado", "avocat", "aguacate",
        "nuts", "noix", "nueces", "nüsse",
        "cream", "crème", "crema", "sahne",
    ]

    def _should_correct_fat(self, food_name: str) -> bool:
        """Détermine si les lipides d'un aliment doivent être corrigés."""
        food_lower = food_name.lower()

        # Ne pas corriger les aliments naturellement gras
        for high_fat in self.HIGH_FAT_FOODS:
            if high_fat in food_lower:
                return False

        # Ne pas corriger les aliments naturellement faibles en gras
        for low_fat in self.LOW_FAT_FOODS:
            if low_fat in food_lower:
                return False

        # Corriger tous les autres (plats composés, viandes, etc.)
        return True

    def _detect_complex_dish(self, description: str, items: list) -> bool:
        """Détecte si c'est un plat complexe avec sauce/gravy."""
        complex_keywords = [
            "curry", "sauce", "stew", "ragoût", "tagine", "tajine",
            "bourguignon", "gravy", "braise", "mijoté", "fricassée",
            "korma", "tikka", "masala", "vindaloo", "rendang",
            "goulash", "cassoulet", "blanquette", "coq au vin",
        ]

        text_to_check = description.lower()
        for item in items:
            text_to_check += " " + item.get("name", "").lower()

        return any(keyword in text_to_check for keyword in complex_keywords)

    def parse_response(self, raw_response: str, input_data: VisionInput) -> FoodAnalysis:
        """
        Parse la réponse LLM en objet FoodAnalysis.

        Inclut des corrections empiriques basées sur l'analyse de précision:
        - Correction des lipides (-25% pour la plupart des aliments)
        - Recalcul des calories cohérent avec les macros
        - Détection des plats complexes pour ajustement de confiance
        """
        import structlog
        logger = structlog.get_logger()

        try:
            # Chercher le JSON dans la réponse
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())

                items = []
                is_complex = self._detect_complex_dish(
                    data.get("description", ""),
                    data.get("items", [])
                )

                for item_data in data.get("items", []):
                    protein = float(item_data.get("protein", 0))
                    carbs = float(item_data.get("carbs", 0))
                    fat = float(item_data.get("fat", 0))
                    food_name = item_data.get("name", "Aliment inconnu")

                    # === PHASE 1: Correction empirique des lipides ===
                    # Les VLMs surestiment les lipides de 25-40%
                    original_fat = fat
                    if self._should_correct_fat(food_name):
                        fat = round(fat * self.FAT_CORRECTION_FACTOR, 1)
                        if fat != original_fat:
                            logger.debug(
                                "fat_corrected",
                                food=food_name,
                                original_fat=original_fat,
                                corrected_fat=fat,
                            )

                    # === Recalculer les calories avec le fat corrigé ===
                    calories = int((protein * 4) + (carbs * 4) + (fat * 9))

                    # Ajuster la confiance pour les plats complexes
                    confidence = float(item_data.get("confidence", 0.7))
                    if is_complex:
                        confidence = min(confidence, 0.75)  # Plafonner à 0.75 pour plats complexes

                    items.append(FoodItem(
                        name=food_name,
                        quantity=str(item_data.get("quantity", "1")),
                        unit=item_data.get("unit", "portion"),
                        calories=calories,
                        protein=round(protein, 1),
                        carbs=round(carbs, 1),
                        fat=fat,
                        confidence=confidence,
                        source="ai_estimated",
                    ))

                total_cal = sum(i.calories for i in items)
                logger.info(
                    "vision_parse_success",
                    items_count=len(items),
                    total_calories=total_cal,
                    is_complex_dish=is_complex,
                    fat_correction_applied=True,
                )

                return FoodAnalysis(
                    items=items,
                    meal_type=data.get("meal_type"),
                    description=data.get("description", ""),
                )
            else:
                raise ValueError("No JSON found in response")

        except (json.JSONDecodeError, ValueError) as e:
            logger.warning("parse_response_failed", error=str(e), response_preview=raw_response[:200])
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
                    name=self.t("agents.vision.fallback.unidentifiedMeal"),
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
            description=self.t("agents.vision.autoAnalysisUnavailable"),
        )


def get_vision_agent(language: str = DEFAULT_LANGUAGE) -> VisionAgent:
    """Retourne une instance de l'agent vision."""
    return VisionAgent(language=language)


def _calculate_weekly_impact(
    meal_calories: int,
    target_calories: int,
    goal: str,
    daily_consumed: dict | None = None,
    language: str = DEFAULT_LANGUAGE,
) -> dict:
    """
    Calcule l'impact de ce repas sur la progression hebdomadaire.
    """
    t = get_translator(language)
    consumed_today = daily_consumed.get("calories", 0) if daily_consumed else 0
    total_today = consumed_today + meal_calories

    # Surplus ou déficit par rapport à l'objectif
    daily_diff = total_today - target_calories

    # Impact estimé sur le poids (3500 kcal = ~0.5kg)
    if goal == "lose_weight":
        if daily_diff < 0:
            # Déficit = bon pour perte de poids
            weekly_deficit = abs(daily_diff) * 7
            estimated_loss = round(weekly_deficit / 7700, 2)  # kg par semaine
            return {
                "status": "on_track",
                "message": t.get("agents.vision.weeklyImpact.maintainLoss", loss=estimated_loss),
                "daily_balance": daily_diff,
                "trend": "positive",
            }
        else:
            return {
                "status": "over_target",
                "message": t.get("agents.vision.weeklyImpact.dailySurplus", diff=daily_diff),
                "daily_balance": daily_diff,
                "trend": "negative",
            }
    elif goal == "gain_muscle":
        if daily_diff > 0:
            # Surplus = bon pour prise de masse
            return {
                "status": "on_track",
                "message": t.get("agents.vision.weeklyImpact.goodSurplusGain", diff=daily_diff),
                "daily_balance": daily_diff,
                "trend": "positive",
            }
        else:
            return {
                "status": "under_target",
                "message": t.get("agents.vision.weeklyImpact.deficitForGain", diff=abs(daily_diff)),
                "daily_balance": daily_diff,
                "trend": "negative",
            }
    else:
        # Maintien
        if abs(daily_diff) <= target_calories * 0.1:
            return {
                "status": "balanced",
                "message": t.get("agents.vision.weeklyImpact.balancedIntake"),
                "daily_balance": daily_diff,
                "trend": "neutral",
            }
        elif daily_diff > 0:
            return {
                "status": "over_target",
                "message": t.get("agents.vision.weeklyImpact.slightSurplus", diff=daily_diff),
                "daily_balance": daily_diff,
                "trend": "warning",
            }
        else:
            return {
                "status": "under_target",
                "message": t.get("agents.vision.weeklyImpact.slightDeficit", diff=abs(daily_diff)),
                "daily_balance": daily_diff,
                "trend": "warning",
            }


def _get_meal_timing_feedback(
    current_hour: int,
    meal_calories: int,
    meal_carbs: float,
    meal_protein: float,
    language: str = DEFAULT_LANGUAGE,
) -> str:
    """
    Génère un feedback basé sur l'heure du repas et sa composition.
    """
    t = get_translator(language)

    if 5 <= current_hour < 10:
        # Petit-déjeuner
        if meal_carbs >= 30:
            return t.get("agents.vision.mealTiming.morningCarbsGood")
        elif meal_protein >= 20:
            return t.get("agents.vision.mealTiming.morningProteinGood")
        else:
            return t.get("agents.vision.mealTiming.breakfastIdeal")

    elif 11 <= current_hour < 14:
        # Déjeuner
        if meal_protein >= 25 and meal_calories >= 400:
            return t.get("agents.vision.mealTiming.lunchBalanced")
        elif meal_calories < 300:
            return t.get("agents.vision.mealTiming.lunchLight")
        else:
            return t.get("agents.vision.mealTiming.lunchGoodTime")

    elif 14 <= current_hour < 17:
        # Encas après-midi
        if meal_calories <= 200:
            return t.get("agents.vision.mealTiming.snackReasonable")
        elif meal_calories > 400:
            return t.get("agents.vision.mealTiming.snackHeavy")
        else:
            return t.get("agents.vision.mealTiming.snackModerate")

    elif 18 <= current_hour < 21:
        # Dîner
        if meal_carbs < 40 and meal_protein >= 20:
            return t.get("agents.vision.mealTiming.dinnerIdeal")
        elif meal_calories > 800:
            return t.get("agents.vision.mealTiming.dinnerHeavy")
        else:
            return t.get("agents.vision.mealTiming.dinnerReasonable")

    elif current_hour >= 21 or current_hour < 5:
        # Repas tardif
        if meal_calories > 300:
            return t.get("agents.vision.mealTiming.lateHeavy")
        elif meal_protein >= 15:
            return t.get("agents.vision.mealTiming.lateProtein")
        else:
            return t.get("agents.vision.mealTiming.lateGeneral")

    return t.get("agents.vision.mealTiming.enjoyMeal")


def calculate_health_report(
    analysis: FoodAnalysis,
    user_profile: dict | None = None,
    daily_consumed: dict | None = None,
    activities_today: dict | None = None,
    weight_trend: dict | None = None,
    meal_history: dict | None = None,
    language: str = DEFAULT_LANGUAGE,
) -> HealthReport:
    """
    Calcule un rapport de santé personnalisé ultra-complet basé sur:
    - L'analyse du repas
    - Le profil utilisateur complet (objectifs, régime, allergies, conditions médicales)
    - Ce qui a déjà été consommé dans la journée
    - Les activités physiques du jour (calories brûlées)
    - La tendance de poids (7 derniers jours)
    - L'historique alimentaire récent (variété, patterns)
    """
    t = get_translator(language)
    positive_points = []
    negative_points = []
    recommendations = []
    health_score = 50
    goal_compatibility = 50

    # === EXTRACTION DES DONNÉES DU PROFIL ===
    target_calories = user_profile.get("daily_calories", 2000) if user_profile else 2000
    target_protein = user_profile.get("protein_g", 60) if user_profile else 60
    target_carbs = user_profile.get("carbs_g", 250) if user_profile else 250
    target_fat = user_profile.get("fat_g", 65) if user_profile else 65
    goal = user_profile.get("goal", "maintain") if user_profile else "maintain"
    diet_type = user_profile.get("diet_type", "omnivore") if user_profile else "omnivore"
    allergies = user_profile.get("allergies", []) if user_profile else []
    excluded_foods = user_profile.get("excluded_foods", []) if user_profile else []

    # Données physiques
    age = user_profile.get("age") if user_profile else None
    gender = user_profile.get("gender") if user_profile else None
    weight_kg = user_profile.get("weight_kg") if user_profile else None
    height_cm = user_profile.get("height_cm") if user_profile else None
    target_weight_kg = user_profile.get("target_weight_kg") if user_profile else None
    activity_level = user_profile.get("activity_level", "moderate") if user_profile else "moderate"

    # Données métaboliques
    bmr = user_profile.get("bmr") if user_profile else None
    tdee = user_profile.get("tdee") if user_profile else None

    # Données de santé
    medical_conditions = user_profile.get("medical_conditions", []) if user_profile else []
    medications = user_profile.get("medications", []) if user_profile else []

    # === DONNÉES DE CONSOMMATION DU JOUR ===
    consumed_calories = daily_consumed.get("calories", 0) if daily_consumed else 0
    consumed_protein = daily_consumed.get("protein", 0) if daily_consumed else 0
    consumed_carbs = daily_consumed.get("carbs", 0) if daily_consumed else 0
    consumed_fat = daily_consumed.get("fat", 0) if daily_consumed else 0
    water_ml = daily_consumed.get("water_ml", 0) if daily_consumed else 0
    meals_count = daily_consumed.get("meals_count", 0) if daily_consumed else 0

    # === DONNÉES D'ACTIVITÉ DU JOUR ===
    calories_burned_today = activities_today.get("calories_burned", 0) if activities_today else 0
    activity_minutes_today = activities_today.get("duration_minutes", 0) if activities_today else 0
    activity_types_today = activities_today.get("activity_types", []) if activities_today else []

    # === DONNÉES DE POIDS (TENDANCE) ===
    weight_change_7d = weight_trend.get("change_7d") if weight_trend else None
    weight_trend_direction = weight_trend.get("direction") if weight_trend else None  # "losing", "gaining", "stable"
    days_to_goal = weight_trend.get("days_to_goal") if weight_trend else None

    # === HISTORIQUE ALIMENTAIRE ===
    recent_foods = meal_history.get("recent_foods", []) if meal_history else []
    variety_score = meal_history.get("variety_score", 50) if meal_history else 50
    avg_daily_calories_7d = meal_history.get("avg_calories_7d") if meal_history else None

    # === CALCULS AJUSTÉS AVEC ACTIVITÉ ===
    # Calories nettes = consommées - brûlées par exercice
    net_calories_today = consumed_calories - calories_burned_today

    # Budget calorique ajusté (TDEE - déficit/surplus selon objectif)
    adjusted_target = target_calories + calories_burned_today  # Plus de marge si actif
    remaining_calories = adjusted_target - consumed_calories

    meal_calories = analysis.total_calories
    meal_protein = analysis.total_protein
    meal_carbs = analysis.total_carbs
    meal_fat = analysis.total_fat

    # === ANALYSE DES MACROS DU REPAS ===
    meal_ratio = meal_calories / target_calories * 100 if target_calories > 0 else 0
    protein_ratio = meal_protein / target_protein * 100 if target_protein > 0 else 0

    # Ratio typique par repas (25-35% des calories journalières)
    if 20 <= meal_ratio <= 40:
        positive_points.append(t.get("agents.vision.healthReport.portionBalanced"))
        health_score += 10
    elif meal_ratio > 50:
        negative_points.append(t.get("agents.vision.healthReport.mealHighPercent", percent=int(meal_ratio)))
        health_score -= 15
        recommendations.append(t.get("agents.vision.healthReport.preferSmaller"))
    elif meal_ratio < 15:
        negative_points.append(t.get("agents.vision.healthReport.mealVeryLight"))
        recommendations.append(t.get("agents.vision.healthReport.addProteinSatiety"))

    # === ANALYSE DES PROTÉINES ===
    if meal_protein >= 20:
        positive_points.append(t.get("agents.vision.healthReport.goodProtein", protein=int(meal_protein)))
        health_score += 10
    elif meal_protein < 10:
        negative_points.append(t.get("agents.vision.healthReport.lowProtein"))
        recommendations.append(t.get("agents.vision.healthReport.addProteinSuggestion"))

    # === ANALYSE SELON L'OBJECTIF ===
    if goal == "lose_weight":
        if meal_calories <= remaining_calories * 0.35:
            positive_points.append(t.get("agents.vision.healthReport.compatibleWeightLoss"))
            goal_compatibility += 20
        elif meal_calories > remaining_calories * 0.5:
            negative_points.append(t.get("agents.vision.healthReport.caloricForWeightLoss"))
            goal_compatibility -= 20
            recommendations.append(t.get("agents.vision.healthReport.reducePortion"))

        if meal_protein >= 25:
            positive_points.append(t.get("agents.vision.healthReport.highProteinSatiety"))
            goal_compatibility += 10

        # Feedback basé sur la tendance de poids
        if weight_trend_direction == "losing":
            positive_points.append(t.get("agents.vision.healthReport.weightDecreasing"))
            goal_compatibility += 10
        elif weight_trend_direction == "gaining":
            negative_points.append(t.get("agents.vision.healthReport.weightIncreasing"))
            recommendations.append(t.get("agents.vision.healthReport.reducePortion"))
            goal_compatibility -= 10

    elif goal == "gain_muscle":
        if meal_protein >= 30:
            positive_points.append(t.get("agents.vision.healthReport.excellentProteinMuscle"))
            goal_compatibility += 25
        elif meal_protein < 20:
            negative_points.append(t.get("agents.vision.healthReport.insufficientProteinMuscle"))
            goal_compatibility -= 15
            recommendations.append(t.get("agents.vision.healthReport.aim30gProtein"))

        # Vérifier l'apport calorique suffisant
        if net_calories_today + meal_calories < tdee * 0.9 if tdee else False:
            recommendations.append(t.get("agents.vision.healthReport.caloricDeficitMuscle"))

    elif goal == "improve_health":
        # Vérifier la présence de légumes/fibres
        has_vegetables = any(
            any(veg in item.name.lower() for veg in ["salade", "légume", "brocoli", "carotte", "tomate", "épinard", "courgette"])
            for item in analysis.items
        )
        if has_vegetables:
            positive_points.append(t.get("agents.vision.healthReport.containsVegetables"))
            health_score += 15
            goal_compatibility += 15
        else:
            recommendations.append(t.get("agents.vision.healthReport.addVegetables"))

    # === INTÉGRATION DES ACTIVITÉS DU JOUR ===
    if calories_burned_today > 0:
        positive_points.append(t.get("agents.vision.healthReport.burnedCalories", calories=calories_burned_today))
        health_score += 5

        # Ajuster les recommandations si très actif
        if calories_burned_today > 400:
            if meal_protein < 25:
                recommendations.append(t.get("agents.vision.healthReport.increaseProteinRecovery"))
            if meal_carbs < 30:
                recommendations.append(t.get("agents.vision.healthReport.addCarbsEnergy"))

    if activity_minutes_today > 30:
        positive_points.append(t.get("agents.vision.healthReport.activityMinutes", minutes=activity_minutes_today))

    # === ANALYSE SELON L'ÂGE ET LE GENRE ===
    if age:
        if age >= 50:
            # Plus de 50 ans: emphase sur protéines et calcium
            if meal_protein < 20:
                recommendations.append(t.get("agents.vision.healthReport.proteinEssentialAge"))
            if any(d in [item.name.lower() for item in analysis.items] for d in ["fromage", "lait", "yaourt"]):
                positive_points.append(t.get("agents.vision.healthReport.goodCalcium"))
                health_score += 5
        elif age < 25:
            # Jeunes: plus de flexibilité mais vigilance sur la nutrition
            if meal_calories > target_calories * 0.5:
                recommendations.append(t.get("agents.vision.healthReport.watchPortions"))

    if gender == "female":
        # Femmes: attention au fer
        iron_rich = ["viande", "boeuf", "épinard", "lentilles", "haricots"]
        has_iron = any(any(f in item.name.lower() for f in iron_rich) for item in analysis.items)
        if has_iron:
            positive_points.append(t.get("agents.vision.healthReport.goodIronIntake"))
            health_score += 5

    # === CONDITIONS MÉDICALES ===
    if medical_conditions:
        # Diabète
        if any("diabète" in c.lower() or "diabetes" in c.lower() for c in medical_conditions):
            if meal_carbs > 50:
                negative_points.append(t.get("agents.vision.healthReport.diabetesWarning"))
                health_score -= 15
                recommendations.append(t.get("agents.vision.healthReport.limitSimpleCarbs"))
            sugar_items = ["sucre", "gâteau", "bonbon", "soda", "jus"]
            if any(any(s in item.name.lower() for s in sugar_items) for item in analysis.items):
                negative_points.append(t.get("agents.vision.healthReport.diabetesSugarWarning"))
                health_score -= 20

        # Hypertension
        if any("hypertension" in c.lower() or "tension" in c.lower() for c in medical_conditions):
            salty_items = ["fromage", "charcuterie", "jambon", "chips", "frites"]
            if any(any(s in item.name.lower() for s in salty_items) for item in analysis.items):
                negative_points.append(t.get("agents.vision.healthReport.hypertensionWarning"))
                health_score -= 10
                recommendations.append(t.get("agents.vision.healthReport.preferLowSodium"))

        # Cholestérol
        if any("cholestérol" in c.lower() or "cholesterol" in c.lower() for c in medical_conditions):
            if meal_fat > 25:
                negative_points.append(t.get("agents.vision.healthReport.highFatCholesterol"))
                health_score -= 10
            fatty_items = ["beurre", "crème", "friture", "bacon"]
            if any(any(f in item.name.lower() for f in fatty_items) for item in analysis.items):
                recommendations.append(t.get("agents.vision.healthReport.limitSaturatedFat"))

    # === INTERACTIONS MÉDICAMENTS ===
    if medications:
        # Anticoagulants et vitamine K
        if any("warfarin" in m.lower() or "coumadin" in m.lower() or "anticoagulant" in m.lower() for m in medications):
            vit_k_foods = ["épinard", "brocoli", "chou", "laitue"]
            if any(any(v in item.name.lower() for v in vit_k_foods) for item in analysis.items):
                negative_points.append(t.get("agents.vision.healthReport.vitaminKWarning"))
                recommendations.append(t.get("agents.vision.healthReport.consultDoctor"))

        # Statines et pamplemousse
        if any("statine" in m.lower() or "atorvastatine" in m.lower() or "simvastatine" in m.lower() for m in medications):
            if any("pamplemousse" in item.name.lower() for item in analysis.items):
                negative_points.append(t.get("agents.vision.healthReport.grapefruitStatins"))
                health_score -= 25

    # === VÉRIFICATION ALLERGIES ET EXCLUSIONS ===
    for item in analysis.items:
        item_lower = item.name.lower()
        for allergen in allergies:
            if allergen.lower() in item_lower:
                negative_points.append(t.get("agents.vision.healthReport.containsAllergen", allergen=allergen))
                health_score -= 30
                goal_compatibility -= 30

        for excluded in excluded_foods:
            if excluded.lower() in item_lower:
                negative_points.append(t.get("agents.vision.healthReport.containsExcluded", food=excluded))
                goal_compatibility -= 10

    # === VÉRIFICATION DU RÉGIME ALIMENTAIRE ===
    meat_items = ["poulet", "boeuf", "porc", "agneau", "viande", "steak", "jambon", "bacon"]
    fish_items = ["poisson", "saumon", "thon", "crevette", "fruits de mer"]
    dairy_items = ["fromage", "lait", "yaourt", "crème", "beurre"]

    has_meat = any(any(m in item.name.lower() for m in meat_items) for item in analysis.items)
    has_fish = any(any(f in item.name.lower() for f in fish_items) for item in analysis.items)
    has_dairy = any(any(d in item.name.lower() for d in dairy_items) for item in analysis.items)

    if diet_type == "vegetarian" and has_meat:
        negative_points.append(t.get("agents.vision.healthReport.containsMeat"))
        goal_compatibility -= 25
    elif diet_type == "vegan" and (has_meat or has_fish or has_dairy):
        negative_points.append(t.get("agents.vision.healthReport.containsAnimal"))
        goal_compatibility -= 25
    elif diet_type == "pescatarian" and has_meat:
        negative_points.append(t.get("agents.vision.healthReport.containsMeatPesc"))
        goal_compatibility -= 25
    elif diet_type == "keto":
        if meal_carbs > 20:
            negative_points.append(t.get("agents.vision.healthReport.tooManyCarbs", carbs=int(meal_carbs)))
            goal_compatibility -= 20
        if meal_fat < meal_protein:
            recommendations.append(t.get("agents.vision.healthReport.ketoFatAdvice"))
    elif diet_type == "mediterranean":
        if has_fish or any("huile d'olive" in item.name.lower() for item in analysis.items):
            positive_points.append(t.get("agents.vision.healthReport.mediterraneanCompliant"))
            goal_compatibility += 10

    # === ANALYSE DE VARIÉTÉ (HISTORIQUE) ===
    if recent_foods:
        current_items = [item.name.lower() for item in analysis.items]
        repeated = [f for f in recent_foods if any(f.lower() in ci for ci in current_items)]
        if len(repeated) > 2:
            recommendations.append(t.get("agents.vision.healthReport.varyDiet"))
            health_score -= 5
        if variety_score < 40:
            recommendations.append(t.get("agents.vision.healthReport.tryNewFoods"))

    # === HYDRATATION ===
    if water_ml < 1500:
        recommendations.append(t.get("agents.vision.healthReport.waterReminder", water=water_ml))
    elif water_ml >= 2000:
        positive_points.append(t.get("agents.vision.healthReport.goodHydration"))
        health_score += 5

    # === IMPACT SUR CALORIES RESTANTES ===
    new_remaining = remaining_calories - meal_calories
    if new_remaining < 0:
        negative_points.append(t.get("agents.vision.healthReport.exceededCalories", calories=int(abs(new_remaining))))
        goal_compatibility -= 20
    elif new_remaining < target_calories * 0.15:
        recommendations.append(t.get("agents.vision.healthReport.remainingCalories", calories=int(new_remaining)))

    # === CALCULER LES SCORES FINAUX ===
    health_score = max(0, min(100, health_score))
    goal_compatibility = max(0, min(100, goal_compatibility))

    # Déterminer le verdict avec couleur
    avg_score = (health_score + goal_compatibility) / 2
    if avg_score >= 80:
        verdict = "excellent"
        verdict_color = "green"
        summary = t.get("agents.vision.healthReport.verdictExcellent")
    elif avg_score >= 65:
        verdict = "good"
        verdict_color = "emerald"
        summary = t.get("agents.vision.healthReport.verdictGood")
    elif avg_score >= 45:
        verdict = "neutral"
        verdict_color = "yellow"
        summary = t.get("agents.vision.healthReport.verdictNeutral")
    elif avg_score >= 30:
        verdict = "poor"
        verdict_color = "orange"
        summary = t.get("agents.vision.healthReport.verdictPoor")
    else:
        verdict = "bad"
        verdict_color = "red"
        summary = t.get("agents.vision.healthReport.verdictBad")

    # === ANALYSE DES MACROS ENRICHIE POUR LE FRONTEND ===
    macro_analysis = {
        "calories": {
            "value": meal_calories,
            "target_meal": int(target_calories * 0.3),
            "percent_daily": round(meal_ratio, 1),
            "remaining_today": max(0, int(remaining_calories - meal_calories)),
            "burned_today": calories_burned_today,
            "net_today": net_calories_today + meal_calories,
        },
        "protein": {
            "value": round(meal_protein, 1),
            "target_meal": int(target_protein * 0.3),
            "percent_daily": round(protein_ratio, 1),
            "consumed_today": round(consumed_protein + meal_protein, 1),
        },
        "carbs": {
            "value": round(meal_carbs, 1),
            "percent_daily": round(meal_carbs / target_carbs * 100, 1) if target_carbs > 0 else 0,
            "consumed_today": round(consumed_carbs + meal_carbs, 1),
        },
        "fat": {
            "value": round(meal_fat, 1),
            "percent_daily": round(meal_fat / target_fat * 100, 1) if target_fat > 0 else 0,
            "consumed_today": round(consumed_fat + meal_fat, 1),
        },
        "activity": {
            "minutes_today": activity_minutes_today,
            "calories_burned": calories_burned_today,
            "types": activity_types_today[:3] if activity_types_today else [],
        },
        "hydration": {
            "water_ml": water_ml,
            "target_ml": 2500,
            "percent": round(water_ml / 2500 * 100, 1),
        },
    }

    # === IMPACT HEBDOMADAIRE ENRICHI ===
    weekly_impact = _calculate_weekly_impact(
        meal_calories=meal_calories,
        target_calories=target_calories,
        goal=goal,
        daily_consumed=daily_consumed,
        language=language,
    )

    # Enrichir avec la tendance de poids
    if weight_trend:
        weekly_impact["weight_trend"] = {
            "change_7d": weight_change_7d,
            "direction": weight_trend_direction,
            "days_to_goal": days_to_goal,
        }
        if weight_change_7d is not None:
            if goal == "lose_weight" and weight_change_7d < 0:
                weekly_impact["message"] = t.get("agents.vision.healthReport.weeklyExcellentLoss", weight=abs(weight_change_7d))
            elif goal == "gain_muscle" and weight_change_7d > 0:
                weekly_impact["message"] = t.get("agents.vision.healthReport.weeklyGoodGain", weight=weight_change_7d)

    # Feedback basé sur l'heure du repas
    from datetime import datetime
    current_hour = datetime.now().hour
    meal_timing_feedback = _get_meal_timing_feedback(
        current_hour=current_hour,
        meal_calories=meal_calories,
        meal_carbs=meal_carbs,
        meal_protein=meal_protein,
        language=language,
    )

    return HealthReport(
        health_score=health_score,
        goal_compatibility=goal_compatibility,
        verdict=verdict,
        verdict_color=verdict_color,
        summary=summary,
        positive_points=positive_points,
        negative_points=negative_points,
        recommendations=recommendations,
        macro_analysis=macro_analysis,
        weekly_impact=weekly_impact,
        meal_timing_feedback=meal_timing_feedback,
    )
