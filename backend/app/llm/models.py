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
MODEL_REGISTRY: dict[str, ModelInfo] = {
    # Modèles de texte principaux
    "mistral-7b": ModelInfo(
        id="mistralai/Mistral-7B-Instruct-v0.2",
        name="Mistral 7B Instruct",
        type=ModelType.TEXT,
        capabilities=[
            ModelCapability.RECIPE_GENERATION,
            ModelCapability.NUTRITION_ANALYSIS,
            ModelCapability.COACHING,
            ModelCapability.PROFILING,
        ],
        max_tokens=1000,
        temperature=0.7,
        priority=1,
    ),
    "llama-3-70b": ModelInfo(
        id="meta-llama/Meta-Llama-3-70B-Instruct",
        name="Llama 3 70B Instruct",
        type=ModelType.TEXT,
        capabilities=[
            ModelCapability.RECIPE_GENERATION,
            ModelCapability.NUTRITION_ANALYSIS,
            ModelCapability.COACHING,
            ModelCapability.PROFILING,
        ],
        max_tokens=1000,
        temperature=0.7,
        priority=1,
    ),
    "mixtral-8x7b": ModelInfo(
        id="mistralai/Mixtral-8x7B-Instruct-v0.1",
        name="Mixtral 8x7B",
        type=ModelType.TEXT,
        capabilities=[
            ModelCapability.RECIPE_GENERATION,
            ModelCapability.NUTRITION_ANALYSIS,
            ModelCapability.COACHING,
        ],
        max_tokens=800,
        temperature=0.7,
        priority=2,
    ),
    # Modèle de fallback texte
    "zephyr-7b": ModelInfo(
        id="HuggingFaceH4/zephyr-7b-beta",
        name="Zephyr 7B",
        type=ModelType.TEXT,
        capabilities=[
            ModelCapability.RECIPE_GENERATION,
            ModelCapability.COACHING,
        ],
        max_tokens=500,
        temperature=0.8,
        priority=3,
        is_fallback=True,
    ),
    # Modèles de vision
    "blip2": ModelInfo(
        id="Salesforce/blip2-opt-2.7b",
        name="BLIP-2",
        type=ModelType.VISION,
        capabilities=[ModelCapability.FOOD_DETECTION],
        priority=1,
    ),
    "llava": ModelInfo(
        id="llava-hf/llava-1.5-7b-hf",
        name="LLaVA 1.5",
        type=ModelType.VISION,
        capabilities=[ModelCapability.FOOD_DETECTION],
        priority=1,
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
