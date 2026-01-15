"""
Script pour construire l'index d'embeddings USDA.

IMPORTANT: Ce script doit être exécuté UNE SEULE FOIS pour pré-calculer
les embeddings de tous les aliments USDA et les mettre en cache.

Durée estimée: ~30-60 minutes pour 300,000 aliments
Taille du cache: ~500MB-1GB
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.nutrition_database import USDANutritionService
from app.services.food_embeddings import build_usda_embeddings_index, save_embeddings_cache


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


def print_info(key: str, value: str):
    """Print info line."""
    print(f"{Colors.YELLOW}{key:25}{Colors.END} {value}")


def print_success(message: str):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")


def print_error(message: str):
    """Print error message."""
    print(f"{Colors.RED}✗ {message}{Colors.END}")


async def main():
    """Build USDA embeddings index."""
    print_header("CONSTRUCTION INDEX EMBEDDINGS USDA")

    print(f"{Colors.BOLD}Date:{Colors.END} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    print_info("Modèle embedding:", "paraphrase-multilingual-mpnet-base-v2")
    print_info("Dimensions:", "768")
    print_info("Langues supportées:", "50+ (FR, EN, AR, DE, ES, PT, ZH, ...)")
    print()

    # === ÉTAPE 1: Récupérer les aliments USDA ===
    print(f"{Colors.BOLD}ÉTAPE 1: Récupération des aliments USDA...{Colors.END}")
    print()

    usda_service = USDANutritionService()

    # Stratégie: Rechercher plusieurs termes génériques pour obtenir une bonne couverture
    common_foods = [
        "chicken", "beef", "pork", "fish", "salmon", "tuna",
        "rice", "pasta", "bread", "potato", "tomato", "lettuce",
        "apple", "banana", "orange", "milk", "cheese", "yogurt",
        "egg", "butter", "oil", "sugar", "salt", "pepper"
    ]

    all_usda_foods = []
    seen_ids = set()

    for food_term in common_foods:
        try:
            print(f"  Recherche: '{food_term}'...")
            results = await usda_service.search_food(food_term, max_results=500)

            # Dédupliquer
            for food in results:
                food_id = food.get("fdcId")
                if food_id and food_id not in seen_ids:
                    all_usda_foods.append(food)
                    seen_ids.add(food_id)

        except Exception as e:
            print_error(f"Erreur lors de la recherche '{food_term}': {e}")

    print()
    print_success(f"Aliments USDA récupérés: {len(all_usda_foods)}")
    print()

    if len(all_usda_foods) == 0:
        print_error("Aucun aliment récupéré. Vérifiez votre clé API USDA.")
        return

    # === ÉTAPE 2: Construire les embeddings ===
    print(f"{Colors.BOLD}ÉTAPE 2: Construction des embeddings...{Colors.END}")
    print()
    print(f"{Colors.YELLOW}⚠ Ceci peut prendre 30-60 minutes selon votre CPU/GPU...{Colors.END}")
    print()

    try:
        start_time = datetime.now()

        usda_foods_with_embeddings = await build_usda_embeddings_index(all_usda_foods)

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        print()
        print_success(f"Embeddings construits en {duration:.1f} secondes")
        print_info("Aliments avec embeddings:", str(len(usda_foods_with_embeddings)))

    except Exception as e:
        print_error(f"Erreur lors de la construction: {e}")
        import traceback
        traceback.print_exc()
        return

    # === ÉTAPE 3: Sauvegarder le cache ===
    print()
    print(f"{Colors.BOLD}ÉTAPE 3: Sauvegarde du cache...{Colors.END}")
    print()

    cache_path = "usda_embeddings.pkl"

    try:
        save_embeddings_cache(usda_foods_with_embeddings, cache_path)
        print_success(f"Cache sauvegardé: {cache_path}")

        # Taille du fichier
        cache_file = Path(cache_path)
        if cache_file.exists():
            size_mb = cache_file.stat().st_size / (1024 * 1024)
            print_info("Taille du cache:", f"{size_mb:.1f} MB")

    except Exception as e:
        print_error(f"Erreur lors de la sauvegarde: {e}")
        return

    # === RÉSUMÉ ===
    print()
    print_header("INDEX CONSTRUIT AVEC SUCCÈS")

    print_success("L'index d'embeddings USDA est prêt!")
    print()
    print(f"{Colors.BOLD}Prochaines étapes:{Colors.END}")
    print("1. Placer le fichier 'usda_embeddings.pkl' dans le dossier backend/")
    print("2. Le système utilisera automatiquement cet index pour les recherches")
    print("3. Lancer les tests QA: python scripts/test_multilingual_search.py")
    print()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Construction interrompue par l'utilisateur{Colors.END}")
    except Exception as e:
        print(f"\n{Colors.RED}Erreur fatale: {e}{Colors.END}")
        import traceback
        traceback.print_exc()
