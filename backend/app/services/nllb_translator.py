"""
Service de traduction NLLB-200 pour les noms d'aliments.

Utilise le modèle Facebook NLLB-200 (No Language Left Behind) via HuggingFace Inference API
pour traduire les noms d'aliments de n'importe quelle langue vers l'anglais.

NLLB-200 est spécialisé dans la traduction et supporte 200 langues avec une haute précision.
Beaucoup plus performant que les LLM génériques pour la traduction pure.

Langues supportées par le projet:
- EN (English) - Langue cible
- FR (Français) - Natif USDA/OFF
- DE (Deutsch) - Natif USDA/OFF
- ES (Español) - Natif USDA/OFF
- PT (Português) - Natif USDA/OFF
- ZH (中文) - Nécessite traduction
- AR (العربية) - Nécessite traduction
"""

import asyncio
from typing import Optional
import httpx
import structlog

from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()

# ==========================================
# Configuration NLLB-200
# ==========================================

# Modèle NLLB-200 sur HuggingFace (1.3B parameters, bon équilibre qualité/vitesse)
NLLB_MODEL_ID = "facebook/nllb-200-distilled-600M"

# Mapping des codes ISO vers codes NLLB
# NLLB utilise des codes de langue spécifiques (flores200)
NLLB_LANGUAGE_CODES = {
    "en": "eng_Latn",  # English
    "fr": "fra_Latn",  # French
    "de": "deu_Latn",  # German
    "es": "spa_Latn",  # Spanish
    "pt": "por_Latn",  # Portuguese
    "zh": "zho_Hans",  # Chinese Simplified
    "ar": "arb_Arab",  # Arabic
}

# Langues qui nécessitent traduction (non supportées nativement par USDA/OFF)
LANGUAGES_REQUIRING_TRANSLATION = {"zh", "ar"}

# Langues supportées nativement par USDA/OFF (pas besoin de traduction)
NATIVE_API_LANGUAGES = {"en", "fr", "de", "es", "pt"}

# Cache en mémoire pour éviter les appels API répétés
_translation_cache: dict[tuple[str, str, str], str] = {}

# Configuration
MAX_RETRIES = 3
TIMEOUT_SECONDS = 30.0


# ==========================================
# Service de traduction
# ==========================================

async def translate_with_nllb(
    text: str,
    source_lang: str,
    target_lang: str = "en"
) -> str:
    """
    Traduit un texte d'une langue source vers une langue cible avec NLLB-200.

    Args:
        text: Texte à traduire
        source_lang: Code langue ISO source (fr, en, de, es, pt, zh, ar)
        target_lang: Code langue ISO cible (défaut: en)

    Returns:
        Texte traduit
    """
    # Normaliser les codes de langue
    source_lang = source_lang.lower()
    target_lang = target_lang.lower()

    # Si même langue, pas besoin de traduire
    if source_lang == target_lang:
        return text

    # Vérifier le cache
    cache_key = (text.lower().strip(), source_lang, target_lang)
    if cache_key in _translation_cache:
        logger.debug(
            "nllb_cache_hit",
            text=text,
            source=source_lang,
            target=target_lang,
            cached=_translation_cache[cache_key]
        )
        return _translation_cache[cache_key]

    # Vérifier si les langues sont supportées
    if source_lang not in NLLB_LANGUAGE_CODES:
        logger.warning("nllb_unsupported_source_lang", lang=source_lang)
        return text

    if target_lang not in NLLB_LANGUAGE_CODES:
        logger.warning("nllb_unsupported_target_lang", lang=target_lang)
        return text

    # Obtenir les codes NLLB
    src_code = NLLB_LANGUAGE_CODES[source_lang]
    tgt_code = NLLB_LANGUAGE_CODES[target_lang]

    # Appeler l'API HuggingFace
    try:
        translation = await _call_nllb_api(text, src_code, tgt_code)

        # Sauvegarder dans le cache
        if translation:
            _translation_cache[cache_key] = translation
            logger.info(
                "nllb_translation_success",
                original=text,
                translated=translation,
                source=source_lang,
                target=target_lang
            )
            return translation

    except Exception as e:
        logger.error(
            "nllb_translation_error",
            text=text,
            source=source_lang,
            target=target_lang,
            error=str(e)
        )

    # Fallback: retourner le texte original
    return text


async def translate_food_to_english(
    food_name: str,
    source_lang: str
) -> str:
    """
    Traduit un nom d'aliment vers l'anglais pour recherche USDA/OFF.

    Optimisé pour les noms d'aliments avec gestion intelligente:
    - Si la langue est supportée nativement par USDA/OFF (fr, de, es, pt), retourne l'original
    - Si la langue nécessite traduction (zh, ar), utilise NLLB-200
    - Si déjà en anglais, retourne l'original

    Args:
        food_name: Nom de l'aliment
        source_lang: Code langue ISO (fr, en, de, es, pt, zh, ar)

    Returns:
        Nom en anglais (ou original si déjà supporté)
    """
    source_lang = source_lang.lower()

    # Déjà en anglais
    if source_lang == "en":
        return food_name

    # Langue supportée nativement par les APIs - peut fonctionner sans traduction
    # Mais on traduit quand même pour améliorer les résultats USDA
    if source_lang in NATIVE_API_LANGUAGES:
        # Pour ces langues, USDA peut fonctionner directement
        # Mais la traduction améliore les résultats
        return await translate_with_nllb(food_name, source_lang, "en")

    # Langues nécessitant obligatoirement une traduction (zh, ar)
    if source_lang in LANGUAGES_REQUIRING_TRANSLATION:
        return await translate_with_nllb(food_name, source_lang, "en")

    # Langue inconnue - essayer quand même la traduction
    return await translate_with_nllb(food_name, source_lang, "en")


def needs_translation(language: str) -> bool:
    """
    Vérifie si une langue nécessite une traduction pour l'API.

    Args:
        language: Code langue ISO

    Returns:
        True si la langue nécessite traduction (zh, ar)
    """
    return language.lower() in LANGUAGES_REQUIRING_TRANSLATION


async def _call_nllb_api(
    text: str,
    src_lang_code: str,
    tgt_lang_code: str
) -> Optional[str]:
    """
    Appelle l'API HuggingFace Inference pour NLLB-200.

    Args:
        text: Texte à traduire
        src_lang_code: Code NLLB source (ex: "zho_Hans")
        tgt_lang_code: Code NLLB cible (ex: "eng_Latn")

    Returns:
        Texte traduit ou None en cas d'erreur
    """
    if not settings.HUGGINGFACE_TOKEN:
        logger.warning("nllb_no_token", message="HUGGINGFACE_TOKEN not configured")
        return None

    url = f"https://router.huggingface.co/models/{NLLB_MODEL_ID}"
    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACE_TOKEN}",
        "Content-Type": "application/json"
    }

    # Payload pour le modèle NLLB-200
    payload = {
        "inputs": text,
        "parameters": {
            "src_lang": src_lang_code,
            "tgt_lang": tgt_lang_code,
        }
    }

    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        for attempt in range(MAX_RETRIES):
            try:
                response = await client.post(url, headers=headers, json=payload)

                # Modèle en cours de chargement
                if response.status_code == 503:
                    data = response.json()
                    wait_time = min(data.get("estimated_time", 20), 30)
                    logger.info(
                        "nllb_model_loading",
                        wait_time=wait_time,
                        attempt=attempt + 1
                    )
                    await asyncio.sleep(wait_time)
                    continue

                # Erreur d'authentification
                if response.status_code in (401, 403):
                    logger.error(
                        "nllb_auth_error",
                        status=response.status_code,
                        detail="Invalid or missing HuggingFace token"
                    )
                    return None

                response.raise_for_status()
                result = response.json()

                # Extraire la traduction
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("translation_text", "").strip()

                if isinstance(result, dict):
                    return result.get("translation_text", "").strip()

                logger.warning("nllb_unexpected_response", response=result)
                return None

            except httpx.HTTPStatusError as e:
                logger.error(
                    "nllb_http_error",
                    status=e.response.status_code,
                    detail=e.response.text[:200],
                    attempt=attempt + 1
                )
                if attempt == MAX_RETRIES - 1:
                    raise
                await asyncio.sleep(2 ** attempt)

            except httpx.RequestError as e:
                logger.error(
                    "nllb_request_error",
                    error=str(e),
                    attempt=attempt + 1
                )
                if attempt == MAX_RETRIES - 1:
                    raise
                await asyncio.sleep(2 ** attempt)

    return None


# ==========================================
# Batch Translation (pour optimisation future)
# ==========================================

async def translate_batch(
    texts: list[str],
    source_lang: str,
    target_lang: str = "en"
) -> list[str]:
    """
    Traduit un batch de textes en parallèle.

    Args:
        texts: Liste de textes à traduire
        source_lang: Code langue ISO source
        target_lang: Code langue ISO cible

    Returns:
        Liste de textes traduits (même ordre)
    """
    tasks = [
        translate_with_nllb(text, source_lang, target_lang)
        for text in texts
    ]
    return await asyncio.gather(*tasks)


# ==========================================
# Utilitaires
# ==========================================

def clear_translation_cache():
    """Vide le cache de traduction."""
    _translation_cache.clear()
    logger.info("nllb_cache_cleared")


def get_cache_stats() -> dict:
    """Retourne les statistiques du cache."""
    return {
        "size": len(_translation_cache),
        "languages_cached": list(set(k[1] for k in _translation_cache.keys())),
    }


def get_supported_languages() -> dict[str, str]:
    """Retourne les langues supportées avec leurs codes NLLB."""
    return {
        "en": "English (eng_Latn)",
        "fr": "Français (fra_Latn)",
        "de": "Deutsch (deu_Latn)",
        "es": "Español (spa_Latn)",
        "pt": "Português (por_Latn)",
        "zh": "中文 (zho_Hans)",
        "ar": "العربية (arb_Arab)",
    }
