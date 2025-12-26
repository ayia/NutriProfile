"""
Classe Translator pour gérer les traductions backend.
Charge les fichiers de traduction JSON et fournit une interface simple.
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional
from .constants import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, LanguageCode


class Translator:
    """
    Gestionnaire de traductions pour le backend.

    Usage:
        translator = Translator("fr")
        message = translator.get("agents.coach.greeting")
        formatted = translator.get("agents.coach.calories_summary", calories=2000)
    """

    def __init__(self, language: str = DEFAULT_LANGUAGE):
        """
        Initialise le traducteur avec une langue.

        Args:
            language: Code de langue (en, fr, de, es, pt, zh, ar)
        """
        self.language = language if language in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE
        self._translations: Dict[str, Any] = {}
        self._fallback: Dict[str, Any] = {}
        self._load_translations()

    def _load_translations(self) -> None:
        """Charge les fichiers de traduction pour la langue courante et le fallback."""
        locales_dir = Path(__file__).parent / "locales"

        # Charger le fallback (anglais)
        fallback_dir = locales_dir / DEFAULT_LANGUAGE
        if fallback_dir.exists():
            self._fallback = self._load_locale_files(fallback_dir)

        # Charger la langue demandée
        lang_dir = locales_dir / self.language
        if lang_dir.exists():
            self._translations = self._load_locale_files(lang_dir)
        else:
            self._translations = self._fallback

    def _load_locale_files(self, locale_dir: Path) -> Dict[str, Any]:
        """Charge tous les fichiers JSON d'un répertoire de locale."""
        translations = {}
        for json_file in locale_dir.glob("*.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    namespace = json_file.stem
                    translations[namespace] = json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Erreur lors du chargement de {json_file}: {e}")
        return translations

    def get(self, key: str, **kwargs: Any) -> str:
        """
        Récupère une traduction par sa clé.

        Args:
            key: Clé de traduction (ex: "agents.coach.greeting")
            **kwargs: Variables pour l'interpolation

        Returns:
            La traduction formatée ou la clé si non trouvée
        """
        # Séparer le namespace et le chemin
        parts = key.split(".")

        if len(parts) < 2:
            return key

        namespace = parts[0]
        path = parts[1:]

        # Chercher dans les traductions puis le fallback
        value = self._get_nested(self._translations.get(namespace, {}), path)
        if value is None:
            value = self._get_nested(self._fallback.get(namespace, {}), path)

        if value is None:
            return key

        # Interpolation des variables
        if kwargs:
            try:
                # Support format Python {var} et i18next {{var}}
                for k, v in kwargs.items():
                    value = value.replace(f"{{{{{k}}}}}", str(v))  # {{var}}
                    value = value.replace(f"{{{k}}}", str(v))       # {var}
            except (AttributeError, TypeError):
                pass

        return value

    def _get_nested(self, data: Dict[str, Any], keys: list) -> Optional[str]:
        """Récupère une valeur dans un dictionnaire imbriqué."""
        current = data
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        return current if isinstance(current, str) else None

    def get_prompt(self, agent_name: str, prompt_name: str, **kwargs: Any) -> str:
        """
        Récupère un prompt pour un agent IA.

        Args:
            agent_name: Nom de l'agent (coach, vision, recipe, etc.)
            prompt_name: Nom du prompt
            **kwargs: Variables pour l'interpolation

        Returns:
            Le prompt formaté
        """
        return self.get(f"prompts.{agent_name}.{prompt_name}", **kwargs)

    def get_agent_message(self, agent_name: str, message_key: str, **kwargs: Any) -> str:
        """
        Récupère un message d'agent.

        Args:
            agent_name: Nom de l'agent
            message_key: Clé du message
            **kwargs: Variables pour l'interpolation

        Returns:
            Le message formaté
        """
        return self.get(f"agents.{agent_name}.{message_key}", **kwargs)

    def change_language(self, language: str) -> None:
        """Change la langue et recharge les traductions."""
        if language in SUPPORTED_LANGUAGES:
            self.language = language
            self._load_translations()


# Cache simple par langue (pas de LRU pour éviter les problèmes de stale cache)
_translator_cache: dict[str, Translator] = {}


def get_translator(language: str = DEFAULT_LANGUAGE) -> Translator:
    """
    Factory avec cache simple pour obtenir un Translator.

    Args:
        language: Code de langue

    Returns:
        Instance de Translator pour la langue demandée
    """
    # Normaliser la langue
    lang = language if language in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE

    if lang not in _translator_cache:
        _translator_cache[lang] = Translator(lang)

    return _translator_cache[lang]
