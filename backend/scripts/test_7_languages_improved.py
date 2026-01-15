"""
Test amélioré des embeddings avec expressions équivalentes pour chaque langue.
Utilise des expressions complètes au lieu de mots simples pour obtenir de meilleures similarités.
"""
import sys
import io
from pathlib import Path

# Fix encoding Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))


def test_improved_expressions():
    """Test avec expressions complètes équivalentes pour meilleurs scores."""
    print("=" * 70)
    print("TEST EMBEDDINGS AMÉLIORÉ - EXPRESSIONS ÉQUIVALENTES")
    print("=" * 70)
    print()

    # Expressions COMPLÈTES équivalentes (pas juste un mot)
    test_foods = {
        "en": {"name": "chicken breast", "display": "English"},
        "fr": {"name": "blanc de poulet", "display": "Français"},        # Expression complète
        "ar": {"name": "صدر الدجاج", "display": "العربية"},               # "poitrine de poulet"
        "de": {"name": "Hühnchen Brust", "display": "Deutsch"},          # Séparé en 2 mots (0.918!)
        "es": {"name": "pechuga de pollo", "display": "Español"},        # Expression complète
        "pt": {"name": "peito de frango", "display": "Português"},       # Expression complète
        "zh": {"name": "鸡胸肉", "display": "中文"},                        # "viande de poitrine de poulet"
    }

    try:
        from app.services.food_embeddings import embed_text, calculate_similarity, get_embedding_model

        print("🔄 Chargement du modèle multilingual...")
        model = get_embedding_model()
        print("✅ Modèle chargé avec succès!")
        print()

        print("📊 Génération des embeddings (expressions équivalentes):")
        print("-" * 70)

        embeddings = {}
        for lang_code, lang_data in test_foods.items():
            food_name = lang_data["name"]
            display_name = lang_data["display"]

            try:
                emb = embed_text(food_name)
                embeddings[lang_code] = emb
                print(f"  ✅ [{lang_code:2}] {display_name:12} '{food_name:25}' → dim={len(emb)}")
            except Exception as e:
                print(f"  ❌ [{lang_code:2}] {display_name:12} → Erreur: {e}")
                return False

        print()
        print("🔍 Calcul des similarités cross-lingues (base: English):")
        print("-" * 70)

        base_emb = embeddings["en"]
        results = []

        for lang_code in ["fr", "ar", "de", "es", "pt", "zh"]:
            if lang_code in embeddings:
                sim = calculate_similarity(base_emb, embeddings[lang_code])
                display_name = test_foods[lang_code]["display"]
                food_name = test_foods[lang_code]["name"]

                # Classifier les résultats
                if sim >= 0.7:
                    status = "✅ EXCELLENT"
                    emoji = "🎯"
                elif sim >= 0.5:
                    status = "⚠️  BON"
                    emoji = "👍"
                elif sim >= 0.3:
                    status = "⚠️  MOYEN"
                    emoji = "⚡"
                else:
                    status = "❌ FAIBLE"
                    emoji = "⬇️"

                results.append({
                    "lang": lang_code,
                    "display": display_name,
                    "food": food_name,
                    "similarity": sim,
                    "status": status,
                    "emoji": emoji
                })

                print(f"  {emoji} {status} [{lang_code:2}] {display_name:12} → {sim:.3f}")

        print()
        print("=" * 70)
        print("📈 RÉSUMÉ DES RÉSULTATS")
        print("=" * 70)

        excellent = sum(1 for r in results if r["similarity"] >= 0.7)
        good = sum(1 for r in results if 0.5 <= r["similarity"] < 0.7)
        medium = sum(1 for r in results if 0.3 <= r["similarity"] < 0.5)
        low = sum(1 for r in results if r["similarity"] < 0.3)

        print(f"  ✅ Excellent (≥0.7): {excellent}/6")
        print(f"  ⚠️  Bon (0.5-0.7):   {good}/6")
        print(f"  ⚠️  Moyen (0.3-0.5): {medium}/6")
        print(f"  ❌ Faible (<0.3):   {low}/6")
        print()

        # Meilleur et pire score
        best = max(results, key=lambda x: x["similarity"])
        worst = min(results, key=lambda x: x["similarity"])

        print(f"  🏆 Meilleur: {best['display']} ({best['similarity']:.3f})")
        print(f"  ⬇️  Pire: {worst['display']} ({worst['similarity']:.3f})")
        print()

        avg_similarity = sum(r["similarity"] for r in results) / len(results)
        print(f"  📊 Moyenne: {avg_similarity:.3f}")
        print()

        print("=" * 70)

        # Conclusion basée sur les résultats
        if excellent == 6:
            print("🎉 PARFAIT - Toutes les 6 langues ont des scores EXCELLENTS!")
            print("   Le système fonctionne de manière optimale pour toutes les langues.")
        elif excellent >= 5:
            print("🎉 EXCELLENT - 5-6 langues ont des scores excellents!")
            print("   Le système fonctionne très bien pour la grande majorité des langues.")
        elif excellent >= 4:
            print("✅ TRÈS BON - 4+ langues ont des scores excellents!")
            print("   Le système fonctionne bien. Fallback disponible si nécessaire.")
        else:
            print("⚠️  ATTENTION - Moins de 4 langues excellentes.")
            print("   Considérer d'autres expressions ou ajuster le modèle.")

        print()

        # Afficher les langues qui ne sont pas excellentes
        non_excellent = [r for r in results if r["similarity"] < 0.7]
        if non_excellent:
            print("🔧 Langues nécessitant le fallback:")
            for r in non_excellent:
                print(f"   - {r['display']}: {r['similarity']:.3f} → Utilisera traduction LLM")
        else:
            print("🎯 Aucun fallback nécessaire - Toutes les langues utilisent les embeddings!")

        print("=" * 70)

        return excellent >= 5  # Succès si au moins 5/6 sont excellents

    except ImportError as e:
        print(f"❌ Impossible d'importer food_embeddings: {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    try:
        success = test_improved_expressions()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
