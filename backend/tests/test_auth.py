import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test de l'inscription d'un utilisateur."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "securepassword123",
            "name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test de l'inscription avec un email déjà existant."""
    user_data = {
        "email": "duplicate@example.com",
        "password": "securepassword123",
        "name": "Test User"
    }

    # Premier enregistrement
    await client.post("/api/v1/auth/register", json=user_data)

    # Deuxième enregistrement avec le même email
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test de connexion réussie."""
    # Créer l'utilisateur
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "securepassword123",
            "name": "Login User"
        }
    )

    # Se connecter
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "login@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Test de connexion avec mauvais mot de passe."""
    # Créer l'utilisateur
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrong@example.com",
            "password": "securepassword123",
            "name": "Wrong User"
        }
    )

    # Essayer de se connecter avec mauvais mot de passe
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "wrong@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
