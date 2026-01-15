"""Test tous les modeles vision disponibles sur HF."""
import asyncio
import httpx
import os
from dotenv import load_dotenv

async def test_vision_models():
    """Teste differents modeles vision sur HF."""
    load_dotenv()
    token = os.getenv("HUGGINGFACE_TOKEN")

    # Modeles vision a tester
    models = [
        # Qwen Vision variants
        "Qwen/Qwen2-VL-72B-Instruct",
        "Qwen/Qwen2-VL-7B-Instruct",
        "Qwen/Qwen-VL-Chat",
        "Qwen/Qwen-VL",

        # BLIP variants
        "Salesforce/blip-image-captioning-large",
        "Salesforce/blip2-opt-2.7b",
        "Salesforce/blip2-flan-t5-xl",

        # LLaVA
        "llava-hf/llava-1.5-7b-hf",
        "llava-hf/llava-1.5-13b-hf",

        # Autres
        "google/paligemma-3b-mix-224",
        "microsoft/kosmos-2-patch14-224",
    ]

    headers = {"Authorization": f"Bearer {token}"}

    print("=" * 80)
    print("TEST MODELES VISION HUGGING FACE")
    print("=" * 80)
    print()

    available = []
    loading = []
    not_available = []

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in models:
            print(f"Test: {model:<50}", end=" ")
            url = f"https://api-inference.huggingface.co/models/{model}"

            try:
                response = await client.post(
                    url,
                    headers=headers,
                    json={"inputs": "test"},
                    timeout=10.0
                )

                if response.status_code == 200:
                    print("[OK] DISPONIBLE")
                    available.append(model)
                elif response.status_code == 503:
                    data = response.json()
                    wait = data.get("estimated_time", "?")
                    print(f"[LOADING] En chargement ({wait}s)")
                    loading.append((model, wait))
                elif response.status_code == 404:
                    print("[404] NON DISPONIBLE")
                    not_available.append(model)
                elif response.status_code == 403:
                    print("[403] ACCES REFUSE (PRO requis?)")
                    not_available.append(model)
                else:
                    print(f"[{response.status_code}]")

            except httpx.ReadTimeout:
                print("[TIMEOUT]")
            except Exception as e:
                print(f"[ERROR] {str(e)[:30]}")

    print()
    print("=" * 80)
    print("RESUME")
    print("=" * 80)
    print(f"\n[OK] Modeles disponibles ({len(available)}):")
    for m in available:
        print(f"  - {m}")

    print(f"\n[LOADING] Modeles en chargement ({len(loading)}):")
    for m, wait in loading:
        print(f"  - {m} (attente: {wait}s)")

    print(f"\n[404/403] Non disponibles ({len(not_available)}):")
    for m in not_available:
        print(f"  - {m}")

if __name__ == "__main__":
    asyncio.run(test_vision_models())
