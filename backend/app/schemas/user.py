from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# Type pour les codes de langue supportés
LanguageCode = Literal["en", "fr", "de", "es", "pt", "zh", "ar"]


class UserCreate(BaseModel):
    """Schéma pour la création d'utilisateur."""

    email: EmailStr = Field(..., description="Email de l'utilisateur")
    password: str = Field(..., min_length=8, description="Mot de passe (min 8 caractères)")
    name: str = Field(..., min_length=2, max_length=100, description="Nom de l'utilisateur")
    preferred_language: LanguageCode = Field(default="en", description="Langue préférée")


class UserUpdate(BaseModel):
    """Schéma pour la mise à jour d'utilisateur."""

    name: str | None = Field(None, min_length=2, max_length=100)
    preferred_language: LanguageCode | None = Field(None, description="Langue préférée")


class UserResponse(BaseModel):
    """Schéma de réponse utilisateur."""

    id: int
    email: EmailStr
    name: str
    is_active: bool
    preferred_language: LanguageCode
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
