"""
Service d'embeddings multilingues pour recherche sémantique d'aliments.

Utilise sentence-transformers/paraphrase-multilingual-mpnet-base-v2
pour une recherche sémantique cross-lingue de haute qualité.

Architecture:
- Embeddings dimension: 768
- Langues supportées: 50+ (incluant FR, EN, AR, DE, ES, PT, ZH)
- Similarity: Cosine similarity avec seuil 0.75
"""

from typing import Optional, List, Tuple
import pickle
from pathlib import Path
import structlog
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

logger = structlog.get_logger()

# Cache global pour le modèle et l'index
_model = None
_usda_embeddings_cache = None
_usda_foods_cache = None


def get_embedding_model():
    """
    Charge le modèle sentence-transformers multilingual.

    Returns:
        Modèle SentenceTransformer
    """
    global _model

    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer

            # Modèle multilingual optimisé (768 dimensions)
            model_name = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"

            logger.info("loading_embedding_model", model=model_name)
            _model = SentenceTransformer(model_name)
            logger.info("embedding_model_loaded", model=model_name)

        except Exception as e:
            logger.error("embedding_model_load_error", error=str(e))
            raise

    return _model


def embed_text(text: str) -> np.ndarray:
    """
    Convertit un texte en embedding vectoriel.

    Args:
        text: Texte à embedder (nom d'aliment)

    Returns:
        Vecteur embedding (768 dimensions)
    """
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding


def embed_batch(texts: List[str]) -> np.ndarray:
    """
    Convertit un batch de textes en embeddings.

    Args:
        texts: Liste de textes à embedder

    Returns:
        Matrice d'embeddings (N x 768)
    """
    model = get_embedding_model()
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    return embeddings


def calculate_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Calcule la similarité cosinus entre deux embeddings.

    Args:
        embedding1: Premier embedding
        embedding2: Deuxième embedding

    Returns:
        Score de similarité (0-1)
    """
    # Reshape pour sklearn
    emb1 = embedding1.reshape(1, -1)
    emb2 = embedding2.reshape(1, -1)

    similarity = cosine_similarity(emb1, emb2)[0][0]
    return float(similarity)


async def search_similar_foods(
    query_text: str,
    usda_foods: List[dict],
    top_k: int = 5,
    threshold: float = 0.75
) -> List[Tuple[dict, float]]:
    """
    Recherche les aliments USDA les plus similaires sémantiquement.

    Args:
        query_text: Nom de l'aliment recherché (n'importe quelle langue)
        usda_foods: Liste des aliments USDA avec leurs embeddings
        top_k: Nombre de résultats à retourner
        threshold: Seuil de similarité minimum (0.75 recommandé)

    Returns:
        Liste de tuples (aliment, score_similarité) triée par score décroissant
    """
    # Embedder la query
    query_embedding = embed_text(query_text)

    # Calculer similarités avec tous les aliments USDA
    similarities = []

    for food in usda_foods:
        if "embedding" not in food:
            continue

        food_embedding = np.array(food["embedding"])
        similarity = calculate_similarity(query_embedding, food_embedding)

        if similarity >= threshold:
            similarities.append((food, similarity))

    # Trier par similarité décroissante
    similarities.sort(key=lambda x: x[1], reverse=True)

    return similarities[:top_k]


def save_embeddings_cache(usda_foods: List[dict], cache_path: str = "usda_embeddings.pkl"):
    """
    Sauvegarde les embeddings USDA dans un fichier cache.

    Args:
        usda_foods: Liste des aliments avec embeddings
        cache_path: Chemin du fichier cache
    """
    cache_file = Path(cache_path)

    try:
        with open(cache_file, 'wb') as f:
            pickle.dump(usda_foods, f)

        logger.info("embeddings_cache_saved", path=str(cache_file), count=len(usda_foods))

    except Exception as e:
        logger.error("embeddings_cache_save_error", error=str(e))


def load_embeddings_cache(cache_path: str = "usda_embeddings.pkl") -> Optional[List[dict]]:
    """
    Charge les embeddings USDA depuis le fichier cache.

    Args:
        cache_path: Chemin du fichier cache

    Returns:
        Liste des aliments avec embeddings ou None si cache absent
    """
    global _usda_foods_cache

    if _usda_foods_cache is not None:
        return _usda_foods_cache

    cache_file = Path(cache_path)

    if not cache_file.exists():
        logger.warning("embeddings_cache_not_found", path=str(cache_file))
        return None

    try:
        with open(cache_file, 'rb') as f:
            usda_foods = pickle.load(f)

        _usda_foods_cache = usda_foods
        logger.info("embeddings_cache_loaded", path=str(cache_file), count=len(usda_foods))

        return usda_foods

    except Exception as e:
        logger.error("embeddings_cache_load_error", error=str(e))
        return None


async def build_usda_embeddings_index(usda_foods_raw: List[dict]) -> List[dict]:
    """
    Construit l'index d'embeddings pour tous les aliments USDA.

    Cette fonction doit être exécutée UNE SEULE FOIS pour pré-calculer
    les embeddings de tous les aliments USDA.

    Args:
        usda_foods_raw: Liste des aliments USDA (format API)

    Returns:
        Liste des aliments avec leurs embeddings ajoutés
    """
    logger.info("building_usda_embeddings_index", count=len(usda_foods_raw))

    # Préparer les textes à embedder
    food_names = [food.get("description", "") for food in usda_foods_raw]

    # Embedder en batch (beaucoup plus rapide)
    embeddings = embed_batch(food_names)

    # Ajouter les embeddings aux aliments
    usda_foods_with_embeddings = []
    for i, food in enumerate(usda_foods_raw):
        food_copy = food.copy()
        food_copy["embedding"] = embeddings[i].tolist()  # Convertir en liste pour JSON/pickle
        usda_foods_with_embeddings.append(food_copy)

    logger.info("usda_embeddings_index_built", count=len(usda_foods_with_embeddings))

    return usda_foods_with_embeddings


# Exemples d'utilisation
"""
# === CONSTRUCTION DE L'INDEX (UNE FOIS) ===
from app.services.nutrition_database import USDANutritionService

usda_service = USDANutritionService()
usda_foods_raw = await usda_service.search_food("chicken", max_results=1000)
usda_foods_with_embeddings = await build_usda_embeddings_index(usda_foods_raw)
save_embeddings_cache(usda_foods_with_embeddings)


# === RECHERCHE MULTILINGUE ===
usda_foods = load_embeddings_cache()

# Recherche en français
results_fr = await search_similar_foods("poulet grillé", usda_foods, top_k=3)

# Recherche en arabe
results_ar = await search_similar_foods("دجاج", usda_foods, top_k=3)

# Recherche en espagnol
results_es = await search_similar_foods("pollo asado", usda_foods, top_k=3)

for food, score in results_fr:
    print(f"{food['description']}: {score:.2f}")
"""
