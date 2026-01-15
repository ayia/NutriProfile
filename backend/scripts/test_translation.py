"""
Script de test pour la traduction multilingue des aliments.

Tests de traduction automatique FR/AR/ES/DE/PT/ZH → EN pour recherche USDA.
"""

import asyncio
import sys
from pathlib import Path

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.food_translator import translate_food_name_to_english
from app.services.nutrition_database import search_nutrition


class Colors:
    """ANSI color codes."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text: str):
    """Print header."""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text:^70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.END}\n")


def print_test(description: str):
    """Print test description."""
    print(f"{Colors.BOLD}{Colors.BLUE}{description}{Colors.END}")
    print(f"{Colors.BLUE}{'-'*70}{Colors.END}")


def print_success(message: str):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")


def print_error(message: str):
    """Print error message."""
    print(f"{Colors.RED}✗ {message}{Colors.END}")


def print_info(key: str, value: str):
    """Print info line."""
    print(f"{Colors.YELLOW}{key:20}{Colors.END} {value}")


async def test_translation_and_search(food_name: str, language: str, language_name: str):
    """
    Test la traduction d'un aliment vers l'anglais puis la recherche USDA.
    """
    print_test(f"Test: {food_name} ({language_name})")

    print_info("Aliment original:", food_name)
    print_info("Langue source:", language_name)

    # 1. Traduction
    try:
        translated = await translate_food_name_to_english(food_name, language)
        print_info("Traduit en anglais:", translated)
        print_success("Traduction réussie!")
    except Exception as e:
        print_error(f"Erreur traduction: {e}")
        return False

    # 2. Recherche USDA avec le nom traduit
    try:
        result = await search_nutrition(translated, 100.0)

        if result:
            print_success("Trouvé dans USDA!")
            print_info("Nom USDA:", result.food_name)
            print_info("Calories (100g):", f"{result.calories:.1f} kcal")
            print_info("Protéines:", f"{result.protein:.1f}g")
            print_info("Confiance:", f"{result.confidence*100:.0f}%")
            print()
            return True
        else:
            print_error("Non trouvé dans USDA après traduction")
            print()
            return False

    except Exception as e:
        print_error(f"Erreur USDA: {e}")
        print()
        return False


async def main():
    """Run tous les tests de traduction."""
    print_header("TESTS TRADUCTION MULTILINGUE + USDA")

    # Tests pour différentes langues
    test_cases = [
        # Français
        ("poulet", "fr", "Français"),
        ("huile d'olive", "fr", "Français"),
        ("pomme de terre", "fr", "Français"),

        # Arabe
        ("دجاج", "ar", "العربية (Arabic)"),  # Poulet
        ("زيت الزيتون", "ar", "العربية (Arabic)"),  # Huile d'olive

        # Espagnol
        ("pollo", "es", "Español"),
        ("aceite de oliva", "es", "Español"),

        # Allemand
        ("Huhn", "de", "Deutsch"),
        ("Olivenöl", "de", "Deutsch"),

        # Portugais
        ("frango", "pt", "Português"),
        ("azeite", "pt", "Português"),

        # Chinois
        ("鸡肉", "zh", "中文 (Chinese)"),  # Poulet
        ("橄榄油", "zh", "中文 (Chinese)"),  # Huile d'olive
    ]

    success_count = 0
    total_count = len(test_cases)

    for food_name, language, language_name in test_cases:
        success = await test_translation_and_search(food_name, language, language_name)
        if success:
            success_count += 1

    # Résumé
    print_header("RÉSUMÉ DES TESTS")
    print(f"{Colors.BOLD}Tests réussis:{Colors.END} {success_count}/{total_count}")

    if success_count == total_count:
        print_success("✓ TOUS LES TESTS SONT PASSÉS!")
    elif success_count >= total_count * 0.7:
        print(f"{Colors.YELLOW}⚠ {success_count}/{total_count} tests réussis (>70%){Colors.END}")
    else:
        print_error(f"✗ Seulement {success_count}/{total_count} tests réussis")

    print()
    print(f"{Colors.BOLD}Note:{Colors.END}")
    print("La traduction LLM peut varier selon la disponibilité des modèles.")
    print("Les aliments très spécifiques peuvent ne pas être trouvés dans USDA.")
    print()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrompus par l'utilisateur{Colors.END}")
    except Exception as e:
        print(f"\n{Colors.RED}Erreur fatale: {e}{Colors.END}")
        import traceback
        traceback.print_exc()
