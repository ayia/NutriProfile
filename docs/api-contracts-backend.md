# API Contracts - Backend NutriProfile

**Date de génération** : 2026-01-27
**Nombre total d'endpoints** : 97
**Version API** : v1
**Base URL** : `https://nutriprofile-api.fly.dev/api/v1`

---

## 📚 Table des Matières

1. [Authentication](#authentication) - Authentification et gestion des tokens
2. [Users](#users) - Gestion des utilisateurs
3. [Profiles](#profiles) - Profils nutritionnels
4. [Vision](#vision) - Analyse photo repas (IA)
5. [Recipes](#recipes) - Génération recettes (IA)
6. [Nutrition](#nutrition) - Données nutritionnelles
7. [Tracking](#tracking) - Suivi activité et poids
8. [Dashboard](#dashboard) - Statistiques et achievements
9. [Coaching](#coaching) - Coach IA personnalisé
10. [Subscriptions](#subscriptions) - Gestion abonnements (Lemon Squeezy)
11. [Meal Plans](#meal-plans) - Plans alimentaires
12. [Export](#export) - Export PDF
13. [Barcode](#barcode) - Scan de codes-barres
14. [Voice](#voice) - Logging vocal
15. [Webhooks](#webhooks) - Webhooks externes
16. [Health](#health) - Health checks

---

## 🔐 Authentication

**Module** : `auth.py`

### POST /api/v1/auth/register
Créer un nouveau compte utilisateur avec trial Premium 14 jours.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "trial_ends_at": "2026-02-10T15:00:00Z",
  "created_at": "2026-01-27T15:00:00Z"
}
```

### POST /api/v1/auth/login
Obtenir un token JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /api/v1/auth/refresh
Rafraîchir le token JWT.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### POST /api/v1/auth/forgot-password
Demander un reset de mot de passe (envoi email).

### POST /api/v1/auth/reset-password
Réinitialiser le mot de passe avec token.

---

## 👤 Users

**Module** : `users.py`

### GET /api/v1/users/me
Obtenir les informations de l'utilisateur connecté.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### PUT /api/v1/users/me
Mettre à jour les informations utilisateur.

### DELETE /api/v1/users/me
Supprimer le compte utilisateur.

---

## 🎯 Profiles

**Module** : `profiles.py`

### GET /api/v1/profiles/me
Obtenir le profil nutritionnel de l'utilisateur.

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": 1,
  "age": 30,
  "weight": 70.5,
  "height": 175,
  "sex": "M",
  "activity_level": "moderate",
  "fitness_goal": "weight_loss",
  "diet_type": "omnivore",
  "allergies": ["peanuts", "gluten"],
  "bmr": 1680,
  "tdee": 2600,
  "daily_calories": 2100,
  "protein_target": 160,
  "carbs_target": 210,
  "fat_target": 70,
  "updated_at": "2026-01-27T10:00:00Z"
}
```

### POST /api/v1/profiles
Créer un profil nutritionnel (onboarding).

### PUT /api/v1/profiles/me
Mettre à jour le profil nutritionnel.

### POST /api/v1/profiles/calculate
Recalculer BMR/TDEE avec nouveaux paramètres.

---

## 📸 Vision

**Module** : `vision.py` (65KB - module le plus volumineux)

### POST /api/v1/vision/analyze
Analyser une photo de repas avec IA multi-modèles (BLIP-2 + LLaVA).

**Request:**
```json
{
  "image": "base64_encoded_image",
  "meal_type": "lunch"
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "meal_type": "lunch",
  "detected_items": [
    {
      "id": 1,
      "name": "poulet grillé",
      "quantity": "150",
      "unit": "g",
      "calories": 248,
      "protein": 46.5,
      "carbs": 0,
      "fat": 5.4,
      "confidence": 0.87
    }
  ],
  "total_calories": 450,
  "total_protein": 55,
  "total_carbs": 30,
  "total_fat": 12,
  "confidence_score": 0.82,
  "image_url": "https://...",
  "created_at": "2026-01-27T12:30:00Z"
}
```

### GET /api/v1/vision/logs
Récupérer l'historique des analyses photo.

**Query params:**
- `limit` (default: 20)
- `offset` (default: 0)
- `start_date` (optional)
- `end_date` (optional)
- `meal_type` (optional)

### GET /api/v1/vision/logs/{log_id}
Obtenir les détails d'une analyse photo spécifique.

### PATCH /api/v1/vision/logs/{log_id}/items/{item_id}
Modifier un aliment détecté (correction utilisateur).

**Request:**
```json
{
  "name": "pâtes",
  "quantity": "200",
  "unit": "g"
}
```

### DELETE /api/v1/vision/logs/{log_id}/items/{item_id}
Supprimer un aliment d'une analyse.

### DELETE /api/v1/vision/logs/{log_id}
Supprimer une analyse photo complète.

---

## 🍳 Recipes

**Module** : `recipes.py`

### POST /api/v1/recipes/generate
Générer une recette avec IA multi-agents (Mistral + Llama + Mixtral).

**Request:**
```json
{
  "ingredients": ["poulet", "riz", "brocoli"],
  "cuisine_type": "mediterranean",
  "difficulty": "easy",
  "prep_time_max": 30,
  "servings": 2
}
```

**Response:** `200 OK`
```json
{
  "id": 456,
  "name": "Bowl Méditerranéen Protéiné",
  "description": "Un bowl sain et savoureux...",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 2,
  "difficulty": "easy",
  "cuisine_type": "mediterranean",
  "ingredients": [
    {"name": "poulet", "quantity": "300", "unit": "g"},
    {"name": "riz", "quantity": "200", "unit": "g"}
  ],
  "instructions": [
    "1. Cuire le riz...",
    "2. Griller le poulet..."
  ],
  "nutrition_per_serving": {
    "calories": 450,
    "protein": 35,
    "carbs": 40,
    "fat": 18
  },
  "confidence": 0.85,
  "created_at": "2026-01-27T14:00:00Z"
}
```

### GET /api/v1/recipes
Récupérer l'historique des recettes générées.

### GET /api/v1/recipes/{recipe_id}
Obtenir une recette spécifique.

### POST /api/v1/recipes/{recipe_id}/favorite
Ajouter aux favoris.

### DELETE /api/v1/recipes/{recipe_id}/favorite
Retirer des favoris.

### GET /api/v1/recipes/favorites
Liste des recettes favorites.

---

## 🥗 Nutrition

**Module** : `nutrition.py`

### GET /api/v1/nutrition/daily
Obtenir le résumé nutritionnel du jour.

**Response:** `200 OK`
```json
{
  "date": "2026-01-27",
  "target_calories": 2100,
  "consumed_calories": 1850,
  "remaining_calories": 250,
  "protein": {"target": 160, "consumed": 120, "remaining": 40},
  "carbs": {"target": 210, "consumed": 180, "remaining": 30},
  "fat": {"target": 70, "consumed": 60, "remaining": 10},
  "water_ml": 2000,
  "meals_logged": 3
}
```

### GET /api/v1/nutrition/history
Historique nutritionnel sur une période.

### POST /api/v1/nutrition/search
Rechercher des aliments dans la base de données.

---

## 📊 Tracking

**Module** : `tracking.py`

### POST /api/v1/tracking/activity
Enregistrer une activité physique.

**Request:**
```json
{
  "activity_type": "running",
  "duration": 30,
  "intensity": "moderate",
  "distance": 5.0,
  "calories_burned": 350
}
```

### GET /api/v1/tracking/activities
Historique des activités.

### POST /api/v1/tracking/weight
Enregistrer un poids.

**Request:**
```json
{
  "weight": 69.8,
  "body_fat_percentage": 15.2,
  "muscle_mass": 52.3
}
```

### GET /api/v1/tracking/weight
Historique des pesées.

### POST /api/v1/tracking/goals
Créer un objectif (calories, poids, activité).

### GET /api/v1/tracking/goals
Liste des objectifs.

### PUT /api/v1/tracking/goals/{goal_id}
Mettre à jour un objectif.

---

## 📈 Dashboard

**Module** : `dashboard.py` (30KB - module riche en statistiques)

### GET /api/v1/dashboard/stats
Obtenir toutes les statistiques utilisateur.

**Response:** `200 OK`
```json
{
  "overview": {
    "current_streak": 7,
    "total_meals_logged": 145,
    "total_recipes_generated": 32,
    "current_level": 12,
    "xp": 2450
  },
  "nutrition_summary": {...},
  "achievements": [...],
  "recent_activities": [...]
}
```

### GET /api/v1/dashboard/achievements
Liste des achievements débloqués.

### GET /api/v1/dashboard/streaks
Statistiques des streaks (séries).

### GET /api/v1/dashboard/progress
Progression vers les objectifs.

---

## 🤖 Coaching

**Module** : `coaching.py`

### POST /api/v1/coaching/daily-tip
Obtenir le conseil quotidien personnalisé.

**Response:** `200 OK`
```json
{
  "tip": "Vous avez bien progressé cette semaine !...",
  "category": "motivation",
  "date": "2026-01-27"
}
```

### POST /api/v1/coaching/ask
Poser une question au coach IA.

**Request:**
```json
{
  "question": "Comment augmenter mes protéines ?"
}
```

**Response:**
```json
{
  "answer": "Voici plusieurs façons d'augmenter vos protéines...",
  "suggestions": [
    "Ajouter des œufs au petit-déjeuner",
    "Consommer plus de légumineuses"
  ]
}
```

---

## 💳 Subscriptions

**Module** : `subscriptions.py`

### GET /api/v1/subscriptions/status
Obtenir le statut de l'abonnement.

**Response:** `200 OK`
```json
{
  "tier": "premium",
  "status": "active",
  "is_trial": false,
  "trial_ends_at": null,
  "current_period_end": "2026-02-27T15:00:00Z",
  "cancel_at_period_end": false
}
```

### GET /api/v1/subscriptions/usage
Obtenir l'utilisation des limites freemium.

**Response:**
```json
{
  "tier": "free",
  "limits": {
    "vision_analyses": {"limit": 3, "used": 2, "remaining": 1},
    "recipe_generations": {"limit": 2, "used": 1, "remaining": 1},
    "coach_messages": {"limit": 1, "used": 0, "remaining": 1}
  }
}
```

### GET /api/v1/subscriptions/pricing
Obtenir les plans tarifaires.

### POST /api/v1/subscriptions/checkout
Créer une session de paiement Lemon Squeezy.

**Request:**
```json
{
  "variant_id": "1191083",
  "billing_cycle": "monthly"
}
```

**Response:**
```json
{
  "checkout_url": "https://nutriprofile.lemonsqueezy.com/checkout/..."
}
```

### POST /api/v1/subscriptions/cancel
Annuler l'abonnement (fin de période).

---

## 🍽️ Meal Plans

**Module** : `meal_plans.py`

### POST /api/v1/meal-plans/generate
Générer un plan alimentaire hebdomadaire (Feature Pro).

### GET /api/v1/meal-plans
Liste des plans alimentaires.

### GET /api/v1/meal-plans/{plan_id}
Détails d'un plan alimentaire.

---

## 📄 Export

**Module** : `export.py`

### POST /api/v1/export/pdf
Exporter un rapport nutritionnel en PDF (Feature Pro).

**Request:**
```json
{
  "start_date": "2026-01-20",
  "end_date": "2026-01-27",
  "include_meals": true,
  "include_activities": true,
  "include_progress": true
}
```

**Response:** PDF file download

---

## 📱 Barcode

**Module** : `barcode.py`

### POST /api/v1/barcode/scan
Scanner un code-barres produit alimentaire.

**Request:**
```json
{
  "barcode": "3017620425035"
}
```

**Response:**
```json
{
  "product_name": "Nutella",
  "brand": "Ferrero",
  "nutrition": {...}
}
```

---

## 🎤 Voice

**Module** : `voice.py`

### POST /api/v1/voice/log
Enregistrer un repas via commande vocale.

**Request:**
```json
{
  "audio": "base64_encoded_audio",
  "language": "fr"
}
```

---

## 🔗 Webhooks

**Module** : `webhooks.py` (23KB - gestion Lemon Squeezy)

### POST /api/v1/webhooks/lemonsqueezy
Webhook pour les événements Lemon Squeezy.

**Events gérés:**
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_expired`
- `subscription_resumed`

**Sécurité:** Validation signature HMAC-SHA256

---

## 🏥 Health

**Module** : `health.py`

### GET /api/v1/health
Health check pour monitoring Fly.io.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected"
}
```

---

## 🔒 Authentication

Tous les endpoints (sauf `/auth/*`, `/health`, `/webhooks/*`) nécessitent un token JWT:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📊 Rate Limiting

| Endpoint | Limite |
|----------|--------|
| POST /vision/analyze | 10 req/min |
| POST /recipes/generate | 5 req/min |
| POST /coaching/ask | 10 req/min |
| Autres endpoints | 100 req/min |

---

## ❌ Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Token manquant ou invalide |
| 403 | Forbidden - Limite freemium atteinte |
| 404 | Not Found - Ressource introuvable |
| 422 | Unprocessable Entity - Validation échouée |
| 429 | Too Many Requests - Rate limit atteint |
| 500 | Internal Server Error |

**Format d'erreur:**
```json
{
  "detail": "Description de l'erreur",
  "code": "ERROR_CODE",
  "field": "champ_concerné"
}
```

---

## 📝 Notes Techniques

- **API Version** : v1 (versioning dans l'URL)
- **Content-Type** : `application/json`
- **Encoding** : UTF-8
- **Date Format** : ISO 8601 (`2026-01-27T15:00:00Z`)
- **Pagination** : Limit/Offset standard
- **Sorting** : Query param `sort` (ex: `?sort=-created_at`)

---

*Document généré automatiquement par le workflow document-project*
*97 endpoints API documentés*
