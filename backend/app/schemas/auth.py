from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Schéma du token JWT avec refresh token."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Durée en secondes


class RefreshTokenRequest(BaseModel):
    """Requête de rafraîchissement de token."""

    refresh_token: str


class TokenData(BaseModel):
    """Données extraites du token."""

    email: EmailStr | None = None
    token_type: str = "access"  # "access" ou "refresh"
