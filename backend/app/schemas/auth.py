from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Schéma du token JWT."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Données extraites du token."""

    email: EmailStr | None = None
