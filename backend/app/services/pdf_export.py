"""Service d'export PDF pour les rapports nutritionnels."""
import io
from datetime import datetime, date, timedelta
from typing import TYPE_CHECKING

import structlog
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
)
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart

from app.schemas.export import (
    PDFReportData,
    NutritionSummary,
    ActivitySummary,
    WeightSummary,
)

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.models.user import User

logger = structlog.get_logger()

# Couleurs NutriProfile
PRIMARY_COLOR = colors.HexColor("#10b981")  # Emerald-500
SECONDARY_COLOR = colors.HexColor("#6366f1")  # Indigo-500
SUCCESS_COLOR = colors.HexColor("#22c55e")  # Green-500
WARNING_COLOR = colors.HexColor("#f59e0b")  # Amber-500
GRAY_COLOR = colors.HexColor("#6b7280")  # Gray-500
LIGHT_GRAY = colors.HexColor("#f3f4f6")  # Gray-100


class PDFExportService:
    """Service de génération de rapports PDF."""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Configure les styles personnalisés."""
        # Titre principal
        self.styles.add(ParagraphStyle(
            name='MainTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=PRIMARY_COLOR,
            spaceAfter=20,
            alignment=1,  # Center
        ))

        # Sous-titre
        self.styles.add(ParagraphStyle(
            name='SubTitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=SECONDARY_COLOR,
            spaceAfter=10,
            alignment=1,
        ))

        # Section header
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=PRIMARY_COLOR,
            spaceBefore=20,
            spaceAfter=10,
            borderColor=PRIMARY_COLOR,
            borderWidth=2,
            borderPadding=5,
        ))

        # Normal centered
        self.styles.add(ParagraphStyle(
            name='CenteredNormal',
            parent=self.styles['Normal'],
            alignment=1,
        ))

        # Stats value
        self.styles.add(ParagraphStyle(
            name='StatValue',
            parent=self.styles['Normal'],
            fontSize=20,
            textColor=PRIMARY_COLOR,
            alignment=1,
        ))

        # Stats label
        self.styles.add(ParagraphStyle(
            name='StatLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=GRAY_COLOR,
            alignment=1,
        ))

    async def generate_report(
        self,
        db: "AsyncSession",
        user: "User",
        report_type: str,
        start_date: date | None = None,
        end_date: date | None = None,
        include_meals: bool = True,
        include_activities: bool = True,
        include_weight: bool = True,
        include_recommendations: bool = True,
    ) -> tuple[bytes, str]:
        """
        Génère un rapport PDF complet.

        Returns:
            tuple: (bytes du PDF, nom du fichier)
        """
        from sqlalchemy import select, and_, func
        from app.models.profile import Profile
        from app.models.food_log import DailyNutrition
        from app.models.activity import ActivityLog, WeightLog

        # Déterminer la période
        if report_type == "weekly":
            end_date = date.today()
            start_date = end_date - timedelta(days=7)
        elif report_type == "monthly":
            end_date = date.today()
            start_date = end_date - timedelta(days=30)
        elif start_date is None or end_date is None:
            end_date = date.today()
            start_date = end_date - timedelta(days=7)

        start_dt = datetime.combine(start_date, datetime.min.time())
        end_dt = datetime.combine(end_date, datetime.max.time())

        # Récupérer le profil
        profile_query = select(Profile).where(Profile.user_id == user.id)
        profile_result = await db.execute(profile_query)
        profile = profile_result.scalar_one_or_none()

        # Récupérer les données nutritionnelles
        nutrition_summary = None
        if include_meals:
            nutrition_query = select(DailyNutrition).where(and_(
                DailyNutrition.user_id == user.id,
                DailyNutrition.date >= start_dt,
                DailyNutrition.date <= end_dt,
            ))
            nutrition_result = await db.execute(nutrition_query)
            nutritions = nutrition_result.scalars().all()

            if nutritions:
                days_count = len(nutritions)
                total_calories = sum(n.total_calories for n in nutritions)
                total_protein = sum(n.total_protein for n in nutritions)
                total_carbs = sum(n.total_carbs for n in nutritions)
                total_fat = sum(n.total_fat for n in nutritions)
                total_meals = sum(n.meals_count for n in nutritions)

                target_calories = profile.daily_calories if profile else 2000
                target_protein = profile.protein_g if profile else 100

                nutrition_summary = NutritionSummary(
                    avg_calories=total_calories / days_count,
                    avg_protein=total_protein / days_count,
                    avg_carbs=total_carbs / days_count,
                    avg_fat=total_fat / days_count,
                    total_meals=total_meals,
                    avg_meals_per_day=total_meals / days_count,
                    calorie_target=target_calories,
                    protein_target=target_protein,
                    adherence_percent=min(100, (total_calories / days_count) / target_calories * 100),
                )

        # Récupérer les activités
        activity_summary = None
        if include_activities:
            activities_query = select(ActivityLog).where(and_(
                ActivityLog.user_id == user.id,
                ActivityLog.activity_date >= start_dt,
                ActivityLog.activity_date <= end_dt,
            ))
            activities_result = await db.execute(activities_query)
            activities = activities_result.scalars().all()

            if activities:
                total_duration = sum(a.duration_minutes for a in activities)
                total_burned = sum(a.calories_burned or 0 for a in activities)
                total_steps = sum(a.steps or 0 for a in activities)
                days = (end_date - start_date).days + 1

                # Trouver l'activité la plus fréquente
                activity_counts: dict[str, int] = {}
                for a in activities:
                    activity_counts[a.activity_type] = activity_counts.get(a.activity_type, 0) + 1
                most_frequent = max(activity_counts, key=activity_counts.get) if activity_counts else None

                activity_summary = ActivitySummary(
                    total_activities=len(activities),
                    total_duration_minutes=total_duration,
                    total_calories_burned=total_burned,
                    avg_duration_per_day=total_duration / days,
                    most_frequent_activity=most_frequent,
                    total_steps=total_steps,
                )

        # Récupérer l'évolution du poids
        weight_summary = None
        if include_weight:
            weight_query = select(WeightLog).where(and_(
                WeightLog.user_id == user.id,
                WeightLog.log_date >= start_dt,
                WeightLog.log_date <= end_dt,
            )).order_by(WeightLog.log_date)
            weight_result = await db.execute(weight_query)
            weights = weight_result.scalars().all()

            if weights:
                start_weight = weights[0].weight_kg
                end_weight = weights[-1].weight_kg
                change = end_weight - start_weight

                trend = "stable"
                if change < -0.5:
                    trend = "loss"
                elif change > 0.5:
                    trend = "gain"

                weight_summary = WeightSummary(
                    start_weight=start_weight,
                    end_weight=end_weight,
                    weight_change=change,
                    trend=trend,
                    measurements_count=len(weights),
                )

        # Générer les recommandations
        recommendations = []
        if include_recommendations:
            recommendations = self._generate_recommendations(
                nutrition_summary,
                activity_summary,
                weight_summary,
                profile,
            )

        # Construire les données du rapport
        report_data = PDFReportData(
            user_name=user.name,
            user_email=user.email,
            report_period=f"{start_date.strftime('%d/%m/%Y')} - {end_date.strftime('%d/%m/%Y')}",
            generated_at=datetime.now().strftime("%d/%m/%Y à %H:%M"),
            age=profile.age if profile else None,
            gender=profile.gender if profile else None,
            height_cm=profile.height_cm if profile else None,
            weight_kg=profile.weight_kg if profile else None,
            goal=profile.goal if profile else None,
            diet_type=profile.diet_type if profile else None,
            nutrition=nutrition_summary,
            activities=activity_summary,
            weight=weight_summary,
            recommendations=recommendations,
        )

        # Générer le PDF
        pdf_bytes = self._generate_pdf(report_data)

        # Nom du fichier
        filename = f"nutriprofile_rapport_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.pdf"

        logger.info(
            "pdf_report_generated",
            user_id=user.id,
            report_type=report_type,
            period=f"{start_date} - {end_date}",
            size_bytes=len(pdf_bytes),
        )

        return pdf_bytes, filename

    def _generate_recommendations(
        self,
        nutrition: NutritionSummary | None,
        activities: ActivitySummary | None,
        weight: WeightSummary | None,
        profile,
    ) -> list[str]:
        """Génère des recommandations basées sur les données."""
        recommendations = []

        if nutrition:
            if nutrition.adherence_percent < 80:
                recommendations.append(
                    "Vous êtes en dessous de votre objectif calorique. "
                    "Essayez d'ajouter des collations saines pour atteindre vos objectifs."
                )
            elif nutrition.adherence_percent > 120:
                recommendations.append(
                    "Vous dépassez régulièrement votre objectif calorique. "
                    "Essayez de réduire les portions ou de choisir des alternatives moins caloriques."
                )

            if nutrition.avg_protein < (nutrition.protein_target * 0.8):
                recommendations.append(
                    "Votre apport en protéines est insuffisant. "
                    "Ajoutez plus de viandes maigres, poisson, œufs ou légumineuses."
                )

            if nutrition.avg_meals_per_day < 2.5:
                recommendations.append(
                    "Vous ne logez pas assez de repas. "
                    "Essayez de logger tous vos repas pour un suivi plus précis."
                )

        if activities:
            if activities.avg_duration_per_day < 30:
                recommendations.append(
                    "Votre activité physique quotidienne est en dessous des recommandations. "
                    "Visez au moins 30 minutes d'activité modérée par jour."
                )
            elif activities.avg_duration_per_day >= 60:
                recommendations.append(
                    "Excellent niveau d'activité ! "
                    "Continuez ainsi et assurez-vous de bien récupérer entre les séances."
                )

        if weight:
            if weight.trend == "gain" and profile and profile.goal == "lose_weight":
                recommendations.append(
                    "Attention : vous prenez du poids alors que votre objectif est d'en perdre. "
                    "Révisez votre alimentation et augmentez votre activité physique."
                )
            elif weight.trend == "loss" and profile and profile.goal == "gain_muscle":
                recommendations.append(
                    "Vous perdez du poids alors que votre objectif est de prendre du muscle. "
                    "Augmentez votre apport calorique et protéique."
                )
            elif weight.trend == "stable":
                recommendations.append(
                    "Votre poids est stable. "
                    "C'est positif si c'est votre objectif, sinon ajustez votre alimentation."
                )

        if not recommendations:
            recommendations.append(
                "Continuez vos bonnes habitudes ! "
                "Vous êtes sur la bonne voie pour atteindre vos objectifs."
            )

        return recommendations

    def _generate_pdf(self, data: PDFReportData) -> bytes:
        """Génère le fichier PDF à partir des données."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        story = []

        # En-tête
        story.append(Paragraph("🥗 NutriProfile", self.styles['MainTitle']))
        story.append(Paragraph("Rapport Nutritionnel", self.styles['SubTitle']))
        story.append(Paragraph(f"Période : {data.report_period}", self.styles['CenteredNormal']))
        story.append(Paragraph(f"Généré le {data.generated_at}", self.styles['CenteredNormal']))
        story.append(Spacer(1, 20))

        # Informations utilisateur
        story.append(Paragraph("📋 Votre Profil", self.styles['SectionHeader']))
        profile_data = [
            ["Nom", data.user_name],
            ["Email", data.user_email],
        ]
        if data.age:
            profile_data.append(["Âge", f"{data.age} ans"])
        if data.weight_kg:
            profile_data.append(["Poids actuel", f"{data.weight_kg} kg"])
        if data.height_cm:
            profile_data.append(["Taille", f"{data.height_cm} cm"])
        if data.goal:
            goal_labels = {
                "lose_weight": "Perte de poids",
                "maintain": "Maintien",
                "gain_muscle": "Prise de muscle",
                "improve_health": "Améliorer la santé",
            }
            profile_data.append(["Objectif", goal_labels.get(data.goal, data.goal)])
        if data.diet_type:
            diet_labels = {
                "omnivore": "Omnivore",
                "vegetarian": "Végétarien",
                "vegan": "Végétalien",
                "keto": "Keto",
                "paleo": "Paleo",
            }
            profile_data.append(["Régime", diet_labels.get(data.diet_type, data.diet_type)])

        profile_table = Table(profile_data, colWidths=[100, 300])
        profile_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (0, -1), GRAY_COLOR),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))
        story.append(profile_table)
        story.append(Spacer(1, 20))

        # Section Nutrition
        if data.nutrition:
            story.append(Paragraph("🍽️ Nutrition", self.styles['SectionHeader']))

            # Stats principales
            nutrition_stats = [
                ["Calories moyennes", f"{data.nutrition.avg_calories:.0f} kcal", f"Objectif: {data.nutrition.calorie_target} kcal"],
                ["Protéines moyennes", f"{data.nutrition.avg_protein:.0f} g", f"Objectif: {data.nutrition.protein_target} g"],
                ["Glucides moyens", f"{data.nutrition.avg_carbs:.0f} g", "-"],
                ["Lipides moyens", f"{data.nutrition.avg_fat:.0f} g", "-"],
                ["Repas total", str(data.nutrition.total_meals), f"Moy/jour: {data.nutrition.avg_meals_per_day:.1f}"],
                ["Adhérence", f"{data.nutrition.adherence_percent:.0f}%", "-"],
            ]

            nutrition_table = Table(nutrition_stats, colWidths=[150, 120, 150])
            nutrition_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
            ]))
            story.append(nutrition_table)
            story.append(Spacer(1, 20))

        # Section Activités
        if data.activities:
            story.append(Paragraph("🏃 Activités Physiques", self.styles['SectionHeader']))

            activity_stats = [
                ["Total activités", str(data.activities.total_activities)],
                ["Durée totale", f"{data.activities.total_duration_minutes} min"],
                ["Calories brûlées", f"{data.activities.total_calories_burned} kcal"],
                ["Moyenne par jour", f"{data.activities.avg_duration_per_day:.0f} min"],
                ["Pas total", f"{data.activities.total_steps:,}".replace(",", " ")],
            ]
            if data.activities.most_frequent_activity:
                activity_stats.append(["Activité favorite", data.activities.most_frequent_activity])

            activity_table = Table(activity_stats, colWidths=[200, 220])
            activity_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
                ('TEXTCOLOR', (0, 0), (0, -1), GRAY_COLOR),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ]))
            story.append(activity_table)
            story.append(Spacer(1, 20))

        # Section Poids
        if data.weight:
            story.append(Paragraph("⚖️ Évolution du Poids", self.styles['SectionHeader']))

            trend_labels = {
                "loss": "📉 Perte de poids",
                "gain": "📈 Prise de poids",
                "stable": "➡️ Stable",
            }

            weight_stats = [
                ["Poids initial", f"{data.weight.start_weight:.1f} kg" if data.weight.start_weight else "-"],
                ["Poids final", f"{data.weight.end_weight:.1f} kg" if data.weight.end_weight else "-"],
                ["Variation", f"{data.weight.weight_change:+.1f} kg" if data.weight.weight_change else "-"],
                ["Tendance", trend_labels.get(data.weight.trend, "-") if data.weight.trend else "-"],
                ["Mesures", str(data.weight.measurements_count)],
            ]

            weight_table = Table(weight_stats, colWidths=[200, 220])
            weight_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
                ('TEXTCOLOR', (0, 0), (0, -1), GRAY_COLOR),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ]))
            story.append(weight_table)
            story.append(Spacer(1, 20))

        # Section Recommandations
        if data.recommendations:
            story.append(Paragraph("💡 Recommandations", self.styles['SectionHeader']))

            for i, rec in enumerate(data.recommendations, 1):
                story.append(Paragraph(f"{i}. {rec}", self.styles['Normal']))
                story.append(Spacer(1, 5))

            story.append(Spacer(1, 20))

        # Pied de page
        story.append(Spacer(1, 30))
        story.append(Paragraph(
            "Ce rapport a été généré automatiquement par NutriProfile. "
            "Les recommandations sont indicatives et ne remplacent pas l'avis d'un professionnel de santé.",
            ParagraphStyle(
                name='Footer',
                parent=self.styles['Normal'],
                fontSize=8,
                textColor=GRAY_COLOR,
                alignment=1,
            )
        ))

        # Construire le PDF
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes


# Singleton
_pdf_service: PDFExportService | None = None


def get_pdf_export_service() -> PDFExportService:
    """Retourne le service d'export PDF singleton."""
    global _pdf_service
    if _pdf_service is None:
        _pdf_service = PDFExportService()
    return _pdf_service
