"""
Module i18n pour la gestion multilingue du backend.
Gère les traductions pour les agents IA et les réponses API.
"""

from .translator import Translator, get_translator
from .constants import SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LanguageCode

__all__ = [
    "Translator",
    "get_translator",
    "SUPPORTED_LANGUAGES",
    "DEFAULT_LANGUAGE",
    "LanguageCode",
]
