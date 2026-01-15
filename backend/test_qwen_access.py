"""Test si le token Hugging Face peut acceder a Qwen 72B."""
import asyncio
import httpx
import os
from dotenv import load_dotenv

async def test_qwen_models():
    """Teste l'acces aux differents modeles Qwen."""
    # Lire le token depuis .env
    load_dotenv()
    token = os.getenv("HUGGINGFACE_TOKEN")

    models_to_test = [
        "Qwen/Qwen2.5-72B-Instruct",
        "Qwen/Qwen2.5-VL-72B-Instruct",
        "Qwen/Qwen2.5-7B-Instruct",
        "Qwen/Qwen2-VL-7B-Instruct",
    ]

    headers = {"Authorization": f"Bearer {token}"}

    print("=" * 70)
    print("TEST ACCES MODELES QWEN VIA ROUTER")
    print("=" * 70)
    print()

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in models_to_test:
            print(f"Test: {model}")
            # Utiliser la nouvelle URL router
            url = f"https://router.huggingface.co/hf-inference/models/{model}"

            try:
                response = await client.post(
                    url,
                    headers=headers,
                    json={"inputs": "Test"},
                )

                if response.status_code == 200:
                    print(f"  [OK] ACCESSIBLE (200)")
                elif response.status_code == 503:
                    data = response.json()
                    wait = data.get("estimated_time", "?")
                    print(f"  [LOADING] Modele en chargement (attente: {wait}s)")
                elif response.status_code == 404:
                    print(f"  [404] NON DISPONIBLE")
                elif response.status_code == 401:
                    print(f"  [401] TOKEN INVALIDE")
                elif response.status_code == 403:
                    print(f"  [403] ACCES REFUSE (besoin PRO?)")
                else:
                    print(f"  [{response.status_code}] {response.text[:100]}")

            except Exception as e:
                print(f"  [ERROR] {e}")

            print()

if __name__ == "__main__":
    asyncio.run(test_qwen_models())
