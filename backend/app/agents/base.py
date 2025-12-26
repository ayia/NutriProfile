from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field
import structlog

from app.llm.client import get_hf_client, HuggingFaceClient
from app.llm.models import ModelInfo, ModelCapability, get_primary_models, get_fallback_model
from app.i18n import get_translator, Translator, DEFAULT_LANGUAGE

logger = structlog.get_logger()

InputT = TypeVar("InputT")
OutputT = TypeVar("OutputT")


class AgentResponse(BaseModel):
    """Réponse standard d'un agent."""

    result: Any = Field(..., description="Résultat du traitement")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Score de confiance")
    model_used: str = Field(..., description="Modèle utilisé")
    reasoning: str = Field(default="", description="Raisonnement de l'agent")
    used_fallback: bool = Field(default=False, description="Fallback utilisé")
    metadata: dict[str, Any] = Field(default_factory=dict)


class BaseAgent(ABC, Generic[InputT, OutputT]):
    """Classe abstraite pour tous les agents LLM."""

    # À définir dans les sous-classes
    name: str = "BaseAgent"
    capability: ModelCapability = ModelCapability.PROFILING
    confidence_threshold: float = 0.7

    def __init__(self, client: HuggingFaceClient | None = None, language: str = DEFAULT_LANGUAGE):
        self.client = client or get_hf_client()
        self._models = get_primary_models(self.capability)
        self._fallback = get_fallback_model(self.capability)
        self.language = language
        self.translator = get_translator(language)

    def t(self, key: str, **kwargs: Any) -> str:
        """Shortcut for translation."""
        return self.translator.get(key, **kwargs)

    def t_agent(self, message_key: str, **kwargs: Any) -> str:
        """Get agent-specific message."""
        return self.translator.get_agent_message(self.name.lower().replace("agent", ""), message_key, **kwargs)

    def t_prompt(self, prompt_name: str, **kwargs: Any) -> str:
        """Get prompt for this agent."""
        return self.translator.get_prompt(self.name.lower().replace("agent", ""), prompt_name, **kwargs)

    @abstractmethod
    def build_prompt(self, input_data: InputT) -> str:
        """Construit le prompt pour le modèle."""
        pass

    @abstractmethod
    def parse_response(self, raw_response: str, input_data: InputT) -> OutputT:
        """Parse la réponse du modèle."""
        pass

    @abstractmethod
    def calculate_confidence(self, result: OutputT, raw_response: str) -> float:
        """Calcule le score de confiance."""
        pass

    async def process(
        self,
        input_data: InputT,
        model: ModelInfo | None = None,
    ) -> AgentResponse:
        """Traitement principal avec un modèle spécifique."""
        if model is None:
            model = self._models[0] if self._models else self._fallback

        if model is None:
            raise ValueError(f"Aucun modèle disponible pour {self.capability}")

        prompt = self.build_prompt(input_data)

        logger.info(
            "agent_processing",
            agent=self.name,
            model=model.id,
            input_summary=str(input_data)[:100],
        )

        try:
            raw_response = await self.client.text_generation(
                model_id=model.id,
                prompt=prompt,
                max_new_tokens=model.max_tokens,
                temperature=model.temperature,
            )

            result = self.parse_response(raw_response, input_data)
            confidence = self.calculate_confidence(result, raw_response)

            logger.info(
                "agent_response",
                agent=self.name,
                model=model.id,
                confidence=confidence,
            )

            # Si confiance trop basse, utiliser fallback
            if confidence < self.confidence_threshold and not model.is_fallback:
                logger.warning(
                    "low_confidence_fallback",
                    agent=self.name,
                    confidence=confidence,
                    threshold=self.confidence_threshold,
                )
                return await self.fallback(input_data)

            return AgentResponse(
                result=result,
                confidence=confidence,
                model_used=model.id,
                reasoning=self._extract_reasoning(raw_response),
                used_fallback=model.is_fallback,
            )

        except Exception as e:
            logger.error(
                "agent_error",
                agent=self.name,
                model=model.id,
                error=str(e),
            )
            return await self.fallback(input_data)

    async def fallback(self, input_data: InputT) -> AgentResponse:
        """Comportement de fallback."""
        if self._fallback is None:
            # Fallback déterministe si pas de modèle de fallback
            result = self.deterministic_fallback(input_data)
            return AgentResponse(
                result=result,
                confidence=0.5,
                model_used="deterministic",
                reasoning=self.t("agents.common.fallbackUsed"),
                used_fallback=True,
            )

        # Utiliser le modèle de fallback
        return await self.process(input_data, model=self._fallback)

    def deterministic_fallback(self, input_data: InputT) -> OutputT:
        """Fallback déterministe sans LLM. À surcharger."""
        raise NotImplementedError("Pas de fallback déterministe défini")

    def _extract_reasoning(self, raw_response: str) -> str:
        """Extrait le raisonnement de la réponse."""
        # Cherche des patterns courants de raisonnement
        lines = raw_response.split("\n")
        reasoning_lines = []
        for line in lines:
            lower = line.lower()
            if any(kw in lower for kw in ["parce que", "car", "donc", "ainsi", "because", "since"]):
                reasoning_lines.append(line.strip())
        return " ".join(reasoning_lines[:3]) if reasoning_lines else ""

    async def process_multi_model(
        self,
        input_data: InputT,
        models: list[ModelInfo] | None = None,
    ) -> list[AgentResponse]:
        """Traitement parallèle avec plusieurs modèles."""
        import asyncio

        models = models or self._models[:3]  # Max 3 modèles

        tasks = [self.process(input_data, model) for model in models]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        valid_responses = []
        for resp in responses:
            if isinstance(resp, AgentResponse):
                valid_responses.append(resp)
            else:
                logger.error("multi_model_error", error=str(resp))

        return valid_responses

    def validate(self, result: OutputT) -> bool:
        """Valide le résultat. À surcharger si nécessaire."""
        return result is not None
