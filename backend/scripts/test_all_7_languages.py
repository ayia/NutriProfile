"""
Test complet des embeddings pour LES 7 LANGUES supportées par NutriProfile.
Teste: FR, EN, AR, DE, ES, PT, ZH (comme dans frontend/src/i18n/locales/)
"""
import sys
import io
from pathlib import Path

# Fix encoding Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))


def test_all_7_languages():
    """Test les embeddings multilingues pour les 7 langues du frontend."""
    print("=" * 70)
    print("TEST EMBEDDINGS - 7 LANGUES NUTRIPROFILE")
    print("=" * 70)
    print()

    # Les 7 langues exactes du frontend (frontend/src/i18n/locales/)
    test_foods = {
        "en": {"name": "chicken breast", "display": "English"},
        "fr": {"name": "poulet", "display": "Français"},
        "ar": {"name": "دجاج", "display": "العربية"},
        "de": {"name": "Huhn", "display": "Deutsch"},
        "es": {"name": "pollo", "display": "Español"},
        "pt": {"name": "frango", "display": "Português"},
        "zh": {"name": "鸡肉", "display": "中文"},
    }

    try:
        from app.services.food_embeddings import embed_text, calculate_similarity, get_embedding_model

        print("🔄 Chargement du modèle multilingual...")
        model = get_embedding_model()
        print("✅ Modèle chargé avec succès!")
        print()

        print("📊 Génération des embeddings pour les 7 langues:")
        print("-" * 70)

        embeddings = {}
        for lang_code, lang_data in test_foods.items():
            food_name = lang_data["name"]
            display_name = lang_data["display"]

            try:
                emb = embed_text(food_name)
                embeddings[lang_code] = emb
                print(f"  ✅ [{lang_code:2}] {display_name:12} '{food_name:20}' → dim={len(emb)}")
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
                    color = ""
                elif sim >= 0.5:
                    status = "⚠️  BON"
                    color = ""
                elif sim >= 0.3:
                    status = "⚠️  MOYEN"
                    color = ""
                else:
                    status = "❌ FAIBLE"
                    color = ""

                results.append({
                    "lang": lang_code,
                    "display": display_name,
                    "food": food_name,
                    "similarity": sim,
                    "status": status
                })

                print(f"  {status} [{lang_code:2}] {display_name:12} '{food_name:15}' → {sim:.3f}")

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

        # Conclusion
        if excellent >= 4:
            print("🎉 EXCELLENT - Le système fonctionne très bien pour la plupart des langues!")
        elif excellent + good >= 5:
            print("✅ BON - Le système fonctionne bien. Fallback disponible si nécessaire.")
        else:
            print("⚠️  MOYEN - Le système fonctionne, mais utilisera souvent le fallback traduction.")

        print()
        print("ℹ️  Note: Les similarités moyennes/faibles sont normales et seront")
        print("   compensées par le fallback traduction + LLM dans le waterfall.")
        print("=" * 70)

        return True

    except ImportError as e:
        print(f"❌ Impossible d'importer food_embeddings: {e}")
        print()
        print("Solution: Installez les dépendances avec:")
        print("  cd backend && python -m pip install sentence-transformers scikit-learn")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    try:
        success = test_all_7_languages()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
