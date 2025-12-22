from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    """Schéma pour la création d'utilisateur."""

    email: EmailStr = Field(..., description="Email de l'utilisateur")
    password: str = Field(..., min_length=8, description="Mot de passe (min 8 caractères)")
    name: str = Field(..., min_length=2, max_length=100, description="Nom de l'utilisateur")


class UserUpdate(BaseModel):
    """Schéma pour la mise à jour d'utilisateur."""

    name: str | None = Field(None, min_length=2, max_length=100)


class UserResponse(BaseModel):
    """Schéma de réponse utilisateur."""

    id: int
    email: EmailStr
    name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
