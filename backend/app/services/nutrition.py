from app.models.profile import Gender, ActivityLevel, Goal
from app.schemas.profile import NutritionCalculation


# Multiplicateurs d'activité pour TDEE
ACTIVITY_MULTIPLIERS = {
    ActivityLevel.SEDENTARY: 1.2,
    ActivityLevel.LIGHT: 1.375,
    ActivityLevel.MODERATE: 1.55,
    ActivityLevel.ACTIVE: 1.725,
    ActivityLevel.VERY_ACTIVE: 1.9,
}

# Ajustements caloriques selon l'objectif
GOAL_ADJUSTMENTS = {
    Goal.LOSE_WEIGHT: -500,      # Déficit de 500 kcal
    Goal.MAINTAIN: 0,
    Goal.GAIN_MUSCLE: 300,       # Surplus de 300 kcal
    Goal.IMPROVE_HEALTH: 0,
}


class NutritionService:
    """Service de calcul des besoins nutritionnels."""

    def calculate_bmr(
        self,
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: Gender,
    ) -> float:
        """
        Calcule le métabolisme de base (BMR) avec la formule Mifflin-St Jeor.

        Formule:
        - Homme: BMR = (10 × poids) + (6.25 × taille) - (5 × âge) + 5
        - Femme: BMR = (10 × poids) + (6.25 × taille) - (5 × âge) - 161
        """
        base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)

        if gender == Gender.MALE:
            return base + 5
        elif gender == Gender.FEMALE:
            return base - 161
        else:
            # Pour "other", moyenne des deux formules
            return base - 78

    def calculate_tdee(
        self,
        bmr: float,
        activity_level: ActivityLevel,
    ) -> float:
        """
        Calcule la dépense énergétique totale (TDEE).

        TDEE = BMR × multiplicateur d'activité
        """
        multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.2)
        return bmr * multiplier

    def calculate_daily_calories(
        self,
        tdee: float,
        goal: Goal,
    ) -> int:
        """Calcule les calories journalières cibles selon l'objectif."""
        adjustment = GOAL_ADJUSTMENTS.get(goal, 0)
        return max(1200, int(tdee + adjustment))  # Minimum 1200 kcal

    def calculate_macros(
        self,
        daily_calories: int,
        goal: Goal,
        weight_kg: float,
    ) -> tuple[int, int, int]:
        """
        Calcule la répartition des macronutriments.

        Retourne (protéines_g, glucides_g, lipides_g)
        """
        if goal == Goal.GAIN_MUSCLE:
            # High protein: 2g/kg, 25% fat, reste en carbs
            protein_g = int(weight_kg * 2.0)
            fat_g = int((daily_calories * 0.25) / 9)
            carbs_g = int((daily_calories - (protein_g * 4) - (fat_g * 9)) / 4)

        elif goal == Goal.LOSE_WEIGHT:
            # High protein pour préserver muscle: 1.8g/kg, 30% fat, reste en carbs
            protein_g = int(weight_kg * 1.8)
            fat_g = int((daily_calories * 0.30) / 9)
            carbs_g = int((daily_calories - (protein_g * 4) - (fat_g * 9)) / 4)

        else:
            # Répartition équilibrée: 30% protein, 35% carbs, 35% fat
            protein_g = int((daily_calories * 0.30) / 4)
            carbs_g = int((daily_calories * 0.35) / 4)
            fat_g = int((daily_calories * 0.35) / 9)

        # S'assurer que les valeurs sont positives
        protein_g = max(50, protein_g)
        carbs_g = max(50, carbs_g)
        fat_g = max(30, fat_g)

        return protein_g, carbs_g, fat_g

    def calculate_all(
        self,
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: Gender,
        activity_level: ActivityLevel,
        goal: Goal,
    ) -> NutritionCalculation:
        """Calcule tous les besoins nutritionnels."""
        bmr = self.calculate_bmr(weight_kg, height_cm, age, gender)
        tdee = self.calculate_tdee(bmr, activity_level)
        daily_calories = self.calculate_daily_calories(tdee, goal)
        protein_g, carbs_g, fat_g = self.calculate_macros(daily_calories, goal, weight_kg)

        return NutritionCalculation(
            bmr=round(bmr, 1),
            tdee=round(tdee, 1),
            daily_calories=daily_calories,
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
            confidence=1.0,  # Calcul déterministe = confiance maximale
        )


# Singleton
_nutrition_service: NutritionService | None = None


def get_nutrition_service() -> NutritionService:
    """Retourne le service nutrition singleton."""
    global _nutrition_service
    if _nutrition_service is None:
        _nutrition_service = NutritionService()
    return _nutrition_service
