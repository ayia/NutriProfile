# Système Multi-Agents NutriProfile

## Vue d'ensemble

NutriProfile utilise une architecture multi-agents avec consensus pour garantir des résultats précis et fiables. Chaque agent utilise plusieurs modèles IA et un validateur combine les résultats.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATEUR                               │
│                                                                  │
│  • Reçoit les requêtes des endpoints API                        │
│  • Sélectionne le(s) agent(s) approprié(s)                      │
│  • Lance les traitements en parallèle                           │
│  • Coordonne la validation consensus                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   VISION    │    │   RECIPE    │    │   COACH     │
│   AGENT     │    │   AGENT     │    │   AGENT     │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ BLIP-2      │    │ Mistral     │    │ Mistral     │
│ LLaVA       │    │ Llama       │    │ Llama       │
│             │    │ Mixtral     │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │ CONSENSUS VALIDATOR │
              │                     │
              │ • Compare outputs   │
              │ • Fusionne résultats│
              │ • Score confiance   │
              └─────────────────────┘
```

## Agents Implémentés

### Agent Vision (`agents/vision.py`)

**Rôle**: Analyse les photos de repas pour détecter les aliments et estimer les valeurs nutritionnelles.

**Modèles utilisés**:
- BLIP-2 (Salesforce) - Détection d'objets et description
- LLaVA - Vision-Language model

**Processus**:
```python
1. Réception image base64
2. Envoi parallèle à BLIP-2 et LLaVA
3. Chaque modèle retourne liste d'aliments détectés
4. Consensus: intersection des détections (aliments vus par les 2 modèles)
5. Estimation nutritionnelle par aliment
6. Calcul portion basé sur proportion dans l'image
7. Score de confiance = moyenne des scores individuels
```

**Output**:
```json
{
  "detected_items": [
    {
      "name": "poulet grillé",
      "portion_grams": 150,
      "calories": 248,
      "protein": 46.5,
      "carbs": 0,
      "fat": 5.4,
      "confidence": 0.87
    }
  ],
  "total_calories": 450,
  "overall_confidence": 0.82
}
```

**Fallback**: Si API indisponible, retourne erreur avec suggestion de saisie manuelle.

---

### Agent Recettes (`agents/recipe.py`)

**Rôle**: Génère des recettes personnalisées basées sur les ingrédients disponibles et le profil utilisateur.

**Modèles utilisés**:
- Mistral-7B-Instruct
- Llama-2-13B-chat
- Mixtral-8x7B-Instruct

**Contexte utilisé**:
- Ingrédients disponibles
- Allergies et restrictions alimentaires
- Objectifs nutritionnels (perte de poids, prise de masse...)
- Historique des repas récents
- Préférences alimentaires

**Processus**:
```python
1. Chargement profil utilisateur
2. Construction du prompt avec contexte
3. Envoi à 2-3 modèles en parallèle
4. Consensus: fusion des recettes similaires
5. Calcul moyennes (temps préparation, portions)
6. Estimation nutrition par portion
7. Sauvegarde dans RecipeHistory
```

**Output**:
```json
{
  "name": "Bowl Méditerranéen Protéiné",
  "description": "Un bowl sain et savoureux...",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 2,
  "ingredients": [...],
  "instructions": [...],
  "nutrition_per_serving": {
    "calories": 450,
    "protein": 35,
    "carbs": 40,
    "fat": 18
  },
  "confidence": 0.85
}
```

---

### Agent Coach (`agents/coach.py`)

**Rôle**: Fournit des conseils nutritionnels personnalisés et de la motivation.

**Modèles utilisés**:
- Mistral-7B-Instruct (conversationnel)
- Llama-2-chat

**Types de conseils**:
- Conseil quotidien basé sur les repas de la veille
- Tips pour atteindre les objectifs
- Suggestions d'amélioration
- Messages de motivation

**Contexte utilisé**:
- Profil nutritionnel complet
- Historique repas (7 derniers jours)
- Activité physique
- Progression vers objectifs
- Streaks actuels

**Output**:
```json
{
  "daily_tip": "Vous avez bien progressé cette semaine ! ...",
  "suggestions": [
    "Ajoutez plus de légumes verts à vos repas",
    "Pensez à vous hydrater davantage"
  ],
  "motivation_level": "high",
  "confidence": 0.78
}
```

**Fallback**: Messages pré-définis si API indisponible.

---

### Agent Profilage (`agents/profiling.py`)

**Rôle**: Analyse le questionnaire utilisateur et calcule les besoins nutritionnels.

**Calculs effectués**:
- BMR (Basal Metabolic Rate) - Formule Mifflin-St Jeor
- TDEE (Total Daily Energy Expenditure)
- Répartition macronutriments selon objectif

**Formule Mifflin-St Jeor**:
```
Homme: BMR = 10×poids(kg) + 6.25×taille(cm) - 5×âge + 5
Femme: BMR = 10×poids(kg) + 6.25×taille(cm) - 5×âge - 161

TDEE = BMR × facteur_activité
- Sédentaire: 1.2
- Légèrement actif: 1.375
- Modérément actif: 1.55
- Très actif: 1.725
- Extrêmement actif: 1.9
```

**Ajustement selon objectif**:
```
- Perte de poids: TDEE × 0.8 (déficit 20%)
- Maintien: TDEE
- Prise de masse: TDEE × 1.1 (surplus 10%)
```

---

## Validateur Consensus (`agents/consensus.py`)

**Rôle**: Compare et fusionne les outputs de plusieurs modèles pour garantir la fiabilité.

### Stratégies par type de tâche

**Vision (détection aliments)**:
```python
# Intersection des détections
# Un aliment est retenu s'il est détecté par au moins 2 modèles
validated_items = []
for item in all_detections:
    if count_detections(item) >= 2:
        validated_items.append({
            "item": item,
            "quantity": average(quantities),
            "confidence": min(confidences)  # conservative
        })
```

**Recettes**:
```python
# Fusion des recettes similaires
# Moyenne des temps, union des ingrédients
merged_recipe = {
    "name": best_name,
    "prep_time": average(prep_times),
    "cook_time": average(cook_times),
    "ingredients": union(ingredients),
    "instructions": merge_instructions()
}
```

**Nutrition**:
```python
# Moyenne pondérée sans outliers
values = [model1_value, model2_value, model3_value]
# Supprimer valeurs > 2 écarts-types
filtered = remove_outliers(values)
result = weighted_average(filtered)
```

### Score de Confiance

Chaque réponse inclut un score de confiance (0-1):
- **> 0.8**: Haute confiance, résultat fiable
- **0.6-0.8**: Confiance moyenne, vérification recommandée
- **< 0.6**: Faible confiance, correction utilisateur suggérée

---

## Gestion des Erreurs

### Fallbacks

Chaque agent a un mécanisme de fallback:

```python
class BaseAgent:
    async def execute_with_fallback(self, prompt):
        try:
            result = await self.call_primary_model(prompt)
            if result.confidence > 0.5:
                return result
        except APIError:
            pass

        # Fallback: modèle secondaire
        try:
            return await self.call_fallback_model(prompt)
        except:
            # Fallback ultime: réponse pré-définie
            return self.get_default_response()
```

### Rate Limiting

- Limite de requêtes par utilisateur par minute
- Queue de traitement pour pics de charge
- Cache des résultats identiques (30 min)

---

## Intégration avec le Système Freemium

### Limites par Tier

| Action | Gratuit | Premium | Pro |
|--------|---------|---------|-----|
| Analyses photo/jour | 3 | Illimité | Illimité |
| Recettes/semaine | 2 | 10 | Illimité |
| Conseils coach/jour | 1 | 5 | Illimité |

### Vérification des limites

```python
# Dans chaque endpoint utilisant un agent
async def check_usage_limit(user_id: int, action: str) -> bool:
    user = await get_user(user_id)
    usage = await get_daily_usage(user_id, action)

    limits = {
        "free": {"vision": 3, "recipe": 2, "coach": 1},
        "premium": {"vision": -1, "recipe": 10, "coach": 5},
        "pro": {"vision": -1, "recipe": -1, "coach": -1}
    }

    limit = limits[user.subscription_tier][action]
    return limit == -1 or usage < limit
```

---

## Configuration

### Variables d'environnement

```bash
HUGGINGFACE_TOKEN=hf_xxx
HF_MODEL_VISION_PRIMARY=Salesforce/blip2-opt-2.7b
HF_MODEL_VISION_FALLBACK=llava-hf/llava-1.5-7b-hf
HF_MODEL_TEXT_PRIMARY=mistralai/Mistral-7B-Instruct-v0.2
HF_MODEL_TEXT_FALLBACK=meta-llama/Llama-2-13b-chat-hf
```

### Timeouts

```python
AGENT_TIMEOUT_SECONDS = 30
CONSENSUS_TIMEOUT_SECONDS = 5
MAX_RETRIES = 2
```
