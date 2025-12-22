import pytest
from unittest.mock import AsyncMock, patch

from app.agents.base import AgentResponse
from app.agents.consensus import ConsensusValidator, ConsensusResult
from app.llm.models import ModelCapability, get_models_by_capability, MODEL_REGISTRY


class TestModelRegistry:
    """Tests pour le registre des modèles."""

    def test_registry_not_empty(self):
        """Le registre contient des modèles."""
        assert len(MODEL_REGISTRY) > 0

    def test_get_models_by_capability(self):
        """Récupérer les modèles par capacité."""
        models = get_models_by_capability(ModelCapability.RECIPE_GENERATION)
        assert len(models) >= 1

        for model in models:
            assert ModelCapability.RECIPE_GENERATION in model.capabilities

    def test_all_models_have_required_fields(self):
        """Tous les modèles ont les champs requis."""
        for name, model in MODEL_REGISTRY.items():
            assert model.id, f"Model {name} missing id"
            assert model.name, f"Model {name} missing name"
            assert model.type, f"Model {name} missing type"


class TestConsensusValidator:
    """Tests pour le validateur de consensus."""

    def test_empty_responses(self):
        """Gestion des réponses vides."""
        validator = ConsensusValidator()
        result = validator.validate([], "recipe_generation")

        assert result.is_valid is False
        assert result.confidence == 0.0
        assert "Aucune réponse" in result.warnings[0]

    def test_single_response(self):
        """Une seule réponse avec haute confiance."""
        validator = ConsensusValidator()
        responses = [
            AgentResponse(
                result={"title": "Salade", "ingredients": ["laitue", "tomate"]},
                confidence=0.9,
                model_used="test-model",
            )
        ]

        result = validator.validate(responses, "recipe_generation", min_agreement=1)

        assert result.confidence > 0.5
        assert result.merged_result is not None

    def test_multiple_responses_agreement(self):
        """Plusieurs réponses en accord."""
        validator = ConsensusValidator()
        responses = [
            AgentResponse(
                result={"calories": 500, "protein": 30},
                confidence=0.85,
                model_used="model-1",
            ),
            AgentResponse(
                result={"calories": 510, "protein": 32},
                confidence=0.82,
                model_used="model-2",
            ),
        ]

        result = validator.validate(responses, "nutrition_validation")

        assert result.is_valid is True
        assert result.confidence > 0.7
        assert result.agreement_score > 0.7

    def test_merge_recipes_intersection(self):
        """Fusion des recettes garde les ingrédients communs."""
        validator = ConsensusValidator()
        responses = [
            AgentResponse(
                result={"ingredients": ["poulet", "riz", "carotte"]},
                confidence=0.8,
                model_used="model-1",
            ),
            AgentResponse(
                result={"ingredients": ["poulet", "riz", "brocoli"]},
                confidence=0.8,
                model_used="model-2",
            ),
        ]

        result = validator.validate(responses, "recipe_generation")

        merged = result.merged_result
        assert "poulet" in merged["ingredients"]
        assert "riz" in merged["ingredients"]

    def test_merge_nutrition_excludes_outliers(self):
        """Fusion nutritionnelle exclut les outliers."""
        validator = ConsensusValidator()
        responses = [
            AgentResponse(result={"calories": 500}, confidence=0.8, model_used="m1"),
            AgentResponse(result={"calories": 510}, confidence=0.8, model_used="m2"),
            AgentResponse(result={"calories": 520}, confidence=0.8, model_used="m3"),
            AgentResponse(result={"calories": 2000}, confidence=0.8, model_used="m4"),  # outlier
        ]

        result = validator.validate(responses, "nutrition_validation")

        # La moyenne devrait être proche de 510, pas 880
        assert result.merged_result["calories"] < 600

    def test_low_confidence_warning(self):
        """Warning si faible accord entre modèles."""
        validator = ConsensusValidator()
        responses = [
            AgentResponse(result={"x": 1}, confidence=0.9, model_used="m1"),
            AgentResponse(result={"x": 2}, confidence=0.3, model_used="m2"),
        ]

        result = validator.validate(responses, "nutrition_validation")

        # Devrait avoir un warning sur le faible accord
        assert any("accord" in w.lower() or "faible" in w.lower() for w in result.warnings) or result.agreement_score < 0.8


class TestAgentResponse:
    """Tests pour AgentResponse."""

    def test_valid_response(self):
        """Création d'une réponse valide."""
        response = AgentResponse(
            result={"test": "data"},
            confidence=0.85,
            model_used="test-model",
            reasoning="Test reasoning",
        )

        assert response.confidence == 0.85
        assert response.model_used == "test-model"
        assert response.used_fallback is False

    def test_confidence_bounds(self):
        """La confiance doit être entre 0 et 1."""
        with pytest.raises(ValueError):
            AgentResponse(
                result={},
                confidence=1.5,  # Invalid
                model_used="test",
            )

        with pytest.raises(ValueError):
            AgentResponse(
                result={},
                confidence=-0.1,  # Invalid
                model_used="test",
            )
