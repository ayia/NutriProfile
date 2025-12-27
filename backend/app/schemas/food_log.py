from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class FoodItemBase(BaseModel):
    """Base pour un aliment."""
    name: str
    quantity: str
    unit: str = "g"
    calories: int | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None
    fiber: float | None = None


class FoodItemCreate(FoodItemBase):
    """Création d'un aliment."""
    pass


class FoodItemResponse(FoodItemBase):
    """Réponse aliment."""
    id: int
    source: str = "ai"
    confidence: float | None = None
    is_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


class FoodItemUpdate(BaseModel):
    """Mise à jour d'un aliment (correction utilisateur)."""
    name: str | None = None
    quantity: str | None = None
    unit: str | None = None
    calories: int | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None
    is_verified: bool | None = None


# Food Log Schemas

class FoodLogBase(BaseModel):
    """Base pour un log de repas."""
    meal_type: str = Field(..., description="breakfast, lunch, dinner, snack")
    meal_date: datetime | None = None
    description: str | None = None


class FoodLogCreate(FoodLogBase):
    """Création d'un log de repas."""
    items: list[FoodItemCreate] | None = None


class FoodLogResponse(FoodLogBase):
    """Réponse log de repas."""
    id: int
    user_id: int
    image_url: str | None = None
    image_analyzed: bool = False
    detected_items: list[dict] | None = None
    confidence_score: float | None = None
    model_used: str | None = None
    total_calories: int | None = None
    total_protein: float | None = None
    total_carbs: float | None = None
    total_fat: float | None = None
    total_fiber: float | None = None
    user_corrected: bool = False
    items: list[FoodItemResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FoodLogUpdate(BaseModel):
    """Mise à jour d'un log."""
    meal_type: str | None = None
    description: str | None = None
    total_calories: int | None = None
    total_protein: float | None = None
    total_carbs: float | None = None
    total_fat: float | None = None


# Image Analysis Schemas

class ImageAnalyzeRequest(BaseModel):
    """Requête d'analyse d'image."""
    image_base64: str = Field(..., description="Image encodée en base64")
    meal_type: str = Field(default="lunch", description="Type de repas")
    save_to_log: bool = Field(default=True, description="Sauvegarder dans le journal")


class DetectedItem(BaseModel):
    """Aliment détecté par l'IA."""
    name: str
    quantity: str
    unit: str
    calories: int
    protein: float
    carbs: float
    fat: float
    confidence: float


class HealthReportResponse(BaseModel):
    """Rapport de santé personnalisé."""
    health_score: int = Field(..., ge=0, le=100, description="Score santé global du repas (0-100)")
    goal_compatibility: int = Field(..., ge=0, le=100, description="Compatibilité avec les objectifs (0-100)")
    verdict: str = Field(..., description="excellent, good, neutral, poor, bad")
    verdict_color: str = Field(default="gray", description="Couleur pour UI: green, emerald, yellow, orange, red")
    summary: str = Field(..., description="Résumé en une phrase")
    positive_points: list[str] = Field(default_factory=list)
    negative_points: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    macro_analysis: dict = Field(default_factory=dict)
    weekly_impact: dict = Field(default_factory=dict, description="Impact sur la progression hebdomadaire")
    meal_timing_feedback: str | None = Field(default=None, description="Feedback basé sur l'heure du repas")


class ImageAnalyzeResponse(BaseModel):
    """Réponse d'analyse d'image avec rapport de santé personnalisé."""
    success: bool
    description: str
    meal_type: str | None = None
    items: list[DetectedItem]
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    confidence: float
    model_used: str
    food_log_id: int | None = None
    health_report: HealthReportResponse | None = None


# Save Analysis (without re-analyzing) Schemas

class AnalysisSaveRequest(BaseModel):
    """Requête pour sauvegarder une analyse déjà effectuée (sans reconsommer de crédit)."""
    meal_type: str = Field(..., description="Type de repas: breakfast, lunch, dinner, snack")
    description: str | None = None
    items: list[DetectedItem] = Field(..., description="Liste des aliments détectés")
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    confidence: float
    model_used: str


# Daily Nutrition Schemas

class DailyNutritionResponse(BaseModel):
    """Résumé nutritionnel journalier."""
    id: int
    date: datetime
    total_calories: int = 0
    total_protein: float = 0
    total_carbs: float = 0
    total_fat: float = 0
    total_fiber: float = 0
    target_calories: int | None = None
    target_protein: float | None = None
    target_carbs: float | None = None
    target_fat: float | None = None
    meals_count: int = 0
    water_ml: int = 0

    # Pourcentages d'atteinte des objectifs
    calories_percent: float | None = None
    protein_percent: float | None = None
    carbs_percent: float | None = None
    fat_percent: float | None = None

    model_config = ConfigDict(from_attributes=True)

    def __init__(self, **data):
        super().__init__(**data)
        # Calculer les pourcentages
        if self.target_calories and self.target_calories > 0:
            self.calories_percent = round((self.total_calories / self.target_calories) * 100, 1)
        if self.target_protein and self.target_protein > 0:
            self.protein_percent = round((self.total_protein / self.target_protein) * 100, 1)
        if self.target_carbs and self.target_carbs > 0:
            self.carbs_percent = round((self.total_carbs / self.target_carbs) * 100, 1)
        if self.target_fat and self.target_fat > 0:
            self.fat_percent = round((self.total_fat / self.target_fat) * 100, 1)


class WaterLogRequest(BaseModel):
    """Ajouter de l'eau."""
    amount_ml: int = Field(..., ge=0, le=5000)


class DailyMealsResponse(BaseModel):
    """Repas de la journée avec totaux."""
    date: datetime
    meals: list[FoodLogResponse]
    nutrition: DailyNutritionResponse | None = None
