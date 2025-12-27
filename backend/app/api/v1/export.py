"""Endpoints d'export PDF."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import io

from app.database import get_db
from app.api.deps import get_current_user, check_subscription_tier
from app.models.user import User
from app.schemas.export import ExportPDFRequest, ExportPDFResponse
from app.services.pdf_export import get_pdf_export_service

router = APIRouter()


@router.post("/pdf", response_model=ExportPDFResponse)
async def generate_pdf_report(
    request: ExportPDFRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Génère un rapport PDF nutritionnel.

    Fonctionnalité PRO uniquement.
    """
    # Vérifier que l'utilisateur a le tier PRO
    await check_subscription_tier(current_user, db, required_tier="pro")

    pdf_service = get_pdf_export_service()

    try:
        pdf_bytes, filename = await pdf_service.generate_report(
            db=db,
            user=current_user,
            report_type=request.report_type,
            start_date=request.start_date,
            end_date=request.end_date,
            include_meals=request.include_meals,
            include_activities=request.include_activities,
            include_weight=request.include_weight,
            include_recommendations=request.include_recommendations,
        )

        return ExportPDFResponse(
            filename=filename,
            size_bytes=len(pdf_bytes),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du PDF: {str(e)}")


@router.post("/pdf/download")
async def download_pdf_report(
    request: ExportPDFRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Télécharge directement le rapport PDF.

    Fonctionnalité PRO uniquement.
    """
    # Vérifier que l'utilisateur a le tier PRO
    await check_subscription_tier(current_user, db, required_tier="pro")

    pdf_service = get_pdf_export_service()

    try:
        pdf_bytes, filename = await pdf_service.generate_report(
            db=db,
            user=current_user,
            report_type=request.report_type,
            start_date=request.start_date,
            end_date=request.end_date,
            include_meals=request.include_meals,
            include_activities=request.include_activities,
            include_weight=request.include_weight,
            include_recommendations=request.include_recommendations,
        )

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du PDF: {str(e)}")
