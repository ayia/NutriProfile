"""
Test de l'endpoint API /nutrition/search avec recherche multilingue.
Teste le waterfall complet: Embeddings → Traduction → LLM
"""
import sys
import io
import asyncio
import httpx

# Fix encoding Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000/api/v1"

# Test cases multilingues
TEST_CASES = [
    # (food_name, language, expected_to_find)
    ("chicken breast", "en", True),
    ("poulet", "fr", True),
    ("دجاج", "ar", True),
    ("pollo", "es", True),
    ("Huhn", "de", True),
    ("olive oil", "en", True),
    ("huile d'olive", "fr", True),
    ("brown rice", "en", True),
    ("riz complet", "fr", True),
]


async def login() -> str:
    """Login et récupérer token JWT."""
    async with httpx.AsyncClient() as client:
        # Essayer de se connecter avec un utilisateur test
        response = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "test@example.com", "password": "testpassword"}
        )

        if response.status_code == 200:
            data = response.json()
            return data["access_token"]
        else:
            print(f"⚠️  Login failed (status {response.status_code})")
            print("Note: Créez un utilisateur test ou utilisez un token existant")
            return None


async def test_nutrition_search(token: str):
    """Test l'endpoint de recherche nutritionnelle."""
    print("=" * 70)
    print("TEST API ENDPOINT - RECHERCHE NUTRITIONNELLE MULTILINGUE")
    print("=" * 70)
    print()

    if not token:
        print("❌ Aucun token disponible - tests ignorés")
        print("   Créez un utilisateur test via /auth/register ou lancez le backend")
        return

    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        results = []

        for food_name, language, expected in TEST_CASES:
            print(f"🔍 Testing: {food_name} ({language})")

            try:
                response = await client.post(
                    f"{BASE_URL}/nutrition/search",
                    headers=headers,
                    json={
                        "food_name": food_name,
                        "quantity_g": 100,
                        "language": language
                    }
                )

                if response.status_code == 200:
                    data = response.json()

                    status = "✅" if data["found"] else "❌"
                    print(f"   {status} Found: {data['found']}")

                    if data["found"]:
                        print(f"      Source: {data['source']}")
                        print(f"      Calories: {data['calories']} kcal")
                        print(f"      Protein: {data['protein']}g")
                        print(f"      Confidence: {data['confidence']:.2f}")

                        results.append({
                            "food": food_name,
                            "language": language,
                            "found": True,
                            "source": data["source"],
                            "confidence": data["confidence"]
                        })
                    else:
                        results.append({
                            "food": food_name,
                            "language": language,
                            "found": False
                        })
                else:
                    print(f"   ❌ HTTP Error: {response.status_code}")
                    print(f"      {response.text}")

            except Exception as e:
                print(f"   ❌ Error: {e}")

            print()

        # Rapport final
        print("=" * 70)
        print("RAPPORT FINAL")
        print("=" * 70)

        total = len(results)
        found = sum(1 for r in results if r["found"])

        print(f"\nTests exécutés: {total}")
        print(f"Aliments trouvés: {found}/{total} ({found/total*100:.1f}%)")

        # Breakdown par source
        sources = {}
        for r in results:
            if r["found"]:
                source = r["source"]
                sources[source] = sources.get(source, 0) + 1

        if sources:
            print("\nRépartition par source:")
            for source, count in sources.items():
                print(f"  {source}: {count}")

        # Breakdown par langue
        languages = {}
        for r in results:
            lang = r["language"]
            if r["found"]:
                languages[lang] = languages.get(lang, 0) + 1

        if languages:
            print("\nSuccès par langue:")
            for lang, count in languages.items():
                total_lang = sum(1 for r in results if r["language"] == lang)
                print(f"  {lang}: {count}/{total_lang}")

        print("\n" + "=" * 70)

        if found >= total * 0.7:
            print("✅ SUCCÈS - Système de recherche multilingue fonctionnel!")
        else:
            print("⚠️  ATTENTION - Taux de succès faible, vérifier configuration")

        print("=" * 70)


async def main():
    """Point d'entrée principal."""
    print("Tentative de connexion au backend...")

    try:
        # Vérifier que le backend est accessible
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL.replace('/api/v1', '')}/health")
            if response.status_code != 200:
                print("❌ Backend non accessible sur http://localhost:8000")
                print("   Lancez le backend avec: cd backend && uvicorn app.main:app --reload")
                return
    except Exception as e:
        print(f"❌ Impossible de contacter le backend: {e}")
        print("   Lancez le backend avec: cd backend && uvicorn app.main:app --reload")
        return

    print("✅ Backend accessible\n")

    # Login
    token = await login()

    # Tests
    await test_nutrition_search(token)


if __name__ == "__main__":
    asyncio.run(main())
