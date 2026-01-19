"""Schémas Pydantic pour le logging vocal."""

from pydantic import BaseModel, Field


class VoiceInput(BaseModel):
    """Entrée de transcription vocale."""
    transcription: str = Field(..., description="Texte transcrit de la voix")
    language: str = Field(default="fr", description="Langue de la transcription")


class ParsedFoodItem(BaseModel):
    """Aliment parsé depuis la transcription vocale."""
    name: str = Field(..., description="Nom de l'aliment")
    quantity: str = Field(..., description="Quantité")
    unit: str = Field(default="g", description="Unité de mesure")


class ParsedVoiceResponse(BaseModel):
    """Réponse du parsing vocal."""
    items: list[ParsedFoodItem] = Field(default_factory=list, description="Aliments extraits")
    confidence: float = Field(..., description="Confiance du parsing (0-1)")
    raw_text: str = Field(..., description="Texte original")
