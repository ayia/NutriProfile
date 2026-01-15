"""
Service de traduction des noms d'aliments vers l'anglais pour recherche USDA.

Utilise LLM pour traduction contextuelle des termes alimentaires.
"""

import re
from typing import Optional
import structlog

from app.llm.client import get_hf_client
from app.llm.models import ModelCapability, get_primary_models

logger = structlog.get_logger()

# Cache simple en mémoire pour éviter de traduire plusieurs fois le même aliment
_translation_cache: dict[tuple[str, str], str] = {}


async def translate_food_name_to_english(
    food_name: str,
    source_language: str
) -> str:
    """
    Traduit un nom d'aliment vers l'anglais pour recherche USDA.

    Args:
        food_name: Nom de l'aliment dans la langue source
        source_language: Code langue ISO (fr, ar, es, de, pt, zh, en)

    Returns:
        Nom traduit en anglais, ou nom original si déjà en anglais
    """
    # Si déjà en anglais, pas besoin de traduire
    if source_language == "en":
        return food_name

    # Vérifier le cache
    cache_key = (food_name.lower(), source_language)
    if cache_key in _translation_cache:
        logger.info(
            "translation_cache_hit",
            food_name=food_name,
            language=source_language,
            cached_translation=_translation_cache[cache_key]
        )
        return _translation_cache[cache_key]

    # Traduction via LLM
    try:
        client = get_hf_client()
        models = get_primary_models(ModelCapability.NUTRITION_ESTIMATION)
        model = models[0] if models else None

        if not model:
            logger.warning("no_translation_model", returning_original=food_name)
            return food_name

        # Prompt optimisé pour traduction culinaire
        prompt = f"""Tu es un traducteur expert en terminologie culinaire.

Traduis ce nom d'aliment en anglais américain standard.
Retourne UNIQUEMENT le nom traduit, sans explication.

Langue source: {_get_language_name(source_language)}
Aliment: {food_name}

Règles:
- Utilise les termes USDA standards (ex: "zucchini" pas "courgette")
- Pour les plats composés, traduis littéralement (ex: "poulet grillé" → "grilled chicken")
- Garde les noms de marques intacts
- Si incertain, traduis mot à mot

Traduction anglaise:"""

        response = await client.text_generation(
            model_id=model.id,
            prompt=prompt,
            max_new_tokens=50,
            temperature=0.3  # Basse température pour cohérence
        )

        # Extraire la traduction (nettoyer la réponse)
        translation = _clean_translation(response)

        # Sauvegarder dans le cache
        _translation_cache[cache_key] = translation

        logger.info(
            "food_translation",
            original=food_name,
            language=source_language,
            translation=translation,
            model=model.id
        )

        return translation

    except Exception as e:
        logger.error(
            "translation_error",
            food_name=food_name,
            language=source_language,
            error=str(e)
        )
        # En cas d'erreur, retourner l'original
        return food_name


def _clean_translation(raw_translation: str) -> str:
    """
    Nettoie la réponse du LLM pour extraire uniquement le nom traduit.
    """
    # Supprimer les espaces inutiles
    translation = raw_translation.strip()

    # Supprimer les guillemets si présents
    translation = translation.strip('"').strip("'")

    # Prendre uniquement la première ligne si multi-lignes
    translation = translation.split('\n')[0].strip()

    # Supprimer les préfixes courants du LLM
    prefixes_to_remove = [
        "Translation:",
        "Traduction:",
        "English:",
        "Anglais:",
        "The translation is:",
        "La traduction est:",
    ]
    for prefix in prefixes_to_remove:
        if translation.lower().startswith(prefix.lower()):
            translation = translation[len(prefix):].strip()

    # Supprimer les suffixes explicatifs
    # Ex: "grilled chicken (standard USDA term)"
    translation = re.sub(r'\s*\([^)]*\)\s*$', '', translation)

    return translation


def _get_language_name(code: str) -> str:
    """Retourne le nom complet de la langue."""
    languages = {
        "fr": "Français",
        "en": "English",
        "ar": "العربية (Arabic)",
        "de": "Deutsch (German)",
        "es": "Español (Spanish)",
        "pt": "Português (Portuguese)",
        "zh": "中文 (Chinese)"
    }
    return languages.get(code, code)


def clear_translation_cache():
    """Vide le cache de traduction (utile pour tests)."""
    _translation_cache.clear()
    logger.info("translation_cache_cleared")
