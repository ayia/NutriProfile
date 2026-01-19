"""Endpoints API pour le logging vocal."""

from fastapi import APIRouter, Depends, HTTPException, status
import structlog

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.voice import VoiceInput, ParsedVoiceResponse
from app.services.voice_parser import get_voice_parser

router = APIRouter()
logger = structlog.get_logger()


@router.post("/parse-voice", response_model=ParsedVoiceResponse)
async def parse_voice_input(
    data: VoiceInput,
    current_user: User = Depends(get_current_user),
):
    """
    Parse une transcription vocale pour extraire les aliments.

    **Flow utilisateur:**
    1. Frontend utilise Web Speech API pour transcrire la voix
    2. Envoie la transcription à cet endpoint
    3. Backend utilise Qwen LLM pour parser le texte
    4. Retourne une liste structurée d'aliments avec quantités

    **Exemples de transcriptions:**
    - FR: "J'ai mangé 200g de poulet grillé avec du riz et des brocolis"
    - EN: "I ate 200g of chicken with rice and broccoli"
    - FR: "Un sandwich jambon fromage et une pomme"

    **Retour:**
    - items: Liste d'aliments détectés avec nom, quantité, unité
    - confidence: Score de confiance du parsing (0-1)
    - raw_text: Texte original pour debug
    """
    if not data.transcription or len(data.transcription.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcription trop courte ou vide",
        )

    try:
        # Parser la transcription avec le LLM
        parser = get_voice_parser()
        items, confidence = await parser.parse_transcription(
            transcription=data.transcription,
            language=data.language,
        )

        logger.info(
            "voice_parsing_complete",
            user_id=current_user.id,
            items_count=len(items),
            confidence=confidence,
            language=data.language,
        )

        return ParsedVoiceResponse(
            items=items,
            confidence=confidence,
            raw_text=data.transcription,
        )

    except Exception as e:
        logger.error(
            "voice_parsing_failed",
            user_id=current_user.id,
            error=str(e),
            transcription=data.transcription[:100],
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du parsing vocal: {str(e)}",
        )
