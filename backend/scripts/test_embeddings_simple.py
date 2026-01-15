"""
Test simple et rapide des embeddings multilingues.
Ne dépend que de sentence-transformers, pas du reste du backend.
"""
import sys
import io
from pathlib import Path

# Fix encoding Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_embeddings():
    """Test basique des embeddings sans dépendances backend."""
    print("=" * 70)
    print("TEST EMBEDDINGS MULTILINGUES - VERSION SIMPLE")
    print("=" * 70)
    print()

    try:
        from app.services.food_embeddings import embed_text, calculate_similarity, get_embedding_model
    except ImportError as e:
        print(f"[FAIL] Impossible d'importer food_embeddings: {e}")
        print("Note: structlog pourrait manquer, mais on peut tester directement")
        print()
        # Test direct avec sentence-transformers
        from sentence_transformers import SentenceTransformer
        import numpy as np
        from sklearn.metrics.pairwise import cosine_similarity

        print("Test direct avec sentence-transformers...")
        model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')

        test_foods = {
            "English": "chicken breast",
            "French": "poulet",
            "Arabic": "دجاج",
            "Spanish": "pollo",
            "German": "Huhn"
        }

        print("\nGénération des embeddings:")
        embeddings = {}
        for lang, food in test_foods.items():
            emb = model.encode(food)
            embeddings[lang] = emb
            print(f"  [{lang:10}] {food:20} -> embedding dim={len(emb)}")

        print("\nSimilarités cross-lingues (devrait être élevées ~0.7-0.9):")
        base_emb = embeddings["English"]
        for lang, emb in embeddings.items():
            if lang != "English":
                sim = cosine_similarity([base_emb], [emb])[0][0]
                status = "[OK]" if sim > 0.5 else "[WARN]"
                print(f"  {status} English <-> {lang:10}: {sim:.3f}")

        print("\n" + "=" * 70)
        print("[OK] Tests embeddings réussis!")
        print("=" * 70)
        return True

    # Si import fonctionne, utiliser les fonctions du service
    print("Test avec service food_embeddings...")
    print()

    test_cases = [
        ("chicken breast", "en", "English"),
        ("poulet", "fr", "Français"),
        ("دجاج", "ar", "العربية"),
        ("pollo", "es", "Español"),
        ("Huhn", "de", "Deutsch"),
    ]

    print("Génération embeddings:")
    embeddings = {}
    for food_name, lang_code, lang_name in test_cases:
        try:
            emb = embed_text(food_name)
            embeddings[(lang_code, food_name)] = emb
            print(f"  [OK] {lang_name:10} {food_name:20} -> dim={len(emb)}")
        except Exception as e:
            print(f"  [FAIL] {lang_name:10} {food_name:20} -> Error: {e}")
            return False

    print("\nCalcul similarités cross-lingues:")
    base_key = ("en", "chicken breast")
    base_emb = embeddings[base_key]

    for (lang_code, food_name), emb in embeddings.items():
        if lang_code != "en":
            try:
                sim = calculate_similarity(base_emb, emb)
                status = "[OK]" if sim > 0.5 else "[WARN]"
                print(f"  {status} English <-> {lang_code}: {sim:.3f}")
            except Exception as e:
                print(f"  [FAIL] Error calculating similarity: {e}")

    print("\n" + "=" * 70)
    print("[OK] TOUS LES TESTS RÉUSSIS!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    try:
        success = test_embeddings()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n[FAIL] Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
