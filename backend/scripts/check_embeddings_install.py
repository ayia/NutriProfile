"""
Script de vérification rapide de l'installation des dépendances embeddings.
"""
import sys

def check_dependencies():
    """Vérifie que toutes les dépendances nécessaires sont installées."""
    print("=" * 70)
    print("VERIFICATION INSTALLATION EMBEDDINGS")
    print("=" * 70)
    print()

    dependencies = [
        ("sentence_transformers", "Sentence Transformers"),
        ("sklearn", "scikit-learn"),
        ("numpy", "NumPy"),
        ("torch", "PyTorch"),
    ]

    all_ok = True

    for module_name, display_name in dependencies:
        try:
            module = __import__(module_name)
            version = getattr(module, "__version__", "N/A")
            print(f"[OK] {display_name:30} {version}")
        except ImportError as e:
            print(f"[FAIL] {display_name:30} NON INSTALLE")
            all_ok = False

    print()
    print("=" * 70)

    if all_ok:
        print("[OK] TOUTES LES DEPENDANCES SONT INSTALLEES")
        print()

        # Test rapide embedding
        try:
            from sentence_transformers import SentenceTransformer
            print("Test de chargement du modèle...")
            print("(Premiere execution: telechargement ~500MB attendu)")
            model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
            print("[OK] Modele charge avec succes!")

            # Test embedding simple
            test_text = "chicken breast"
            embedding = model.encode(test_text)
            print(f"[OK] Test embedding: dim={len(embedding)}")

        except Exception as e:
            print(f"[FAIL] Erreur lors du test: {e}")
            return False
    else:
        print("[FAIL] CERTAINES DEPENDANCES MANQUENT")
        print("Executez: python -m pip install sentence-transformers scikit-learn")
        return False

    print("=" * 70)
    return True

if __name__ == "__main__":
    success = check_dependencies()
    sys.exit(0 if success else 1)
