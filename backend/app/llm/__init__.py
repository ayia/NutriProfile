# Intégration Hugging Face

from app.llm.client import HuggingFaceClient, get_hf_client
from app.llm.models import (
    ModelType,
    ModelCapability,
    ModelInfo,
    MODEL_REGISTRY,
    get_models_by_capability,
    get_models_by_type,
    get_primary_models,
    get_fallback_model,
)

__all__ = [
    "HuggingFaceClient",
    "get_hf_client",
    "ModelType",
    "ModelCapability",
    "ModelInfo",
    "MODEL_REGISTRY",
    "get_models_by_capability",
    "get_models_by_type",
    "get_primary_models",
    "get_fallback_model",
]
