import asyncio
from typing import Any
from pydantic import BaseModel, Field
import structlog

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability

logger = structlog.get_logger()


class TaskRequest(BaseModel):
    """Requête de tâche pour l'orchestrateur."""

    task_type: str = Field(..., description="Type de tâche")
    input_data: dict[str, Any] = Field(..., description="Données d'entrée")
    require_consensus: bool = Field(default=True, description="Nécessite consensus multi-modèles")
    min_models: int = Field(default=2, description="Nombre minimum de modèles")


class TaskResult(BaseModel):
    """Résultat d'une tâche orchestrée."""

    task_type: str
    result: Any
    confidence: float
    consensus_reached: bool
    agent_responses: list[AgentResponse]
    warnings: list[str] = Field(default_factory=list)


class Orchestrator:
    """
    Orchestrateur principal qui coordonne les agents.

    Reçoit les requêtes, sélectionne les agents appropriés,
    lance les traitements parallèles et coordonne la validation.
    """

    def __init__(self):
        self._agents: dict[str, BaseAgent] = {}
        self._task_mapping: dict[str, list[str]] = {
            "profile_analysis": ["profiling"],
            "recipe_generation": ["recipe"],
            "food_detection": ["vision"],
            "nutrition_validation": ["nutrition"],
            "coaching": ["coach"],
        }

    def register_agent(self, name: str, agent: BaseAgent) -> None:
        """Enregistre un agent."""
        self._agents[name] = agent
        logger.info("agent_registered", name=name, capability=agent.capability)

    def get_agent(self, name: str) -> BaseAgent | None:
        """Récupère un agent par son nom."""
        return self._agents.get(name)

    def get_agents_for_task(self, task_type: str) -> list[BaseAgent]:
        """Retourne les agents appropriés pour une tâche."""
        agent_names = self._task_mapping.get(task_type, [])
        return [self._agents[name] for name in agent_names if name in self._agents]

    async def process_task(self, request: TaskRequest) -> TaskResult:
        """
        Traite une tâche avec les agents appropriés.

        1. Sélectionne les agents pour la tâche
        2. Lance les traitements en parallèle sur plusieurs modèles
        3. Collecte et valide les résultats
        4. Retourne le résultat avec consensus si requis
        """
        agents = self.get_agents_for_task(request.task_type)

        if not agents:
            logger.warning("no_agents_for_task", task_type=request.task_type)
            return TaskResult(
                task_type=request.task_type,
                result=None,
                confidence=0.0,
                consensus_reached=False,
                agent_responses=[],
                warnings=[f"Aucun agent disponible pour {request.task_type}"],
            )

        all_responses: list[AgentResponse] = []

        # Traitement parallèle avec chaque agent
        for agent in agents:
            if request.require_consensus:
                # Multi-modèles pour consensus
                responses = await agent.process_multi_model(request.input_data)
                all_responses.extend(responses)
            else:
                # Single model
                response = await agent.process(request.input_data)
                all_responses.append(response)

        if not all_responses:
            return TaskResult(
                task_type=request.task_type,
                result=None,
                confidence=0.0,
                consensus_reached=False,
                agent_responses=[],
                warnings=["Aucune réponse des agents"],
            )

        # Calcul du résultat final
        from app.agents.consensus import ConsensusValidator
        validator = ConsensusValidator()

        consensus_result = validator.validate(
            responses=all_responses,
            task_type=request.task_type,
            min_agreement=request.min_models,
        )

        return TaskResult(
            task_type=request.task_type,
            result=consensus_result.merged_result,
            confidence=consensus_result.confidence,
            consensus_reached=consensus_result.is_valid,
            agent_responses=all_responses,
            warnings=consensus_result.warnings,
        )

    async def process_pipeline(
        self,
        tasks: list[TaskRequest],
        parallel: bool = False,
    ) -> list[TaskResult]:
        """
        Traite un pipeline de tâches.

        Args:
            tasks: Liste des tâches à traiter
            parallel: Si True, exécute en parallèle, sinon séquentiel
        """
        if parallel:
            results = await asyncio.gather(
                *[self.process_task(task) for task in tasks],
                return_exceptions=True,
            )
            return [r for r in results if isinstance(r, TaskResult)]
        else:
            results = []
            for task in tasks:
                result = await self.process_task(task)
                results.append(result)
            return results


# Singleton
_orchestrator: Orchestrator | None = None


def get_orchestrator() -> Orchestrator:
    """Retourne l'orchestrateur singleton."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = Orchestrator()
    return _orchestrator
