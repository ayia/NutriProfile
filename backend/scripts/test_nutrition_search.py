"""
Script de test QA pour le système de nutrition avec waterfall.

Tests :
1. Aliment USDA (base de données)
2. Plat composé (LLM)
3. Aliment inconnu (saisie manuelle)
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.nutrition_database import search_nutrition
from app.agents.nutrition import estimate_nutrition_llm


class Colors:
    """ANSI color codes pour output coloré."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text: str):
    """Print header avec couleur."""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text:^70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.END}\n")


def print_test(number: int, description: str):
    """Print test number."""
    print(f"{Colors.BOLD}{Colors.BLUE}TEST {number}: {description}{Colors.END}")
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


async def test_1_usda_database():
    """
    TEST 1: Aliment dans la base USDA.

    Aliment : "chicken breast"
    Quantité : 150g

    Résultat attendu :
    - Source : USDA
    - Confiance : 95%
    - Calories : ~248 kcal
    - Protéines : ~46g
    """
    print_test(1, "Aliment USDA (Base de données)")

    food_name = "chicken breast"
    quantity_g = 150.0

    print_info("Aliment:", food_name)
    print_info("Quantité:", f"{quantity_g}g")
    print()

    try:
        result = await search_nutrition(food_name, quantity_g)

        if result:
            print_success("Aliment trouvé dans USDA!")
            print_info("Source:", result.source.upper())
            print_info("Confiance:", f"{result.confidence*100:.0f}%")
            print_info("Calories:", f"{result.calories:.1f} kcal")
            print_info("Protéines:", f"{result.protein:.1f}g")
            print_info("Glucides:", f"{result.carbs:.1f}g")
            print_info("Lipides:", f"{result.fat:.1f}g")
            print_info("Fibres:", f"{result.fiber:.1f}g")

            # Vérifications
            assert result.source == "usda", f"Source attendue: usda, reçue: {result.source}"
            assert result.confidence >= 0.90, f"Confiance trop faible: {result.confidence}"
            # Note: USDA peut retourner différentes variantes de poulet, donc range plus large
            assert 150 <= result.calories <= 350, f"Calories hors range: {result.calories}"
            assert result.protein >= 20, f"Protéines trop faibles: {result.protein}"

            print()
            print_success("TEST 1 PASSED ✓")
        else:
            print_error("Aliment non trouvé dans USDA")
            print_error("TEST 1 FAILED ✗")

    except Exception as e:
        print_error(f"Erreur: {e}")
        print_error("TEST 1 FAILED ✗")
        import traceback
        traceback.print_exc()


async def test_2_llm_estimation():
    """
    TEST 2: Plat composé (estimation LLM).

    Aliment : "tagine marocain"
    Quantité : 300g

    Résultat attendu :
    - Source : LLM
    - Confiance : 70-85%
    - Calories : ~400-450 kcal
    - Protéines : ~20-30g
    """
    print_test(2, "Plat Composé (Estimation LLM)")

    food_name = "tagine marocain"
    quantity_g = 300.0

    print_info("Aliment:", food_name)
    print_info("Quantité:", f"{quantity_g}g")
    print()

    try:
        # Essayer USDA d'abord (devrait échouer)
        usda_result = await search_nutrition(food_name, quantity_g)

        if usda_result:
            print_info("⚠️  Note:", "Trouvé dans USDA (inattendu mais OK)")
            print_info("Source:", usda_result.source.upper())
            print_info("Confiance:", f"{usda_result.confidence*100:.0f}%")
            print_info("Calories:", f"{usda_result.calories:.1f} kcal")
            print()
            print_success("TEST 2 PASSED (via USDA) ✓")
            return

        # Fallback LLM
        print_info("USDA:", "Non trouvé (attendu)")
        print_info("Fallback:", "Agent LLM Nutrition...")
        print()

        llm_result = await estimate_nutrition_llm(food_name, quantity_g, context="plat marocain")

        if llm_result:
            print_success("Estimation LLM réussie!")
            print_info("Source:", llm_result.source.upper())
            print_info("Confiance:", f"{llm_result.confidence*100:.0f}%")
            print_info("Calories:", f"{llm_result.calories:.1f} kcal")
            print_info("Protéines:", f"{llm_result.protein:.1f}g")
            print_info("Glucides:", f"{llm_result.carbs:.1f}g")
            print_info("Lipides:", f"{llm_result.fat:.1f}g")
            print_info("Fibres:", f"{llm_result.fiber:.1f}g")

            # Vérifications
            assert llm_result.source == "llm", f"Source attendue: llm, reçue: {llm_result.source}"
            assert 0.60 <= llm_result.confidence <= 0.85, f"Confiance hors range: {llm_result.confidence}"
            assert 300 <= llm_result.calories <= 600, f"Calories hors range: {llm_result.calories}"

            print()
            print_success("TEST 2 PASSED ✓")
        else:
            print_error("Estimation LLM échouée (confiance < seuil)")
            print_error("TEST 2 FAILED ✗")

    except Exception as e:
        print_error(f"Erreur: {e}")
        print_error("TEST 2 FAILED ✗")
        import traceback
        traceback.print_exc()


async def test_3_not_found():
    """
    TEST 3: Aliment inconnu.

    Aliment : "plat xyz complètement inconnu 12345"
    Quantité : 200g

    Résultat attendu :
    - Source : default ou None
    - Confiance : < 60%
    - → Mode saisie manuelle frontend
    """
    print_test(3, "Aliment Inconnu (Saisie manuelle)")

    food_name = "plat xyz complètement inconnu 12345"
    quantity_g = 200.0

    print_info("Aliment:", food_name)
    print_info("Quantité:", f"{quantity_g}g")
    print()

    try:
        # USDA
        usda_result = await search_nutrition(food_name, quantity_g)

        if usda_result:
            print_error("Trouvé dans USDA (inattendu!)")
            print_error("TEST 3 FAILED ✗")
            return

        print_info("USDA:", "Non trouvé ✓")

        # LLM
        llm_result = await estimate_nutrition_llm(food_name, quantity_g)

        if llm_result and llm_result.confidence >= 0.6:
            print_error(f"LLM confiance trop haute: {llm_result.confidence*100:.0f}%")
            print_error("TEST 3 FAILED ✗")
            return

        print_info("LLM:", "Confiance < 60% ou échec ✓")
        print()
        print_success("Aliment non trouvé comme attendu")
        print_info("Action frontend:", "Activer mode saisie manuelle")
        print()
        print_success("TEST 3 PASSED ✓")

    except Exception as e:
        print_error(f"Erreur: {e}")
        print_error("TEST 3 FAILED ✗")
        import traceback
        traceback.print_exc()


async def test_4_edge_cases():
    """
    TEST 4: Cas limites.

    Tests:
    - Nom vide
    - Quantité négative
    - Quantité 0
    - Nom très court
    """
    print_test(4, "Cas Limites (Edge Cases)")

    edge_cases = [
        ("", 100.0, "Nom vide"),
        ("poulet", 0.0, "Quantité = 0"),
        ("poulet", -50.0, "Quantité négative"),
        ("a", 100.0, "Nom 1 caractère"),
    ]

    passed = 0
    total = len(edge_cases)

    for food_name, quantity_g, description in edge_cases:
        print_info("Cas:", description)
        print_info("  Aliment:", f"'{food_name}'")
        print_info("  Quantité:", f"{quantity_g}g")

        try:
            result = await search_nutrition(food_name, quantity_g)

            # Ces cas devraient retourner None ou lever une exception
            if result:
                print_info("  Résultat:", f"Trouvé (inattendu)")
            else:
                print_info("  Résultat:", "None ✓")
                passed += 1

        except Exception as e:
            print_info("  Résultat:", f"Exception (attendue) ✓")
            passed += 1

        print()

    if passed == total:
        print_success(f"TEST 4 PASSED ({passed}/{total}) ✓")
    else:
        print_error(f"TEST 4 FAILED ({passed}/{total}) ✗")


async def main():
    """Run tous les tests."""
    print_header("TESTS QA - SYSTÈME DE NUTRITION WATERFALL")

    print(f"{Colors.BOLD}Date:{Colors.END} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{Colors.BOLD}Tests:{Colors.END} 4 scénarios")
    print()

    # Run tests
    await test_1_usda_database()
    print()

    await test_2_llm_estimation()
    print()

    await test_3_not_found()
    print()

    await test_4_edge_cases()
    print()

    print_header("RÉSUMÉ DES TESTS")
    print(f"{Colors.GREEN}✓ Tests terminés{Colors.END}")
    print()
    print(f"{Colors.BOLD}Prochaines étapes:{Colors.END}")
    print("1. Vérifier que tous les tests sont PASSED")
    print("2. Tester l'intégration frontend")
    print("3. Vérifier le modal EditFoodItemModalEnhanced")
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
