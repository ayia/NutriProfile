# API NutriProfile

Base URL: `https://nutriprofile-api.fly.dev/api/v1`

## Authentification

### POST /auth/register
Créer un nouveau compte utilisateur.

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
  "created_at": "2024-01-15T10:00:00Z"
}
```

### POST /auth/login
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
  "expires_in": 3600
}
```

### POST /auth/refresh
Rafraîchir le token JWT.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

## Profils

### GET /profiles/me
Obtenir le profil de l'utilisateur connecté.

**Headers:** `Authorization: Bearer <token>`

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
  "dietary_preferences": {
    "diet_type": "omnivore",
    "excluded_foods": ["shellfish"]
  },
  "allergies": ["peanuts", "gluten"],
  "health_goals": ["weight_loss", "muscle_gain"],
  "medical_conditions": [],
  "medications": [],
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### POST /profiles
Créer un profil nutritionnel.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "age": 30,
  "weight": 70.5,
  "height": 175,
  "sex": "M",
  "activity_level": "moderate",
  "dietary_preferences": {
    "diet_type": "omnivore",
    "excluded_foods": ["shellfish"]
  },
  "allergies": ["peanuts"],
  "health_goals": ["weight_loss"]
}
```

**Response:** `201 Created`

### PUT /profiles/me
Mettre à jour le profil.

**Headers:** `Authorization: Bearer <token>`

**Request:** (champs à mettre à jour)
```json
{
  "weight": 69.0,
  "health_goals": ["maintenance"]
}
```

**Response:** `200 OK`

---

## Recommandations

### POST /recommendations
Générer des recommandations nutritionnelles personnalisées.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "duration_days": 7,
  "preferences": {
    "meal_complexity": "simple",
    "budget": "medium",
    "cooking_time_max": 30
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "rec_abc123",
  "profile_id": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "confidence_score": 0.87,
  "agent_scores": {
    "analysis": 0.92,
    "nutrition": 0.85,
    "verification": 0.88
  },
  "analysis": {
    "bmr": 1680,
    "tdee": 2600,
    "target_calories": 2100,
    "macros": {
      "protein_g": 160,
      "carbs_g": 210,
      "fat_g": 70
    },
    "identified_deficiencies": ["vitamin_d", "omega3"]
  },
  "nutrition_plan": {
    "days": [
      {
        "date": "2024-01-15",
        "meals": {
          "breakfast": {
            "name": "Omelette aux légumes",
            "calories": 450,
            "macros": {"protein": 25, "carbs": 10, "fat": 35},
            "ingredients": ["eggs", "spinach", "tomatoes", "cheese"],
            "prep_time_min": 15
          },
          "lunch": {...},
          "dinner": {...},
          "snacks": [...]
        },
        "total_calories": 2100,
        "total_macros": {...}
      }
    ],
    "shopping_list": {
      "proteins": ["eggs", "chicken breast", "salmon"],
      "vegetables": ["spinach", "broccoli", "tomatoes"],
      "grains": ["rice", "oats"],
      "dairy": ["greek yogurt", "cheese"]
    }
  },
  "warnings": [],
  "adjustments_made": []
}
```

### GET /recommendations
Historique des recommandations.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
- `limit` (default: 10)
- `offset` (default: 0)

**Response:** `200 OK`
```json
{
  "items": [...],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### GET /recommendations/{id}
Obtenir une recommandation spécifique.

**Response:** `200 OK`

---

## Suivi Quotidien

### POST /tracking
Enregistrer les repas du jour.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "date": "2024-01-15",
  "meals": [
    {
      "meal_type": "breakfast",
      "foods": [
        {"name": "Omelette", "calories": 300, "portion": "1 serving"},
        {"name": "Toast", "calories": 150, "portion": "2 slices"}
      ]
    },
    {
      "meal_type": "lunch",
      "foods": [...]
    }
  ],
  "water_ml": 2000,
  "notes": "Journée chargée, peu de temps pour cuisiner"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "date": "2024-01-15",
  "total_calories": 1850,
  "target_calories": 2100,
  "calories_remaining": 250,
  "macros_consumed": {
    "protein_g": 120,
    "carbs_g": 180,
    "fat_g": 60
  },
  "adherence_score": 0.88
}
```

### GET /tracking
Historique de suivi.

**Query params:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:** `200 OK`
```json
{
  "entries": [...],
  "summary": {
    "avg_calories": 2050,
    "avg_adherence": 0.85,
    "days_tracked": 14
  }
}
```

### GET /tracking/{date}
Obtenir le suivi d'une date spécifique.

---

## Health Check

### GET /health
Vérifier l'état du service.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected",
  "agents": {
    "profile_analyzer": "ready",
    "nutritionist": "ready",
    "verifier": "ready"
  }
}
```

---

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Token manquant ou invalide |
| 403 | Forbidden - Accès non autorisé |
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

## Rate Limiting

- 100 requêtes par minute par utilisateur
- 10 requêtes par minute pour `/recommendations` (coûteux en LLM)

Headers de réponse:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```
