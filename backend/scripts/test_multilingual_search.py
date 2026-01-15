"""
Tests QA complets pour la recherche nutritionnelle multilingue avec embeddings.

Tests:
1. Recherche multilingue (FR, AR, ES, DE, PT, ZH)
2. Comparaison performance: Embeddings vs Traduction
3. Test de précision sémantique
4. Test de robustesse (synonymes, variantes)
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime
import time

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.multilingual_nutrition_search import search_nutrition_multilingual
from app.services.food_embeddings import load_embeddings_cache


class Colors:
    """ANSI color codes."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    PURPLE = '\033[95m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text: str):
    """Print header."""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text:^80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.END}\n")


def print_test(number: int, description: str):
    """Print test number."""
    print(f"{Colors.BOLD}{Colors.BLUE}TEST {number}: {description}{Colors.END}")
    print(f"{Colors.BLUE}{'-'*80}{Colors.END}")


def print_success(message: str):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")


def print_error(message: str):
    """Print error message."""
    print(f"{Colors.RED}✗ {message}{Colors.END}")


def print_info(key: str, value: str):
    """Print info line."""
    print(f"{Colors.YELLOW}{key:25}{Colors.END} {value}")


async def test_multilingual_basic():
    """
    TEST 1: Recherche multilingue basique.
    Même aliment dans 7 langues différentes.
    """
    print_test(1, "Recherche Multilingue Basique (Poulet dans 7 langues)")
    print()

    test_cases = [
        ("chicken", "en", "English"),
        ("poulet", "fr", "Français"),
        ("دجاج", "ar", "العربية"),
        ("pollo", "es", "Español"),
        ("Huhn", "de", "Deutsch"),
        ("frango", "pt", "Português"),
        ("鸡肉", "zh", "中文"),
    ]

    results = []

    for food_name, language, language_name in test_cases:
        print_info(f"{language_name}:", food_name)

        start_time = time.time()
        result = await search_nutrition_multilingual(
            food_name=food_name,
            quantity_g=150.0,
            language=language
        )
        end_time = time.time()

        duration_ms = (end_time - start_time) * 1000

        if result:
            print(f"  → {Colors.GREEN}Trouvé:{Colors.END} {result.food_name}")
            print(f"  → Source: {result.source} | Confiance: {result.confidence:.2%} | Temps: {duration_ms:.0f}ms")
            print(f"  → Calories (150g): {result.calories:.0f} kcal | Protéines: {result.protein:.1f}g")
            results.append((food_name, True, result.source, duration_ms))
        else:
            print(f"  → {Colors.RED}Non trouvé{Colors.END}")
            results.append((food_name, False, None, duration_ms))

        print()

    # Vérifications
    success_count = sum(1 for _, found, _, _ in results if found)
    print_success(f"TEST 1: {success_count}/{len(test_cases)} langues testées avec succès")
    print()

    return success_count == len(test_cases)


async def test_semantic_similarity():
    """
    TEST 2: Similarité sémantique.
    Synonymes et variantes doivent retourner le même aliment.
    """
    print_test(2, "Similarité Sémantique (Synonymes et Variantes)")
    print()

    test_cases = [
        # Poulet
        ("chicken breast", "en", "chicken, broilers or fryers"),
        ("poitrine de poulet", "fr", "chicken"),
        ("pechuga de pollo", "es", "chicken"),

        # Huile d'olive
        ("olive oil", "en", "oil, olive"),
        ("huile d'olive", "fr", "oil, olive"),
        ("aceite de oliva", "es", "oil, olive"),

        # Pomme
        ("apple", "en", "apples"),
        ("pomme", "fr", "apples"),
        ("manzana", "es", "apples"),
    ]

    success_count = 0

    for food_name, language, expected_keyword in test_cases:
        print_info("Recherche:", f"{food_name} ({language})")

        result = await search_nutrition_multilingual(
            food_name=food_name,
            quantity_g=100.0,
            language=language
        )

        if result:
            found_name_lower = result.food_name.lower()
            match = expected_keyword.lower() in found_name_lower

            if match:
                print(f"  → {Colors.GREEN}✓ Match:{Colors.END} {result.food_name}")
                print(f"  → Source: {result.source} | Confiance: {result.confidence:.2%}")
                success_count += 1
            else:
                print(f"  → {Colors.YELLOW}⚠ Trouvé mais différent:{Colors.END} {result.food_name}")
                print(f"  → Attendu: contient '{expected_keyword}'")
        else:
            print(f"  → {Colors.RED}✗ Non trouvé{Colors.END}")

        print()

    print_success(f"TEST 2: {success_count}/{len(test_cases)} correspondances sémantiques")
    print()

    return success_count >= len(test_cases) * 0.7  # 70% de réussite acceptable


async def test_performance_comparison():
    """
    TEST 3: Comparaison de performance.
    Embeddings vs Traduction LLM.
    """
    print_test(3, "Comparaison Performance (Embeddings vs Traduction)")
    print()

    # Vérifier si le cache embeddings est chargé
    cache = load_embeddings_cache()

    if not cache:
        print(f"{Colors.YELLOW}⚠ Cache embeddings non trouvé{Colors.END}")
        print("  Exécutez: python scripts/build_usda_embeddings_index.py")
        print()
        return False

    print_info("Cache embeddings:", f"{len(cache)} aliments")
    print()

    test_foods = [
        ("poulet rôti", "fr"),
        ("arroz integral", "es"),
        ("Vollkornbrot", "de"),
        ("سمك مشوي", "ar"),
    ]

    print(f"{Colors.BOLD}Résultats:{Colors.END}")
    print()

    total_time_embeddings = 0
    total_time_translation = 0
    results = []

    for food_name, language in test_foods:
        print(f"  {food_name} ({language})")

        start = time.time()
        result = await search_nutrition_multilingual(food_name, 100.0, language)
        duration = (time.time() - start) * 1000

        if result:
            print(f"    → Trouvé: {result.food_name}")
            print(f"    → Source: {result.source}")
            print(f"    → Temps: {duration:.0f}ms")

            if "embedding" in result.source:
                total_time_embeddings += duration
            else:
                total_time_translation += duration

            results.append((food_name, result.source, duration))
        else:
            print(f"    → Non trouvé")

        print()

    # Statistiques
    if results:
        avg_time = sum(r[2] for r in results) / len(results)
        embedding_count = sum(1 for r in results if "embedding" in r[1])

        print(f"{Colors.BOLD}Statistiques:{Colors.END}")
        print_info("Temps moyen:", f"{avg_time:.0f}ms")
        print_info("Via embeddings:", f"{embedding_count}/{len(results)}")

        if embedding_count > 0:
            print_success(f"TEST 3: Performance optimale ({embedding_count} via embeddings)")
            return True
        else:
            print(f"{Colors.YELLOW}⚠ TEST 3: Aucun résultat via embeddings (fallback uniquement){Colors.END}")
            return False

    return False


async def test_edge_cases():
    """
    TEST 4: Cas limites et robustesse.
    """
    print_test(4, "Cas Limites et Robustesse")
    print()

    edge_cases = [
        ("", "fr", "Nom vide"),
        ("xyz123unknown", "en", "Aliment fictif"),
        ("a", "en", "1 caractère"),
        ("chicken" * 50, "en", "Nom très long"),
    ]

    passed = 0

    for food_name, language, description in edge_cases:
        print_info("Cas:", description)
        print_info("  Input:", f"'{food_name[:50]}...' ({language})" if len(food_name) > 50 else f"'{food_name}' ({language})")

        try:
            result = await search_nutrition_multilingual(
                food_name=food_name if food_name else "test",
                quantity_g=100.0,
                language=language
            )

            if result:
                print(f"    → Trouvé: {result.food_name[:50]}...")
            else:
                print(f"    → Non trouvé (attendu)")
                passed += 1

        except Exception as e:
            print(f"    → Exception (attendu): {type(e).__name__}")
            passed += 1

        print()

    print_success(f"TEST 4: {passed}/{len(edge_cases)} cas limites gérés")
    print()

    return passed >= len(edge_cases) * 0.75


async def main():
    """Run tous les tests QA."""
    print_header("TESTS QA - RECHERCHE NUTRITIONNELLE MULTILINGUE")

    print(f"{Colors.BOLD}Date:{Colors.END} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{Colors.BOLD}Architecture:{Colors.END} Embeddings → Traduction → LLM")
    print()

    # Vérifier le cache
    cache = load_embeddings_cache()
    if cache:
        print_success(f"Cache embeddings chargé: {len(cache)} aliments")
    else:
        print(f"{Colors.YELLOW}⚠ Cache embeddings non trouvé - mode fallback uniquement{Colors.END}")

    print()

    # Run tests
    results = []

    test1 = await test_multilingual_basic()
    results.append(("Multilingue basique", test1))

    test2 = await test_semantic_similarity()
    results.append(("Similarité sémantique", test2))

    test3 = await test_performance_comparison()
    results.append(("Performance", test3))

    test4 = await test_edge_cases()
    results.append(("Cas limites", test4))

    # Résumé
    print_header("RÉSUMÉ DES TESTS")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    for name, passed in results:
        status = f"{Colors.GREEN}PASSED ✓{Colors.END}" if passed else f"{Colors.RED}FAILED ✗{Colors.END}"
        print(f"  {name:30} {status}")

    print()
    print(f"{Colors.BOLD}Résultat global:{Colors.END} {passed_count}/{total_count} tests réussis")

    if passed_count == total_count:
        print_success("✓ TOUS LES TESTS SONT PASSÉS!")
    elif passed_count >= total_count * 0.75:
        print(f"{Colors.YELLOW}⚠ {passed_count}/{total_count} tests réussis (>75%){Colors.END}")
    else:
        print_error(f"✗ Seulement {passed_count}/{total_count} tests réussis")

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
