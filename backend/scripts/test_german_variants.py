"""
Test spécifique pour trouver la meilleure expression allemande pour "chicken breast".
"""
import sys
import io
from pathlib import Path

# Fix encoding Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))


def test_german_variants():
    """Teste plusieurs variantes allemandes pour trouver le meilleur match."""
    print("=" * 70)
    print("TEST VARIANTES ALLEMANDES POUR 'CHICKEN BREAST'")
    print("=" * 70)
    print()

    # Différentes variantes allemandes
    german_variants = [
        ("Hähnchenbrust", "Mot composé standard"),
        ("Hühnerbrust", "Variante avec Hühner"),
        ("Hühnchen Brust", "Séparé en 2 mots"),
        ("Putenbrust", "Poitrine de dinde (alternative)"),
        ("Geflügelbrust", "Poitrine de volaille"),
        ("Hähnchenfleisch", "Viande de poulet"),
        ("Hühnerbrustfilet", "Filet de poitrine"),
        ("gegrilltes Hähnchen", "Poulet grillé"),
        ("Hähnchenbrustfilet", "Filet de poitrine de poulet"),
        ("mageres Hühnerfleisch", "Viande maigre de poulet"),
    ]

    try:
        from app.services.food_embeddings import embed_text, calculate_similarity

        print("📊 Test des variantes allemandes:")
        print("-" * 70)

        # Embedding de référence
        base_text = "chicken breast"
        base_emb = embed_text(base_text)
        print(f"Base (EN): '{base_text}'")
        print()

        results = []
        for german_text, description in german_variants:
            try:
                german_emb = embed_text(german_text)
                sim = calculate_similarity(base_emb, german_emb)

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
                    "text": german_text,
                    "desc": description,
                    "similarity": sim,
                    "status": status,
                    "emoji": emoji
                })

                print(f"  {emoji} {status} {sim:.3f} - '{german_text:30}' ({description})")

            except Exception as e:
                print(f"  ❌ Erreur pour '{german_text}': {e}")

        print()
        print("=" * 70)
        print("📈 RÉSULTATS TRIÉS PAR SCORE")
        print("=" * 70)

        # Trier par similarité décroissante
        results_sorted = sorted(results, key=lambda x: x["similarity"], reverse=True)

        for i, r in enumerate(results_sorted[:5], 1):
            print(f"  {i}. {r['emoji']} {r['similarity']:.3f} - '{r['text']}'")
            print(f"      → {r['desc']}")

        print()
        print("=" * 70)

        # Recommandation
        best = results_sorted[0]
        print(f"🏆 MEILLEUR CHOIX: '{best['text']}'")
        print(f"   Score: {best['similarity']:.3f}")
        print(f"   Description: {best['desc']}")
        print()

        if best['similarity'] >= 0.7:
            print("✅ EXCELLENT! Cette expression atteint le seuil requis (≥0.7)")
        else:
            print(f"⚠️  Score insuffisant ({best['similarity']:.3f} < 0.7)")
            print("   L'allemand utilisera le fallback traduction pour 'chicken breast'")

        print("=" * 70)

        return best['similarity'] >= 0.7

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
        success = test_german_variants()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
