"""Schémas pour l'export PDF."""
from datetime import date
from pydantic import BaseModel, Field
from typing import Literal


class ExportPDFRequest(BaseModel):
    """Requête d'export PDF."""

    report_type: Literal["weekly", "monthly", "custom"] = Field(
        default="weekly",
        description="Type de rapport à générer"
    )
    start_date: date | None = Field(
        default=None,
        description="Date de début (pour custom)"
    )
    end_date: date | None = Field(
        default=None,
        description="Date de fin (pour custom)"
    )
    include_meals: bool = Field(
        default=True,
        description="Inclure les repas détaillés"
    )
    include_activities: bool = Field(
        default=True,
        description="Inclure les activités"
    )
    include_weight: bool = Field(
        default=True,
        description="Inclure l'évolution du poids"
    )
    include_recommendations: bool = Field(
        default=True,
        description="Inclure les recommandations"
    )


class ExportPDFResponse(BaseModel):
    """Réponse d'export PDF."""

    filename: str = Field(..., description="Nom du fichier")
    content_type: str = Field(default="application/pdf")
    size_bytes: int = Field(..., description="Taille du fichier")
    download_url: str | None = Field(default=None, description="URL de téléchargement")


class NutritionSummary(BaseModel):
    """Résumé nutritionnel pour le PDF."""

    avg_calories: float
    avg_protein: float
    avg_carbs: float
    avg_fat: float
    total_meals: int
    avg_meals_per_day: float
    calorie_target: int
    protein_target: int
    adherence_percent: float


class ActivitySummary(BaseModel):
    """Résumé des activités pour le PDF."""

    total_activities: int
    total_duration_minutes: int
    total_calories_burned: int
    avg_duration_per_day: float
    most_frequent_activity: str | None
    total_steps: int


class WeightSummary(BaseModel):
    """Résumé de l'évolution du poids pour le PDF."""

    start_weight: float | None
    end_weight: float | None
    weight_change: float | None
    trend: Literal["loss", "gain", "stable"] | None
    measurements_count: int


class PDFReportData(BaseModel):
    """Données complètes pour le rapport PDF."""

    # User info
    user_name: str
    user_email: str
    report_period: str
    generated_at: str

    # Profile
    age: int | None
    gender: str | None
    height_cm: float | None
    weight_kg: float | None
    goal: str | None
    diet_type: str | None

    # Summaries
    nutrition: NutritionSummary | None
    activities: ActivitySummary | None
    weight: WeightSummary | None

    # Recommendations
    recommendations: list[str]
