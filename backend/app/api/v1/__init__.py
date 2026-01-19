from fastapi import APIRouter

from app.api.v1 import (
    auth,
    users,
    health,
    profiles,
    recipes,
    vision,
    tracking,
    dashboard,
    coaching,
    subscriptions,
    webhooks,
    export,
    meal_plans,
    nutrition,
    barcode,
    voice,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(vision.router, prefix="/vision", tags=["vision"])
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["tracking"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(coaching.router, prefix="/coaching", tags=["coaching"])
api_router.include_router(subscriptions.router)
api_router.include_router(webhooks.router)
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(meal_plans.router, prefix="/meal-plans", tags=["meal-plans"])
api_router.include_router(barcode.router, prefix="/barcode", tags=["barcode"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
