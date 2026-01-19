"""Service de parsing de transcription vocale en aliments structurés."""

import json
import re
import structlog
from app.llm.client import get_hf_client
from app.schemas.voice import ParsedFoodItem

logger = structlog.get_logger()


class VoiceParser:
    """Parse les transcriptions vocales pour extraire les aliments."""

    def __init__(self):
        self.client = get_hf_client()

    async def parse_transcription(
        self, transcription: str, language: str = "fr"
    ) -> tuple[list[ParsedFoodItem], float]:
        """
        Parse une transcription vocale pour extraire les aliments.

        Args:
            transcription: Texte transcrit (ex: "J'ai mangé 200g de poulet avec du riz")
            language: Langue de la transcription

        Returns:
            Tuple (liste d'aliments, score de confiance)
        """
        # Construire le prompt selon la langue
        if language == "fr":
            prompt = self._build_french_prompt(transcription)
        else:
            prompt = self._build_english_prompt(transcription)

        try:
            # Appeler le LLM Qwen pour parsing structuré
            response = await self.client.text_chat(
                prompt=prompt,
                model_id="Qwen/Qwen2.5-72B-Instruct",
                max_tokens=800,
                temperature=0.3,  # Basse température pour parsing précis
            )

            # Parser la réponse JSON du LLM
            items, confidence = self._parse_llm_response(response, transcription)
            return items, confidence

        except Exception as e:
            logger.error("voice_parsing_error", error=str(e), transcription=transcription)
            # Fallback: parsing basique par regex
            return self._fallback_parse(transcription), 0.5

    def _build_french_prompt(self, transcription: str) -> str:
        """Construit le prompt en français pour le LLM."""
        return f"""Tu es un assistant nutritionnel expert. Analyse cette phrase et extrais les aliments mentionnés.

Phrase: "{transcription}"

INSTRUCTIONS:
1. Identifie TOUS les aliments mentionnés
2. Pour chaque aliment, extrais:
   - name: nom de l'aliment (ex: "poulet grillé", "riz basmati")
   - quantity: quantité en chiffres (ex: "200", "150")
   - unit: unité de mesure (g, ml, portion, pièce, tasse, cuillère)
3. Si une quantité n'est pas mentionnée, estime une portion typique (ex: 150g)
4. Retourne UNIQUEMENT un JSON valide, rien d'autre

Format de sortie (JSON uniquement):
{{
  "items": [
    {{"name": "poulet grillé", "quantity": "200", "unit": "g"}},
    {{"name": "riz basmati", "quantity": "150", "unit": "g"}}
  ]
}}

EXEMPLES:
Phrase: "J'ai mangé 200g de poulet avec du riz et des brocolis"
Sortie: {{"items": [{{"name": "poulet", "quantity": "200", "unit": "g"}}, {{"name": "riz", "quantity": "150", "unit": "g"}}, {{"name": "brocolis", "quantity": "100", "unit": "g"}}]}}

Phrase: "Un sandwich jambon fromage et une pomme"
Sortie: {{"items": [{{"name": "sandwich jambon fromage", "quantity": "1", "unit": "portion"}}, {{"name": "pomme", "quantity": "1", "unit": "pièce"}}]}}

Maintenant, analyse la phrase ci-dessus et retourne le JSON:"""

    def _build_english_prompt(self, transcription: str) -> str:
        """Construit le prompt en anglais pour le LLM."""
        return f"""You are an expert nutritional assistant. Analyze this sentence and extract the mentioned foods.

Sentence: "{transcription}"

INSTRUCTIONS:
1. Identify ALL mentioned foods
2. For each food, extract:
   - name: food name (e.g., "grilled chicken", "basmati rice")
   - quantity: quantity in numbers (e.g., "200", "150")
   - unit: unit of measure (g, ml, portion, piece, cup, tablespoon)
3. If quantity is not mentioned, estimate a typical portion (e.g., 150g)
4. Return ONLY valid JSON, nothing else

Output format (JSON only):
{{
  "items": [
    {{"name": "grilled chicken", "quantity": "200", "unit": "g"}},
    {{"name": "basmati rice", "quantity": "150", "unit": "g"}}
  ]
}}

EXAMPLES:
Sentence: "I ate 200g of chicken with rice and broccoli"
Output: {{"items": [{{"name": "chicken", "quantity": "200", "unit": "g"}}, {{"name": "rice", "quantity": "150", "unit": "g"}}, {{"name": "broccoli", "quantity": "100", "unit": "g"}}]}}

Sentence: "A ham and cheese sandwich and an apple"
Output: {{"items": [{{"name": "ham and cheese sandwich", "quantity": "1", "unit": "portion"}}, {{"name": "apple", "quantity": "1", "unit": "piece"}}]}}

Now, analyze the sentence above and return the JSON:"""

    def _parse_llm_response(
        self, response: str, original_text: str
    ) -> tuple[list[ParsedFoodItem], float]:
        """Parse la réponse du LLM et extrait les items."""
        try:
            # Nettoyer la réponse (enlever markdown, texte avant/après JSON)
            cleaned = response.strip()

            # Enlever les balises markdown si présentes
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()

            # Trouver le premier { et le dernier }
            start = cleaned.find("{")
            end = cleaned.rfind("}") + 1
            if start != -1 and end > start:
                cleaned = cleaned[start:end]

            # Parser le JSON
            data = json.loads(cleaned)
            items = []

            for item_data in data.get("items", []):
                # Valider les champs requis
                if "name" in item_data and "quantity" in item_data:
                    items.append(
                        ParsedFoodItem(
                            name=item_data["name"],
                            quantity=str(item_data["quantity"]),
                            unit=item_data.get("unit", "g"),
                        )
                    )

            # Calculer la confiance basée sur le nombre d'items détectés
            if len(items) == 0:
                confidence = 0.3
            elif len(items) == 1:
                confidence = 0.7
            else:
                confidence = 0.85

            logger.info(
                "voice_parsing_success",
                items_count=len(items),
                confidence=confidence,
                original=original_text,
            )
            return items, confidence

        except json.JSONDecodeError as e:
            logger.warning(
                "voice_parsing_json_error",
                error=str(e),
                response=response[:200],
            )
            # Fallback
            return self._fallback_parse(original_text), 0.4
        except Exception as e:
            logger.error("voice_parsing_unexpected_error", error=str(e))
            return self._fallback_parse(original_text), 0.3

    def _fallback_parse(self, text: str) -> list[ParsedFoodItem]:
        """
        Parsing de secours par regex si le LLM échoue.
        Moins précis mais fonctionnel.
        """
        items = []

        # Pattern pour détecter "XXXg de aliment" ou "XXX ml de aliment"
        pattern_quantity = r"(\d+)\s*(g|ml|mg|kg|cl|l)\s+(?:de\s+|d'|of\s+)?([a-zàâäéèêëïîôùûüç\s]+)"
        matches = re.finditer(pattern_quantity, text.lower())

        for match in matches:
            quantity = match.group(1)
            unit = match.group(2)
            name = match.group(3).strip()
            if name:
                items.append(
                    ParsedFoodItem(
                        name=name,
                        quantity=quantity,
                        unit=unit,
                    )
                )

        # Si aucune quantité trouvée, essayer de détecter juste les noms d'aliments
        # (liste simple de mots clés courants)
        if not items:
            common_foods = [
                "poulet",
                "riz",
                "pâtes",
                "pain",
                "salade",
                "tomate",
                "poisson",
                "viande",
                "légumes",
                "fruits",
                "chicken",
                "rice",
                "pasta",
                "bread",
                "salad",
                "tomato",
                "fish",
                "meat",
                "vegetables",
                "fruits",
            ]
            text_lower = text.lower()
            for food in common_foods:
                if food in text_lower:
                    items.append(
                        ParsedFoodItem(
                            name=food,
                            quantity="150",  # Portion par défaut
                            unit="g",
                        )
                    )

        return items


# Singleton
_parser: VoiceParser | None = None


def get_voice_parser() -> VoiceParser:
    """Retourne l'instance singleton du parser."""
    global _parser
    if _parser is None:
        _parser = VoiceParser()
    return _parser
