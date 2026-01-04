from datetime import datetime, timedelta, timezone

from app.services.subscription import TRIAL_DURATION_DAYS
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select

from app.config import get_settings
from app.database import async_session_maker
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, TokenData, RefreshTokenRequest

router = APIRouter()
settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie le mot de passe."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash le mot de passe."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Crée un token d'accès JWT."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.now(timezone.utc),
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Crée un token de rafraîchissement JWT."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iat": datetime.now(timezone.utc),
    })
    return jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_refresh_token(token: str) -> TokenData | None:
    """Vérifie et décode un refresh token."""
    try:
        payload = jwt.decode(token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "refresh":
            return None
        return TokenData(email=email, token_type=token_type)
    except JWTError:
        return None


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    """Récupère l'utilisateur courant depuis le token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        if email is None or token_type != "access":
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    async with async_session_maker() as db:
        result = await db.execute(select(User).where(User.email == token_data.email))
        user = result.scalar_one_or_none()
        if user is None:
            raise credentials_exception
        return user


def create_tokens(email: str) -> Token:
    """Crée une paire access/refresh tokens."""
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(
        data={"sub": email},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
) -> UserResponse:
    """Créer un nouveau compte utilisateur."""
    async with async_session_maker() as db:
        # Vérifier si l'email existe déjà
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un compte avec cet email existe déjà",
            )

        # Créer l'utilisateur avec trial Premium (7 jours)
        trial_ends_at = datetime.now(timezone.utc) + timedelta(days=TRIAL_DURATION_DAYS)
        user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            name=user_data.name,
            subscription_tier="free",  # Tier par défaut
            trial_ends_at=trial_ends_at,  # Trial Premium
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """Authentifier et obtenir les tokens JWT."""
    async with async_session_maker() as db:
        result = await db.execute(select(User).where(User.email == form_data.username))
        user = result.scalar_one_or_none()

        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return create_tokens(user.email)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
) -> Token:
    """Rafraîchir le token d'accès avec un refresh token valide."""
    token_data = verify_refresh_token(request.refresh_token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )

    async with async_session_maker() as db:
        # Vérifier que l'utilisateur existe toujours
        result = await db.execute(select(User).where(User.email == token_data.email))
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Créer de nouveaux tokens
        return create_tokens(user.email)


@router.post("/logout")
async def logout():
    """Déconnexion - invalide les tokens côté client."""
    # Note: Pour une invalidation côté serveur, il faudrait utiliser Redis
    # pour stocker une liste de tokens révoqués (token blacklist)
    return {"message": "Déconnexion réussie"}


@router.get("/check-email")
async def check_email_exists(email: str) -> dict:
    """Vérifie si un email est déjà utilisé (pour validation en temps réel)."""
    async with async_session_maker() as db:
        result = await db.execute(select(User).where(User.email == email.lower()))
        exists = result.scalar_one_or_none() is not None
        return {"exists": exists}
