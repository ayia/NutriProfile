"""
Constantes pour l'internationalisation.
"""

from typing import Literal

# Langues supportées
SUPPORTED_LANGUAGES = ["en", "fr", "de", "es", "pt", "zh", "ar"]

# Langue par défaut
DEFAULT_LANGUAGE = "en"

# Type pour les codes de langue
LanguageCode = Literal["en", "fr", "de", "es", "pt", "zh", "ar"]

# Configuration RTL
RTL_LANGUAGES = ["ar"]

# Noms des langues
LANGUAGE_NAMES = {
    "en": "English",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
    "pt": "Português",
    "zh": "中文",
    "ar": "العربية",
}
