from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator

from app.models.profile import Gender, ActivityLevel, Goal, DietType


class ProfileBase(BaseModel):
    """Schéma de base pour le profil."""

    age: int = Field(..., ge=13, le=120, description="Âge en années")
    gender: Gender = Field(..., description="Genre")
    height_cm: float = Field(..., ge=100, le=250, description="Taille en cm")
    weight_kg: float = Field(..., ge=30, le=300, description="Poids en kg")
    activity_level: ActivityLevel = Field(..., description="Niveau d'activité")
    goal: Goal = Field(..., description="Objectif principal")
    target_weight_kg: float | None = Field(None, ge=30, le=300, description="Poids cible")
    diet_type: DietType = Field(default=DietType.OMNIVORE, description="Type de régime")


class ProfileCreateStep1(BaseModel):
    """Étape 1: Informations de base."""

    age: int = Field(..., ge=13, le=120)
    gender: Gender
    height_cm: float = Field(..., ge=100, le=250)
    weight_kg: float = Field(..., ge=30, le=300)


class ProfileCreateStep2(BaseModel):
    """Étape 2: Activité et objectifs."""

    activity_level: ActivityLevel
    goal: Goal
    target_weight_kg: float | None = Field(None, ge=30, le=300)


class ProfileCreateStep3(BaseModel):
    """Étape 3: Préférences alimentaires."""

    diet_type: DietType = DietType.OMNIVORE
    allergies: list[str] = Field(default_factory=list)
    excluded_foods: list[str] = Field(default_factory=list)
    favorite_foods: list[str] = Field(default_factory=list)

    @field_validator('allergies', 'excluded_foods', 'favorite_foods', mode='before')
    @classmethod
    def normalize_list(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(',') if item.strip()]
        return v or []


class ProfileCreateStep4(BaseModel):
    """Étape 4: Informations de santé (optionnel)."""

    medical_conditions: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)


class ProfileCreate(BaseModel):
    """Schéma complet pour création de profil."""

    # Step 1
    age: int = Field(..., ge=13, le=120)
    gender: Gender
    height_cm: float = Field(..., ge=100, le=250)
    weight_kg: float = Field(..., ge=30, le=300)

    # Step 2
    activity_level: ActivityLevel
    goal: Goal
    target_weight_kg: float | None = None

    # Step 3
    diet_type: DietType = DietType.OMNIVORE
    allergies: list[str] = Field(default_factory=list)
    excluded_foods: list[str] = Field(default_factory=list)
    favorite_foods: list[str] = Field(default_factory=list)

    # Step 4
    medical_conditions: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    """Schéma pour mise à jour partielle."""

    age: int | None = Field(None, ge=13, le=120)
    gender: Gender | None = None
    height_cm: float | None = Field(None, ge=100, le=250)
    weight_kg: float | None = Field(None, ge=30, le=300)
    activity_level: ActivityLevel | None = None
    goal: Goal | None = None
    target_weight_kg: float | None = None
    diet_type: DietType | None = None
    allergies: list[str] | None = None
    excluded_foods: list[str] | None = None
    favorite_foods: list[str] | None = None
    medical_conditions: list[str] | None = None
    medications: list[str] | None = None


class NutritionCalculation(BaseModel):
    """Résultat des calculs nutritionnels."""

    bmr: float = Field(..., description="Basal Metabolic Rate (kcal/jour)")
    tdee: float = Field(..., description="Total Daily Energy Expenditure (kcal/jour)")
    daily_calories: int = Field(..., description="Calories cibles par jour")
    protein_g: int = Field(..., description="Protéines en grammes")
    carbs_g: int = Field(..., description="Glucides en grammes")
    fat_g: int = Field(..., description="Lipides en grammes")
    confidence: float = Field(..., ge=0, le=1, description="Score de confiance")


class ProfileResponse(BaseModel):
    """Réponse complète du profil."""

    id: int
    user_id: int

    # Infos de base
    age: int
    gender: Gender
    height_cm: float
    weight_kg: float

    # Activité
    activity_level: ActivityLevel
    goal: Goal
    target_weight_kg: float | None

    # Préférences
    diet_type: DietType
    allergies: list[str]
    excluded_foods: list[str]
    favorite_foods: list[str]

    # Santé
    medical_conditions: list[str]
    medications: list[str]

    # Calculs
    bmr: float | None
    tdee: float | None
    daily_calories: int | None
    protein_g: int | None
    carbs_g: int | None
    fat_g: int | None

    # Méta
    is_complete: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileSummary(BaseModel):
    """Résumé du profil pour le dashboard."""

    has_profile: bool
    is_complete: bool
    daily_calories: int | None = None
    goal: Goal | None = None
    diet_type: DietType | None = None
