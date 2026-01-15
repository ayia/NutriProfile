from enum import Enum
from pydantic import BaseModel, Field


class ModelType(str, Enum):
    """Types de modèles disponibles."""
    TEXT = "text"
    VISION = "vision"
    EMBEDDING = "embedding"


class ModelCapability(str, Enum):
    """Capacités des modèles."""
    RECIPE_GENERATION = "recipe_generation"
    NUTRITION_ANALYSIS = "nutrition_analysis"
    NUTRITION_ESTIMATION = "nutrition_estimation"  # Estimation LLM pour aliments non référencés
    FOOD_DETECTION = "food_detection"
    COACHING = "coaching"
    PROFILING = "profiling"


class ModelInfo(BaseModel):
    """Informations sur un modèle LLM."""

    id: str = Field(..., description="ID Hugging Face du modèle")
    name: str = Field(..., description="Nom affichable")
    type: ModelType = Field(..., description="Type de modèle")
    capabilities: list[ModelCapability] = Field(default_factory=list)
    max_tokens: int = Field(default=500)
    temperature: float = Field(default=0.7)
    priority: int = Field(default=1, description="Priorité (1=haute)")
    is_fallback: bool = Field(default=False, description="Modèle de fallback")


# Registre des modèles disponibles
# Updated 2026-01-15: Restored Qwen models with valid HF token
MODEL_REGISTRY: dict[str, ModelInfo] = {
    # Modèles de texte principaux - Qwen (RESTORED - High quality)
    "qwen-72b": ModelInfo(
        id="Qwen/Qwen2.5-72B-Instruct",
        name="Qwen 2.5 72B",
        type=ModelType.TEXT,
        capabilities=[
            ModelCapability.RECIPE_GENERATION,
            ModelCapability.NUTRITION_ANALYSIS,
            ModelCapability.NUTRITION_ESTIMATION,
            ModelCapability.COACHING,
            ModelCapability.PROFILING,
        ],
        max_tokens=2000,
        temperature=0.7,
        priority=1,
    ),
    "qwen-7b": ModelInfo(
        id="Qwen/Qwen2.5-7B-Instruct",
        name="Qwen 2.5 7B",
        type=ModelType.TEXT,
        capabilities=[
            ModelCapability.RECIPE_GENERATION,
            ModelCapability.NUTRITION_ANALYSIS,
            ModelCapability.COACHING,
            ModelCapability.PROFILING,
        ],
        max_tokens=1000,
        temperature=0.7,
        priority=2,
        is_fallback=True,
    ),
    # Modèles de vision - Qwen (RESTORED - Perfect quality)
    "qwen-vl-72b": ModelInfo(
        id="Qwen/Qwen2.5-VL-72B-Instruct",
        name="Qwen 2.5 VL 72B",
        type=ModelType.VISION,
        capabilities=[ModelCapability.FOOD_DETECTION],
        priority=1,
    ),
    "qwen-vl-7b": ModelInfo(
        id="Qwen/Qwen2-VL-7B-Instruct",
        name="Qwen 2 VL 7B",
        type=ModelType.VISION,
        capabilities=[ModelCapability.FOOD_DETECTION],
        priority=2,
        is_fallback=True,
    ),
}


def get_models_by_capability(capability: ModelCapability) -> list[ModelInfo]:
    """Retourne les modèles ayant une capacité spécifique."""
    return [
        model for model in MODEL_REGISTRY.values()
        if capability in model.capabilities
    ]


def get_models_by_type(model_type: ModelType) -> list[ModelInfo]:
    """Retourne les modèles d'un type spécifique."""
    return [
        model for model in MODEL_REGISTRY.values()
        if model.type == model_type
    ]


def get_primary_models(capability: ModelCapability) -> list[ModelInfo]:
    """Retourne les modèles principaux (non-fallback) pour une capacité."""
    return [
        model for model in get_models_by_capability(capability)
        if not model.is_fallback
    ]


def get_fallback_model(capability: ModelCapability) -> ModelInfo | None:
    """Retourne le modèle de fallback pour une capacité."""
    fallbacks = [
        model for model in get_models_by_capability(capability)
        if model.is_fallback
    ]
    return fallbacks[0] if fallbacks else None
