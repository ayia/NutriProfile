import asyncio
from typing import Any

import httpx
import structlog

from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


class HuggingFaceClient:
    """Client pour l'API Hugging Face Inference."""

    BASE_URL = "https://api-inference.huggingface.co/models"
    TIMEOUT = 60.0

    def __init__(self, token: str | None = None):
        self.token = token or settings.HUGGINGFACE_TOKEN
        self.headers = {"Authorization": f"Bearer {self.token}"}

    async def _request(
        self,
        model_id: str,
        payload: dict[str, Any],
        retries: int = 3,
    ) -> dict[str, Any] | list[Any]:
        """Effectue une requête vers l'API Hugging Face."""
        url = f"{self.BASE_URL}/{model_id}"

        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            for attempt in range(retries):
                try:
                    response = await client.post(
                        url,
                        headers=self.headers,
                        json=payload,
                    )

                    # Modèle en cours de chargement
                    if response.status_code == 503:
                        data = response.json()
                        wait_time = data.get("estimated_time", 20)
                        logger.info(
                            "model_loading",
                            model=model_id,
                            wait_time=wait_time,
                            attempt=attempt + 1,
                        )
                        await asyncio.sleep(min(wait_time, 30))
                        continue

                    response.raise_for_status()
                    return response.json()

                except httpx.HTTPStatusError as e:
                    logger.error(
                        "huggingface_error",
                        model=model_id,
                        status=e.response.status_code,
                        detail=e.response.text,
                    )
                    if attempt == retries - 1:
                        raise
                    await asyncio.sleep(2 ** attempt)

                except httpx.RequestError as e:
                    logger.error("request_error", model=model_id, error=str(e))
                    if attempt == retries - 1:
                        raise
                    await asyncio.sleep(2 ** attempt)

        return {"error": "Max retries exceeded"}

    async def text_generation(
        self,
        model_id: str,
        prompt: str,
        max_new_tokens: int = 500,
        temperature: float = 0.7,
        top_p: float = 0.95,
    ) -> str:
        """Génération de texte."""
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_new_tokens,
                "temperature": temperature,
                "top_p": top_p,
                "do_sample": True,
                "return_full_text": False,
            },
        }

        result = await self._request(model_id, payload)

        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "")
        return ""

    async def image_to_text(
        self,
        model_id: str,
        image_bytes: bytes,
    ) -> str:
        """Analyse d'image (vision)."""
        url = f"{self.BASE_URL}/{model_id}"

        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            response = await client.post(
                url,
                headers=self.headers,
                content=image_bytes,
            )
            response.raise_for_status()
            result = response.json()

        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "")
        return ""

    async def health_check(self, model_id: str) -> bool:
        """Vérifie si un modèle est disponible."""
        try:
            url = f"{self.BASE_URL}/{model_id}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=self.headers)
                return response.status_code in (200, 503)  # 503 = loading
        except Exception:
            return False

    async def text_chat(
        self,
        prompt: str,
        model_id: str = "Qwen/Qwen2.5-72B-Instruct",
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        """
        Génération de texte via l'API Chat Completions.
        Utilise la nouvelle API HuggingFace router.
        """
        url = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model_id,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            for attempt in range(2):  # Reduced retries
                try:
                    response = await client.post(url, headers=headers, json=payload)

                    # Don't retry on authentication errors
                    if response.status_code in (401, 403):
                        logger.error(
                            "text_chat_auth_error",
                            model=model_id,
                            status=response.status_code,
                            detail="Invalid or missing API token",
                        )
                        raise httpx.HTTPStatusError(
                            "Authentication failed",
                            request=response.request,
                            response=response
                        )

                    if response.status_code == 503:
                        wait_time = 5  # Reduced wait time
                        logger.info(
                            "text_model_loading",
                            model=model_id,
                            wait_time=wait_time,
                            attempt=attempt + 1,
                        )
                        await asyncio.sleep(wait_time)
                        continue

                    response.raise_for_status()
                    result = response.json()
                    return result["choices"][0]["message"]["content"]

                except httpx.HTTPStatusError as e:
                    logger.error(
                        "text_chat_error",
                        model=model_id,
                        status=e.response.status_code,
                        detail=e.response.text[:500],
                    )
                    # Don't retry on auth errors
                    if e.response.status_code in (401, 403):
                        raise
                    if attempt == 1:
                        raise
                    await asyncio.sleep(1)

                except httpx.RequestError as e:
                    logger.error("text_chat_request_error", model=model_id, error=str(e))
                    if attempt == 1:
                        raise
                    await asyncio.sleep(1)

        return ""

    async def vision_chat(
        self,
        image_base64: str,
        prompt: str,
        model_id: str = "Qwen/Qwen2.5-VL-72B-Instruct",
        max_tokens: int = 800,
    ) -> str:
        """
        Analyse d'image avec un modèle VLM via l'API Chat Completions.
        Utilise la nouvelle API HuggingFace router.
        """
        url = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model_id,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                }
            ],
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            for attempt in range(3):
                try:
                    response = await client.post(url, headers=headers, json=payload)

                    if response.status_code == 503:
                        wait_time = 20
                        logger.info(
                            "vlm_model_loading",
                            model=model_id,
                            wait_time=wait_time,
                            attempt=attempt + 1,
                        )
                        await asyncio.sleep(wait_time)
                        continue

                    response.raise_for_status()
                    result = response.json()
                    return result["choices"][0]["message"]["content"]

                except httpx.HTTPStatusError as e:
                    logger.error(
                        "vlm_error",
                        model=model_id,
                        status=e.response.status_code,
                        detail=e.response.text[:500],
                    )
                    if attempt == 2:
                        raise
                    await asyncio.sleep(2**attempt)

                except httpx.RequestError as e:
                    logger.error("vlm_request_error", model=model_id, error=str(e))
                    if attempt == 2:
                        raise
                    await asyncio.sleep(2**attempt)

        return ""


# Singleton
_client: HuggingFaceClient | None = None


def get_hf_client() -> HuggingFaceClient:
    """Retourne le client Hugging Face singleton."""
    global _client
    if _client is None:
        _client = HuggingFaceClient()
    return _client
