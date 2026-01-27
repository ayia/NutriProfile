# Data Models - Backend NutriProfile

**Date de génération** : 2026-01-27
**ORM** : SQLAlchemy 2.0 (async)
**Database** : PostgreSQL
**Nombre de modèles** : 7 modules principaux

---

## 📚 Table des Matières

1. [User](#user) - Utilisateurs et authentification
2. [Profile](#profile) - Profils nutritionnels
3. [Food Log](#food-log) - Journaux alimentaires
4. [Recipe](#recipe) - Recettes générées
5. [Activity](#activity) - Activités physiques et poids
6. [Gamification](#gamification) - Achievements et streaks
7. [Subscription](#subscription) - Abonnements et paiements

---

## 👤 User

**Fichier** : `models/user.py`

### Table: `users`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email de connexion |
| `hashed_password` | VARCHAR(255) | NOT NULL | Mot de passe hashé (bcrypt) |
| `name` | VARCHAR(100) | | Nom complet |
| `is_active` | BOOLEAN | DEFAULT TRUE | Compte actif |
| `preferred_language` | VARCHAR(5) | DEFAULT 'en' | Langue (fr/en/de/es/pt/zh/ar) |
| `subscription_tier` | VARCHAR(20) | DEFAULT 'free' | Tier de base (free/premium/pro) |
| `trial_ends_at` | TIMESTAMP WITH TIME ZONE | | Fin du trial Premium (14 jours) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP WITH TIME ZONE | | Date de mise à jour |

**Relations** :
- `profile` : One-to-One avec Profile
- `food_logs` : One-to-Many avec FoodLog
- `recipes` : One-to-Many avec Recipe
- `activities` : One-to-Many avec ActivityLog
- `weights` : One-to-Many avec WeightLog
- `subscriptions` : One-to-One avec Subscription
- `achievements` : One-to-Many avec Achievement
- `streaks` : One-to-Many avec Streak

---

## 🎯 Profile

**Fichier** : `models/profile.py`

### Table: `profiles`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id), UNIQUE | Utilisateur lié |
| `age` | INTEGER | | Âge |
| `weight` | FLOAT | | Poids (kg) |
| `height` | INTEGER | | Taille (cm) |
| `sex` | VARCHAR(1) | | Sexe (M/F) |
| `activity_level` | VARCHAR(20) | | Niveau d'activité (sedentary, light, moderate, active, very_active) |
| `fitness_goal` | VARCHAR(20) | | Objectif (weight_loss, maintenance, muscle_gain) |
| `diet_type` | VARCHAR(20) | | Type de régime (omnivore, vegetarian, vegan, etc.) |
| `allergies` | JSON | | Liste des allergies |
| `health_conditions` | JSON | | Conditions médicales |
| `medications` | JSON | | Médicaments |
| `bmr` | FLOAT | | Basal Metabolic Rate (calculé) |
| `tdee` | FLOAT | | Total Daily Energy Expenditure (calculé) |
| `daily_calories` | FLOAT | | Calories cibles quotidiennes |
| `protein_target` | FLOAT | | Protéines cibles (g) |
| `carbs_target` | FLOAT | | Glucides cibles (g) |
| `fat_target` | FLOAT | | Lipides cibles (g) |
| `created_at` | TIMESTAMP | | Date de création |
| `updated_at` | TIMESTAMP | | Date de mise à jour |

**Calculs** :
- **BMR (Mifflin-St Jeor)**:
  - Homme: `10 × poids(kg) + 6.25 × taille(cm) - 5 × âge + 5`
  - Femme: `10 × poids(kg) + 6.25 × taille(cm) - 5 × âge - 161`
- **TDEE**: `BMR × activity_factor`
  - Sedentary: 1.2
  - Light: 1.375
  - Moderate: 1.55
  - Active: 1.725
  - Very Active: 1.9
- **Calories ajustées**:
  - Perte de poids: `TDEE × 0.8`
  - Maintien: `TDEE`
  - Prise de masse: `TDEE × 1.1`

---

## 🍽️ Food Log

**Fichier** : `models/food_log.py`

### Table: `food_logs`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `meal_type` | VARCHAR(20) | | breakfast, lunch, dinner, snack |
| `image_url` | VARCHAR(500) | | URL de l'image uploadée |
| `total_calories` | FLOAT | | Calories totales du repas |
| `total_protein` | FLOAT | | Protéines totales (g) |
| `total_carbs` | FLOAT | | Glucides totaux (g) |
| `total_fat` | FLOAT | | Lipides totaux (g) |
| `confidence_score` | FLOAT | | Score de confiance IA (0-1) |
| `created_at` | TIMESTAMP | | Date d'analyse |

**Relations** :
- `items` : One-to-Many avec FoodItem

### Table: `food_items`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `food_log_id` | INTEGER | FOREIGN KEY(food_logs.id) | Log parent |
| `name` | VARCHAR(200) | | Nom de l'aliment |
| `quantity` | VARCHAR(50) | | Quantité (ex: "150") |
| `unit` | VARCHAR(20) | | Unité (g, ml, portion, etc.) |
| `calories` | FLOAT | | Calories estimées |
| `protein` | FLOAT | | Protéines (g) |
| `carbs` | FLOAT | | Glucides (g) |
| `fat` | FLOAT | | Lipides (g) |
| `confidence` | FLOAT | | Score de confiance (0-1) |
| `created_at` | TIMESTAMP | | Date de création |

### Table: `daily_nutrition`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `date` | DATE | UNIQUE(user_id, date) | Date du jour |
| `target_calories` | FLOAT | | Calories cibles |
| `actual_calories` | FLOAT | | Calories consommées |
| `target_protein` | FLOAT | | Protéines cibles |
| `actual_protein` | FLOAT | | Protéines consommées |
| `target_carbs` | FLOAT | | Glucides cibles |
| `actual_carbs` | FLOAT | | Glucides consommés |
| `target_fat` | FLOAT | | Lipides cibles |
| `actual_fat` | FLOAT | | Lipides consommés |
| `water_intake` | INTEGER | | Eau consommée (ml) |

---

## 🍳 Recipe

**Fichier** : `models/recipe.py`

### Table: `recipes`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `name` | VARCHAR(200) | | Nom de la recette |
| `description` | TEXT | | Description |
| `cuisine_type` | VARCHAR(50) | | Type de cuisine |
| `difficulty` | VARCHAR(20) | | easy, medium, hard |
| `prep_time` | INTEGER | | Temps de préparation (min) |
| `cook_time` | INTEGER | | Temps de cuisson (min) |
| `servings` | INTEGER | | Nombre de portions |
| `ingredients` | JSON | | Liste des ingrédients |
| `instructions` | JSON | | Étapes de préparation |
| `calories_per_serving` | FLOAT | | Calories par portion |
| `protein_per_serving` | FLOAT | | Protéines par portion (g) |
| `carbs_per_serving` | FLOAT | | Glucides par portion (g) |
| `fat_per_serving` | FLOAT | | Lipides par portion (g) |
| `confidence_score` | FLOAT | | Score de confiance IA (0-1) |
| `created_at` | TIMESTAMP | | Date de génération |

### Table: `favorite_recipes`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `recipe_id` | INTEGER | FOREIGN KEY(recipes.id) | Recette favorite |
| `created_at` | TIMESTAMP | | Date d'ajout aux favoris |

**Index** : UNIQUE(user_id, recipe_id)

---

## 🏃 Activity

**Fichier** : `models/activity.py`

### Table: `activity_logs`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `activity_type` | VARCHAR(50) | | running, cycling, swimming, etc. |
| `duration` | INTEGER | | Durée (minutes) |
| `intensity` | VARCHAR(20) | | low, moderate, high |
| `distance` | FLOAT | | Distance (km) |
| `calories_burned` | FLOAT | | Calories brûlées |
| `calories_source` | VARCHAR(20) | | manual, calculated, device |
| `heart_rate_avg` | INTEGER | | Fréquence cardiaque moyenne (bpm) |
| `steps` | INTEGER | | Nombre de pas |
| `created_at` | TIMESTAMP | | Date de l'activité |

### Table: `weight_logs`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `weight` | FLOAT | NOT NULL | Poids (kg) |
| `body_fat_percentage` | FLOAT | | % de masse grasse |
| `muscle_mass` | FLOAT | | Masse musculaire (kg) |
| `created_at` | TIMESTAMP | | Date de la pesée |

### Table: `goals`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `goal_type` | VARCHAR(50) | | calories, weight, activity, water |
| `target_value` | FLOAT | | Valeur cible |
| `current_value` | FLOAT | | Valeur actuelle |
| `period` | VARCHAR(20) | | daily, weekly, monthly |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Objectif atteint |
| `created_at` | TIMESTAMP | | Date de création |
| `completed_at` | TIMESTAMP | | Date d'achèvement |

---

## 🏆 Gamification

**Fichier** : `models/gamification.py`

### Table: `achievements`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `achievement_type` | VARCHAR(50) | | Type de badge |
| `unlocked_at` | TIMESTAMP | | Date de déblocage |

**Types d'achievements** (20+ badges) :
- `first_meal` - Premier repas logué
- `week_streak` - 7 jours consécutifs
- `month_streak` - 30 jours consécutifs
- `50_meals` - 50 repas loggués
- `10_recipes` - 10 recettes générées
- `goal_achieved` - Premier objectif atteint
- etc.

### Table: `streaks`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Utilisateur |
| `streak_type` | VARCHAR(50) | | meal_logging, weight_tracking, activity |
| `current_count` | INTEGER | DEFAULT 0 | Nombre de jours consécutifs actuels |
| `longest_count` | INTEGER | DEFAULT 0 | Record de jours consécutifs |
| `last_activity_date` | DATE | | Dernière date d'activité |

### Table: `user_stats`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id), UNIQUE | Utilisateur |
| `xp` | INTEGER | DEFAULT 0 | Points d'expérience |
| `level` | INTEGER | DEFAULT 1 | Niveau (1-50) |
| `total_meals_logged` | INTEGER | DEFAULT 0 | Total repas loggués |
| `total_recipes_generated` | INTEGER | DEFAULT 0 | Total recettes générées |
| `total_activities_logged` | INTEGER | DEFAULT 0 | Total activités loggées |
| `total_weight_logs` | INTEGER | DEFAULT 0 | Total pesées |

**Système XP** :
- 10 XP par repas logué
- 20 XP par recette générée
- 15 XP par activité loggée
- 50 XP par achievement débloqué
- Level = floor(sqrt(XP / 100))

---

## 💳 Subscription

**Fichier** : `models/subscription.py`

### Table: `subscriptions`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identifiant unique |
| `user_id` | INTEGER | FOREIGN KEY(users.id), UNIQUE | Utilisateur |
| `tier` | VARCHAR(20) | NOT NULL | free, premium, pro |
| `status` | VARCHAR(20) | DEFAULT 'active' | active, cancelled, expired, past_due, paused |
| `current_period_start` | TIMESTAMP | | Début de la période actuelle |
| `current_period_end` | TIMESTAMP | | Fin de la période actuelle |
| `cancel_at_period_end` | BOOLEAN | DEFAULT FALSE | Annulation programmée |
| `ls_subscription_id` | VARCHAR(100) | UNIQUE | ID Lemon Squeezy |
| `ls_customer_id` | VARCHAR(100) | | ID client Lemon Squeezy |
| `ls_variant_id` | VARCHAR(100) | | ID variant Lemon Squeezy |
| `ls_order_id` | VARCHAR(100) | | ID commande Lemon Squeezy |
| `created_at` | TIMESTAMP | | Date de création |
| `updated_at` | TIMESTAMP | | Date de mise à jour |

**Logique Tier Effectif** :
1. Si `subscription.status == 'active'` et `subscription.tier in ['premium', 'pro']` → utiliser `subscription.tier`
2. Sinon si `user.trial_ends_at > now()` → retourner "premium"
3. Sinon → retourner `user.subscription_tier` (défaut: "free")

---

## 📊 Schéma de Base de Données (ERD)

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│  profiles   │    │ food_logs   │    │  recipes    │    │subscriptions │
└─────────────┘    └──────┬──────┘    └─────────────┘    └──────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ food_items  │
                   └─────────────┘

       ├──────────────────┬──────────────────┬──────────────────┐
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌──────────────┐   ┌─────────────┐   ┌──────────────┐  ┌─────────────┐
│activity_logs │   │weight_logs  │   │achievements  │  │   streaks   │
└──────────────┘   └─────────────┘   └──────────────┘  └─────────────┘

       │
       ▼
┌─────────────┐
│ user_stats  │
└─────────────┘
```

---

## 🔄 Migrations Alembic

Les migrations de schéma sont gérées avec **Alembic 1.13.1**.

**Fichiers de migration** : `backend/alembic/versions/`

**Principales migrations** :
1. `initial_schema` - Création tables de base (user, profile, food_log)
2. `add_recipes` - Ajout table recipes
3. `add_activity_tracking` - Ajout tables activity_logs, weight_logs, goals
4. `add_gamification` - Ajout tables achievements, streaks, user_stats
5. `add_subscriptions` - Ajout table subscriptions
6. `add_trial_field` - Ajout champ trial_ends_at à users

**Commandes Alembic** :
```bash
# Appliquer les migrations
alembic upgrade head

# Créer une nouvelle migration
alembic revision --autogenerate -m "description"

# Revenir à une version précédente
alembic downgrade -1
```

---

## 🔐 Sécurité & Performance

### Indexes
- `users.email` - UNIQUE index pour login rapide
- `food_logs.user_id, created_at` - Index composite pour historique
- `daily_nutrition.user_id, date` - UNIQUE index
- `achievements.user_id` - Index pour récupération rapide
- `subscriptions.ls_subscription_id` - UNIQUE index

### Constraints
- Foreign Keys avec `ON DELETE CASCADE` pour cleanup automatique
- NOT NULL sur champs critiques (email, password, tier)
- CHECK constraints sur valeurs (tier IN ('free', 'premium', 'pro'))
- UNIQUE constraints pour éviter duplications

### Async Operations
- Toutes les opérations utilisent SQLAlchemy 2.0 async (`async_sessionmaker`)
- Driver asyncpg pour PostgreSQL
- Connection pooling configuré (min: 5, max: 20)

---

*Document généré automatiquement par le workflow document-project*
*7 modules de modèles, 16+ tables documentées*
