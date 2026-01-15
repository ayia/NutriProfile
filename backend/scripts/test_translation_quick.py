"""
Test rapide de la recherche multilingue avec traduction (sans embeddings).

Ce test vérifie le fallback: Traduction LLM + USDA Search
"""
import asyncio
import sys
from pathlib import Path

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))


async def test_translation_workflow():
    """Test la traduction et recherche USDA."""
    print("=" * 70)
    print("TEST TRADUCTION + USDA SEARCH (Fallback multilingual)")
    print("=" * 70)
    print()

    test_cases = [
        ("poulet", "fr", "Français"),
        ("دجاج", "ar", "العربية"),
        ("pollo", "es", "Español"),
        ("Huhn", "de", "Deutsch"),
        ("frango", "pt", "Português"),
    ]

    print("Test de la recherche multilingue avec traduction...")
    print()

    for food_name, language, language_name in test_cases:
        print(f"\nTest: {food_name} ({language_name})")
        print("-" * 50)

        try:
            from app.services.food_translator import translate_food_name_to_english
            from app.services.nutrition_database import search_nutrition

            # Test traduction
            translated = await translate_food_name_to_english(food_name, language)
            print(f"  Traduit: {translated}")

            # Test recherche USDA
            result = await search_nutrition(translated, 100.0)
            if result:
                print(f"  [OK] Trouve dans USDA: {result.food_name}")
                print(f"       Calories: {result.calories:.1f} kcal/100g")
            else:
                print(f"  [INFO] Non trouvé dans USDA après traduction")

        except Exception as e:
            print(f"[FAIL] Erreur: {e}")

if __name__ == "__main__":
    asyncio.run(test_translation_workflow())
