"""Test access to Qwen models via different Hugging Face API endpoints."""
import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

# Load token from .env
load_dotenv()
TOKEN = os.getenv("HUGGINGFACE_TOKEN")

# Models to test
MODELS = [
    "Qwen/Qwen2.5-VL-72B-Instruct",  # Vision model (original)
    "Qwen/Qwen2-VL-7B-Instruct",     # Smaller vision
    "Qwen/Qwen2.5-72B-Instruct",     # Text model
    "Qwen/Qwen2.5-7B-Instruct",      # Smaller text
]

# Different API endpoints to try
ENDPOINTS = [
    {
        "name": "Inference API (Standard)",
        "url_template": "https://api-inference.huggingface.co/models/{model}",
        "method": "POST",
        "payload": {"inputs": "test"}
    },
    {
        "name": "Router API",
        "url_template": "https://router.huggingface.co/hf-inference/models/{model}",
        "method": "POST",
        "payload": {"inputs": "test"}
    },
    {
        "name": "Serverless Inference",
        "url_template": "https://api-inference.huggingface.co/pipeline/text-generation/{model}",
        "method": "POST",
        "payload": {"inputs": "test"}
    },
    {
        "name": "Model Info (GET)",
        "url_template": "https://huggingface.co/api/models/{model}",
        "method": "GET",
        "payload": None
    },
]


async def test_endpoint(client: httpx.AsyncClient, endpoint: dict, model: str):
    """Test a specific endpoint for a model."""
    url = endpoint["url_template"].format(model=model)
    headers = {"Authorization": f"Bearer {TOKEN}"}

    try:
        if endpoint["method"] == "POST":
            response = await client.post(
                url,
                headers=headers,
                json=endpoint["payload"],
                timeout=10.0
            )
        else:
            response = await client.get(
                url,
                headers=headers,
                timeout=10.0
            )

        return {
            "status": response.status_code,
            "success": response.status_code in [200, 201, 202, 503],
            "body": response.text[:200] if response.status_code != 200 else "OK"
        }
    except httpx.TimeoutException:
        return {"status": "TIMEOUT", "success": False, "body": "Request timeout"}
    except Exception as e:
        return {"status": "ERROR", "success": False, "body": str(e)[:100]}


async def check_token_info():
    """Check token information."""
    print("=" * 80)
    print("CHECKING TOKEN INFO")
    print("=" * 80)

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                "https://huggingface.co/api/whoami-v2",
                headers={"Authorization": f"Bearer {TOKEN}"}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"Token Status: VALID")
                print(f"Type: {data.get('type', 'N/A')}")
                print(f"User: {data.get('name', 'N/A')}")

                # Check if PRO
                orgs = data.get('orgs', [])
                is_pro = any(org.get('isPro', False) for org in orgs) if orgs else False
                print(f"PRO Status: {'YES' if is_pro else 'NO (Free tier)'}")
                print()
                return is_pro
            else:
                print(f"Token Status: INVALID ({response.status_code})")
                print()
                return False
        except Exception as e:
            print(f"Error checking token: {e}")
            print()
            return False


async def main():
    print("=" * 80)
    print("TESTING QWEN MODEL ACCESS ON HUGGING FACE")
    print("=" * 80)
    print()

    # Check token first
    is_pro = await check_token_info()

    # Test all combinations
    async with httpx.AsyncClient(timeout=10.0) as client:
        for model in MODELS:
            print("-" * 80)
            print(f"MODEL: {model}")
            print("-" * 80)

            for endpoint in ENDPOINTS:
                result = await test_endpoint(client, endpoint, model)
                status_emoji = "[OK]" if result["success"] else "[FAIL]"

                print(f"{status_emoji} {endpoint['name']:<30} Status: {result['status']}")
                if result['status'] not in [200, 201, 202, "TIMEOUT"]:
                    print(f"   Body: {result['body']}")

            print()

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()
    print("If all endpoints return 404/403/410:")
    print("  → Qwen models not available on free tier")
    print("  → Need HF PRO subscription ($9/month)")
    print()
    print("If some endpoints work (200/503):")
    print("  → Update backend to use working endpoint")
    print()
    print("To upgrade to PRO:")
    print("  1. Go to https://huggingface.co/pricing")
    print("  2. Subscribe to PRO ($9/month)")
    print("  3. Models like Qwen 72B will become accessible")
    print()


if __name__ == "__main__":
    asyncio.run(main())
