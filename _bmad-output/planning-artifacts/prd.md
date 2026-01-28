---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys']
inputDocuments:
  - 'market-nutrition-fitness-apps-research-2026-01-27.md'
  - 'technical-nutriprofile-features-research-2026-01-27.md'
  - 'user-provided-context.md'
  - 'ARCHITECTURE.md'
  - 'technology-stack.md'
  - 'API.md'
  - 'AGENTS.md'
workflowType: 'prd'
briefCount: 0
researchCount: 2
brainstormingCount: 0
projectDocsCount: 5
classification:
  projectType: 'web_app'
  domain: 'healthcare'
  complexity: 'high'
  projectContext: 'brownfield'
  roadmapPhases: 5
constraints:
  budgetMonthly: 30
  budgetCurrency: 'USD'
  llmProvider: 'HuggingFace'
  llmExclusive: true
architectureDecisions:
  - id: 'ADR-001'
    title: 'Stratégie LLM - Modèles Uniques Optimisés'
    decision: 'Abandon consensus multi-modèles au profit de modèles uniques par feature'
    rationale: 'Budget constraint absolue - consensus multi-modèles = 60-300 USD/mois vs 1.5-2 USD/mois avec modèles uniques'
    costImpact: '-95% coûts LLM'
    models:
      vision: 'BLIP-2 seul (abandon LLaVA)'
      recipe: 'Mistral-7B seul (abandon Llama/Mixtral)'
      coach: 'TinyLlama-1.1B lightweight'
      mealPlanning: 'Mistral-7B avec templates'
    tradeoffs:
      pros: ['Coût 1.5-2 USD/mois', 'Latence -50%', 'Code -60% lignes']
      cons: ['Précision 80-85% vs 90-95%']
    mitigations: ['EditFoodItemModal correction manuelle', 'User ratings validation', 'A/B testing qualité']
  - id: 'ADR-002'
    title: 'Bibliothèque PDF Export - ReportLab'
    decision: 'ReportLab génération programmatique (Phase 2)'
    rationale: 'Rapports nutrition data-heavy, contrôle pixel-perfect, coût 0 USD, pas de dépendance navigateur'
    costImpact: '0 USD infrastructure'
    alternativesRejected: ['WeasyPrint (moins contrôle layouts)', 'Playwright (+5 USD/mois + complexité)']
    developmentImpact: '+3-4 semaines learning curve'
  - id: 'ADR-003'
    title: 'Wearables Integration - APIs Directes'
    decision: 'Health Connect (Android) + Apple HealthKit (iOS) directement (Phase 3)'
    rationale: 'Google Fit DEPRECATED 2026, Terra API 50-99 USD/mois dépasse budget, APIs directes 0 USD + contrôle GDPR'
    costImpact: '+1-2 USD/mois bandwidth'
    architecture: 'Dual integration iOS/Android avec normalisation serveur'
    developmentImpact: '+6-8 semaines'
    migration: 'Communication users Android Q2 2026'
  - id: 'ADR-004'
    title: 'Meal Planning Architecture - Templates + LLM'
    decision: 'Approche hybride 10 templates pré-définis + personnalisation LLM (Phase 4)'
    rationale: 'Full LLM = 150 USD/mois pour 100 users dépasse budget, templates+LLM = 1 USD/mois'
    costImpact: '1 USD/mois (200 plans × 0.005 USD)'
    templates: ['mediterranean', 'keto', 'vegan', 'high_protein', 'low_carb', 'paleo', 'vegetarian', 'balanced', 'athlete', 'diabetes_friendly']
    alternativesRejected: ['Full LLM Generation (150 USD/mois)', 'Rule-Based (pas assez flexible)']
    developmentImpact: '+8-12 semaines'
  - id: 'ADR-005'
    title: 'Caching Strategy - Redis Obligatoire'
    decision: 'Redis caching avec TTL par feature'
    rationale: 'Hit rate 40%+ réduit coûts LLM, latence -70%, scalabilité future'
    costImpact: '+3 USD/mois Redis, -1 USD/mois LLM via cache hits'
    infrastructure: 'Fly.io Redis 256MB, éviction LRU'
    cachingStrategy:
      recipes:
        ttl: '30 jours'
        hitRate: '40-60%'
      mealPlans:
        ttl: '7 jours'
        hitRate: '30-50%'
      coachTips:
        ttl: '24h'
        hitRate: '20-40%'
      visionEmbeddings:
        ttl: '90 jours'
        hitRate: '10-20%'
budgetBreakdown:
  llmHuggingFace: '1.5-2 USD/mois'
  flyioBackend: '5 USD/mois'
  flyioPostgres: '2 USD/mois'
  flyioRedis: '3 USD/mois'
  cloudflarePages: '0 USD/mois'
  bandwidth: '3-5 USD/mois'
  contingency: '5-8 USD/mois'
  totalEstimated: '19.5-25 USD/mois'
  marginUnderBudget: '5-10.5 USD/mois'
tierLimits:
  free:
    visionAnalysesPerDay: 2
    recipesPerWeek: 1
    coachTipsPerDay: 1
    mealPlansPerMonth: 0
  premium:
    visionAnalysesPerDay: 10
    recipesPerWeek: 5
    coachTipsPerDay: 3
    mealPlansPerMonth: 0
  pro:
    visionAnalysesPerDay: 20
    recipesPerWeek: 10
    coachTipsPerDay: 5
    mealPlansPerMonth: 2
---

# Product Requirements Document - NutriProfile

**Author:** Badre
**Date:** 2026-01-28

## Success Criteria

### User Success

**Moment "Aha!" - L'utilisateur réalise que NutriProfile fonctionne vraiment :**

1. **Première Détection Réussie (Instant Magique)**
   - L'IA reconnaît correctement les aliments de sa photo repas **dès la 1ère utilisation**
   - Résultats nutrition affichés en **< 30 secondes à 5 minutes** maximum
   - L'utilisateur peut **corriger manuellement** via EditFoodItemModal si nécessaire
   - **Métrique de succès** : ≥ 70% des nouvelles inscriptions font une analyse photo dans les 24h

2. **Insights Visuels Transformateurs**
   - L'utilisateur **comprend visuellement** ses habitudes alimentaires via graphiques nutrition (calories, macros, tendances)
   - Visualise clairement ses progrès vers objectifs (perte/gain poids, rééquilibrage macros)
   - **Métrique de succès** : ≥ 50% des utilisateurs actifs consultent dashboard statistiques hebdomadairement

3. **Engagement Durable - Streak 30 Jours**
   - L'utilisateur maintient un **streak de 30 jours consécutifs** de logging repas/activité
   - Gamification (badges, XP, niveaux) renforce l'habitude quotidienne
   - **Métrique de succès** : ≥ 20% des utilisateurs actifs atteignent streak 30 jours (400 users sur 2000)

**Qualité Expérience Utilisateur :**

- **Précision IA Vision** : ≥ 80-85% des détections correctes (BLIP-2 seul avec correction manuelle)
- **Temps de Log Repas** : < 30 secondes (upload photo) à < 5 minutes (résultats + édition)
- **Simplicité** : Max 2 clics pour logger un repas (photo → résultats → enregistrer)
- **Rétention Post-Trial** : ≥ 30% des utilisateurs convertissent ou restent actifs après 14 jours trial Premium

### Business Success

**Objectifs Utilisateurs & Revenus (Fin Avril 2026) :**

1. **Base Utilisateurs Actifs**
   - **2000 utilisateurs actifs mensuels** (MAU - Monthly Active Users)
   - Définition "actif" : Au moins 1 action (log repas, recette, analyse photo) par mois
   - Croissance : +400 nouveaux utilisateurs/mois en moyenne (février-avril)

2. **Conversion & Monétisation**
   - **15% taux de conversion** Free → Premium/Pro = **300 utilisateurs payants**
   - **Mix tier payant** : 40% Premium (5€) + 60% Pro (10€) = moyenne 8€/user payant
   - **MRR : 3000€/mois** fin avril 2026
     - 120 Premium × 5€ = 600€
     - 180 Pro × 10€ = 1800€
     - Trial actifs contribuant ~600€ supplémentaires
   - **ARR projeté** : 36,000€/an (Annual Recurring Revenue)

3. **Rétention & Engagement**
   - **30% rétention post-trial** : 30% des utilisateurs ayant terminé trial 14 jours convertissent en payant ou restent Free actifs
   - **Churn mensuel** : < 5% des abonnés payants (industrie SaaS B2C = 5-10%)
   - **Lifetime Value (LTV)** : 8€/mois × 12 mois rétention moyenne = 96€ par utilisateur payant
   - **CAC (Cost Acquisition Client)** : < 20€ via marketing organique (SEO francophone, bouche-à-oreille)

4. **Métriques d'Engagement Clés**

   **Avec 2000 utilisateurs actifs :**

   | Métrique | Calcul | Valeur Cible |
   |----------|--------|--------------|
   | **Streak 30 jours** | 20% des actifs | **400 utilisateurs** |
   | **Recettes générées/mois** | 5/semaine × 300 payants × 4 semaines | **6000 recettes/mois** |
   | **Plans alimentaires créés/mois** | 2/mois × 180 Pro | **360 plans/mois** (Phase 4) |
   | **Vision analyses/mois** | 10/jour × 30 jours × 300 payants | **90,000 analyses/mois** |
   | **Wearables syncs actifs** | 30% des payants utilisent | **90 utilisateurs** (Phase 3) |
   | **PDF exports/mois** | 1/mois × 180 Pro | **180 rapports/mois** (Phase 2) |

**Indicateurs de Santé Produit :**

- **NPS (Net Promoter Score)** : ≥ 40 (indicateur satisfaction utilisateur)
- **Session duration moyenne** : ≥ 3 minutes/session (engagement actif)
- **DAU/MAU ratio** : ≥ 30% (2000 MAU × 30% = 600 utilisateurs quotidiens)
- **Feature adoption** :
  - Vision AI : 80% des utilisateurs actifs
  - Recettes IA : 50% des utilisateurs actifs
  - Coach IA : 40% des utilisateurs actifs
  - Wearables : 30% des utilisateurs actifs (post-Phase 3)

### Technical Success

**Performance & Fiabilité :**

1. **Budget Infrastructure ≤ 30 USD/mois**
   - LLM Hugging Face : 1.5-2 USD/mois
   - Fly.io Backend + DB + Redis : 10 USD/mois
   - Bandwidth : 3-5 USD/mois (ajustable avec croissance 2000 users)
   - Contingence : 5-10 USD/mois
   - **Total : 19.5-27 USD/mois** ✅ Sous budget avec marge

2. **Contrainte LLM 100% Hugging Face**
   - **Aucune API tierce** (OpenAI, Anthropic, Cohere interdites)
   - Tous modèles via HF Inference API :
     - Vision : BLIP-2
     - Recipe : Mistral-7B
     - Coach : TinyLlama-1.1B
     - Meal Planning : Mistral-7B + templates

3. **Qualité & Précision IA**
   - **Vision AI précision** : ≥ 80-85% détections correctes
   - **Recipe AI satisfaction** : ≥ 4/5 étoiles notation utilisateur moyenne
   - **Coach AI pertinence** : ≥ 70% tips marqués "utiles" par utilisateurs
   - **Meal Plan satisfaction** : ≥ 4.2/5 étoiles (templates personnalisés)

4. **Performance Technique**
   - **Latence API** :
     - Vision analyse : < 5 secondes (90th percentile)
     - Recipe generation : < 10 secondes
     - Coach tips : < 2 secondes (cache 40%+)
   - **Uptime** : ≥ 99.5% (tolérance 3.6h downtime/mois)
   - **Cache hit rate** : ≥ 40% (Redis optimisation)

5. **Qualité Code & Tests**
   - **Test coverage** : ≥ 80% (statements/functions/lines)
   - **CI/CD** : Pipeline automatisé deploy < 10 minutes
   - **Zero critical bugs** en production
   - **Security audit** : Aucune vulnérabilité OWASP Top 10

6. **Scalabilité avec Croissance**
   - Architecture prête pour **10,000 utilisateurs** sans refactoring majeur
   - Database queries optimisées : < 100ms (95th percentile)
   - Horizontal scaling Fly.io si dépassement 2000 users

**Compliance & Sécurité (Domaine Healthcare) :**

- **RGPD compliance** : Données santé catégorie spéciale protégées
- **Data encryption** : At rest (DB) + in transit (HTTPS)
- **User consent** : Opt-in explicite pour sync wearables
- **Data portability** : Export données utilisateur < 48h
- **Right to erasure** : Suppression compte + données < 30 jours

### Measurable Outcomes

**Indicateurs Quantifiables de Succès (Fin Avril 2026) :**

| Catégorie | Métrique | Valeur Cible | Statut Actuel |
|-----------|----------|--------------|---------------|
| **Utilisateurs** | MAU (Monthly Active Users) | 2000 | À définir |
| | Nouveaux inscrits/mois | 400 | À définir |
| | Utilisateurs payants | 300 | À définir |
| **Revenus** | MRR (Monthly Recurring Revenue) | 3000€ | À définir |
| | ARR (Annual Recurring Revenue) | 36,000€ | À définir |
| | ARPU (Average Revenue Per User payant) | 10€ | À définir |
| **Conversion** | Taux conversion Free → Payant | 15% | À définir |
| | Rétention post-trial 14 jours | 30% | À définir |
| | Churn mensuel | < 5% | À définir |
| **Engagement** | Streak 30 jours actifs | 400 users (20%) | À définir |
| | Session duration moyenne | ≥ 3 min | À définir |
| | DAU/MAU ratio | ≥ 30% | À définir |
| **Qualité IA** | Vision AI précision | ≥ 80-85% | 80-85% (BLIP-2) |
| | Recipe rating moyen | ≥ 4/5 ⭐ | À mesurer |
| | Temps log repas moyen | < 2 min | À mesurer |
| **Technique** | Budget infrastructure/mois | ≤ 30 USD | 19.5-25 USD ✅ |
| | Uptime | ≥ 99.5% | À mesurer |
| | Test coverage | ≥ 80% | À implémenter |
| **Features** | Vision AI adoption | 80% users | À mesurer |
| | Recettes générées/mois | 6000 | À mesurer |
| | Plans alimentaires/mois | 360 (Phase 4) | N/A |
| | PDF exports/mois | 180 (Phase 2) | N/A |
| | Wearables syncs actifs | 90 (Phase 3) | N/A |

## Product Scope

### MVP - Minimum Viable Product (Phases 1-3 Complètes)

**Définition MVP** : Features essentielles pour prouver le concept et générer revenus initiaux.

**Phase 1 : Foundation Solidification (Semaines 1-3)**

- **CI/CD Pipeline** : GitHub Actions deploy automatique Fly.io + Cloudflare
- **Observability Basique** : Logging structuré (Structlog), health checks, alertes uptime
- **Security Audit** : Fix vulnérabilités OWASP Top 10, authentification JWT sécurisée
- **Database Optimization** : Indexes critiques, queries < 100ms
- **Redis Caching** : Implémentation cache LLM (recipes, tips, plans)
- **Monitoring Budget** : Dashboard coûts temps réel, alertes 20/25/28 USD

**Phase 2 : PDF Export - Rapports Nutrition (Semaines 4-4.5)**

- **ReportLab Integration** : Génération programmatique PDF côté serveur
- **Rapports 30 Jours** : Graphiques nutrition (calories, macros, tendances)
- **Tableaux Détaillés** : Repas par jour, analyse macros, progress tracking
- **Endpoint `/export-pdf`** : Tier Pro uniquement, limite 1 PDF/mois par user
- **Templates PDF** : Design professionnel nutrition-focused
- **Download sécurisé** : S3/Cloudflare R2 stockage temporaire 24h

**Phase 3 : Wearables Integration (Semaines 5-7)**

- **Health Connect (Android)** : OAuth + sync activité, calories brûlées, steps, heart rate
- **Apple HealthKit (iOS)** : Native bridge, sync workouts, nutrition data
- **Normalisation Données** : Backend unifie formats iOS/Android
- **Auto-sync** : Quotidien ou manuel, rafraîchissement incremental
- **Dashboard Wearables** : Visualisation activité physique, calories in vs out
- **Migration Google Fit** : Communication utilisateurs Android, guide migration Q2 2026

**Critères de Succès MVP :**

- ✅ Toutes features Phases 1-3 déployées en production
- ✅ 90% utilisateurs payants utilisent au moins 1 nouvelle feature (PDF OU wearables)
- ✅ Aucun bug critique post-déploiement
- ✅ Budget respecté ≤ 30 USD/mois
- ✅ MRR ≥ 1500€ (50% objectif final) fin Phase 3

### Growth Features (Post-MVP - Phase 4)

**Phase 4 : Meal Planning IA - Plans Alimentaires Personnalisés (Semaines 8-10)**

**Ce qui rend NutriProfile compétitif face à MyFitnessPal et concurrents :**

- **10 Templates Plans Alimentaires** :
  - Mediterranean, Keto, Vegan, High Protein, Low Carb
  - Paleo, Vegetarian, Balanced, Athlete, Diabetes-Friendly

- **Personnalisation LLM (Mistral-7B)** :
  - Ajuste templates selon allergies utilisateur
  - Respecte excluded foods et préférences
  - Adapte portions selon calories target (BMR/TDEE)

- **Architecture Hybride** :
  - Templates pré-définis (qualité garantie, nutritionnellement équilibrés)
  - LLM personnalise seulement contraintes (coût 1 USD/mois vs 150 USD full génération)

- **Features Plans** :
  - 7 jours de repas (petit-déj, déjeuner, dîner, snacks)
  - Liste courses automatique par catégorie
  - Calcul nutrition complet par jour
  - Export PDF du plan (intégration Phase 2)

- **Tier Pro Exclusif** : 2 plans/mois maximum par utilisateur

**Critères de Succès Phase 4 :**

- ✅ 180 utilisateurs Pro créent au moins 1 plan/mois (100% adoption Pro)
- ✅ Rating moyen plans ≥ 4.2/5 étoiles
- ✅ 50% utilisateurs Pro utilisent liste courses générée
- ✅ Coût LLM meal planning ≤ 1 USD/mois
- ✅ MRR atteint 2500€ (83% objectif final)

### Vision (Future - Phase 5 & Au-delà)

**Phase 5 : Observability Enhancement - Production Monitoring (Semaines 10.5-11.5)**

**Monitoring Avancé pour Scale :**

- **OpenTelemetry Integration** :
  - Traces distribuées (API calls, LLM requests, DB queries)
  - Métriques custom (conversions, engagement, feature usage)
  - Logs centralisés avec correlation IDs

- **Grafana Cloud** :
  - Dashboards temps réel (utilisateurs actifs, revenus MRR, budget infra)
  - Alertes business (churn spike, conversion drop, budget overshoot)
  - SLOs tracking (uptime 99.5%, latence p95, error rate)

- **AIOps - Détection Anomalies** :
  - ML détecte patterns inhabituels (spike errors, drop conversions)
  - Alerts intelligentes (pas de false positives)
  - Auto-remediation basique (restart services, scaling)

**Critères de Succès Phase 5 :**

- ✅ Dashboard Grafana opérationnel avec 10+ métriques business
- ✅ Alertes configurées pour incidents critiques (< 5min detection)
- ✅ Trace complète requests user (end-to-end visibility)
- ✅ Détection anomalies ML fonctionnelle (faux positifs < 10%)

**Au-delà d'Avril 2026 (Vision Long-Terme) :**

1. **Mobile Native Apps** (iOS/Android)
   - Push notifications quotidiennes (streaks, tips, reminders)
   - Offline mode (log repas sans connexion)
   - Camera native optimisée (vs web upload)

2. **Intégration Objets Connectés Avancés**
   - Balances connectées (composition corporelle, graisse/muscle)
   - Montres fitness (Garmin, Polar, Fitbit via Terra API si budget ↑)

3. **Social & Community**
   - Partage recettes entre utilisateurs
   - Challenges communautaires (streaks teams, défis nutrition)
   - Leaderboard gamification

4. **IA Avancée (si revenus ↑)**
   - Réintroduire consensus multi-modèles (précision 90-95%)
   - Vision AI multi-aliments simultanés
   - Coach IA conversationnel (chatbot vs tips ponctuels)

5. **Expansion Géographique**
   - Marchés francophones prioritaires (France, Belgique, Suisse, Canada, Afrique francophone)
   - Traductions additionnelles si traction (IT, NL, etc.)
## User Journeys

**Méthodologie**: Journeys basés sur recherche web réelle (MyFitnessPal, Lifesum, tendances nutrition apps 2026) et enrichis par agents BMAD (Mary analyste, Sally UX, John PM).

**Disclaimer Légal Important**:

> ⚠️ **NutriProfile est un outil de suivi nutritionnel personnel à usage wellness.**
> L'application n'est PAS un dispositif médical et ne fournit AUCUN conseil médical.
> Consultez toujours un professionnel de santé qualifié pour tout conseil médical ou nutritionnel personnalisé.

---

### Journey #1: Utilisateur Perte de Poids (Segment Principal - 77% des users)

**Persona**: Basé sur données MyFitnessPal/Lifesum
- **Segment**: 77% des utilisateurs nutrition apps
- **Comportement type**: Logging quotidien, sessions courtes (1-5 min), objectif -5 à -15 kg
- **Référence**: 200M utilisateurs MyFitnessPal, profil dominant

#### Opening Scene - Découverte et Premier Contact

**Émotion: Espoir mêlé de scepticisme**

L'utilisateur arrive sur NutriProfile après avoir essayé MyFitnessPal/Yazio sans succès (trop complexe, base alimentaire France limitée). Il pense: *"Encore une app qui promet la lune... J'essaie une dernière fois."*

#### Rising Action - Onboarding et Premiers Succès

**Jour 1 (Onboarding < 30 sec)**:
- Scan première photo déjeuner → Détection BLIP-2 en 2-3 secondes
- Résultat immédiat: "Poulet grillé 150g + Riz 200g = 450 kcal" avec répartition macros
- **Aha Moment + Émotion (Surprise ravie)**: *"Wow! Pas besoin de chercher chaque aliment manuellement! Ça marche vraiment!"*

**Jours 2-7 (Phase critique - 77% abandonnent ici)**:
- **Émotion: Motivation croissante**
- Logging quotidien rapide (sessions 1-5 min selon recherche MyFitnessPal)
- Gamification: Badge "3 jours consécutifs" débloqué → Dopamine, sourire de fierté
- Coach IA daily tip gratuit (1/jour tier Free): "Bravo! Vous êtes à -200 kcal aujourd'hui"
- **Sentiment**: *"C'est facile, je tiens le coup. Pour une fois, je ne me sens pas débordé."*

**Jours 8-30 (Rétention)**:
- Streak 30 jours activé (pattern MyFitnessPal: 92.4% utilisent plusieurs fois/jour)
- Graphique poids: -2 kg visible → **Émotion (Fierté)**: *"Ça marche! J'ai VRAIMENT perdu 2 kg!"*
- Limite Free atteinte: "2/2 analyses photo aujourd'hui. Upgrade pour illimité"
- **Sentiment**: *"Mmm... je commence à être bloqué. Mais l'app vaut peut-être plus..."*

#### Climax - Décision Premium

**Jour 30-45 (Conversion)**:
- **Frustration croissante**: Limite Free (2 analyses/jour) bloque lunch au travail + snack après-midi
- **Note PM**: Test A/B prévu - Variant B: 5 analyses/semaine (flexibilité vs 2/jour absolu) pour optimiser conversion
- Notification: "Essai Premium 14 jours gratuit - Analyses illimitées + Recettes IA"
- Activation trial → **Émotion (Soulagement + Excitation)**: *"Enfin! Je peux logger QUAND je veux!"*
- Expérience débridée:
  - 10 analyses photo/jour (déjeuner travail, snacks, dîner famille)
  - 5 recettes IA/semaine personnalisées (allergies, objectifs)
  - Dashboard stats avancées: tendances macros, prédictions perte poids

**Nouvelle Scène - Semaine 8: Le Plateau Émotionnel**

**Jour 56 - Crise de Doute**:
- **Émotion (Anxiété → Frustration)**: Utilisateur ouvre l'app, voit graphique poids PLAT depuis 10 jours
- Balance bloquée à -6 kg. Pas de mouvement.
- **Pensée utilisateur**: *"Ça marche plus. Je stagne. Je gaspille 5€/mois pour rien. Je dois annuler Premium."*
- Main sur le bouton "Résilier abonnement"...

**Coach IA Détecte Plateau - Message Empathique**:

> **Notification 🌟**: "Hey 👋 Je remarque que votre poids est stable depuis 8 jours. Pas de panique!
>
> C'est **NORMAL** et peut arriver lors d'un parcours de perte de poids. Votre corps s'adapte.
>
> Regardez plutôt vos macros des 2 dernières semaines:
> - Protéines stables: 120g/jour ✅
> - Déficit calorique maintenu: -1400 kcal/semaine
>
> La patience est clé! 💪
>
> **Astuce**: Voulez-vous un plan recettes 'boost métabolisme' pour relancer? (légumes verts, protéines maigres)"

**Émotion (Soulagement + Confiance retrouvée)**:
- Utilisateur lit, réfléchit: *"Ah... l'app COMPREND ce qui se passe. C'est pas juste un tracker bête."*
- Clique "Oui, envoie le plan boost métabolisme"
- Recette générée: "Salade poulet-avocat-épinards, vinaigrette citron"
- **Décision**: Garde Premium, continue

**Moment de vérité Jour 65**:
- Balance affiche -8 kg total (plateau cassé!)
- **Émotion (Joie intense + Gratitude)**: *"J'ai réussi! Et l'app m'a soutenu dans le moment dur!"*
- Conversion Premium confirmée 5€/mois (recherche: 15% conversion, 64% maintien 6-12 mois)

#### Resolution - Utilisateur Fidélisé

**Mois 2-6**:
- Logging quotidien ancré (habitude comportementale)
- -10 kg atteints, maintenance avec Premium
- Partage screenshots badges sur Instagram (51.5% ne networkent JAMAIS selon MFP → **Insight Analyst**: NutriProfile se concentre sur solo tracking privacy-first, pas social features invasives)
- Renouvellement Premium automatique
- **Sentiment final**: *"Cette app a changé ma vie. Pour 5€/mois, c'est cadeau."*

#### Capabilities Révélées

1. Vision IA temps réel (< 3 sec) avec base aliments France
2. Gamification streak/badges jour 1-3 (rétention critique)
3. Coach IA daily tips tier Free (engagement gratuit)
4. **Détection anomalies progression (plateau poids) + messages empathiques contextuels**
5. Trial Premium 14 jours automatique inscription
6. Limites Free frustrantes mais non-bloquantes (test A/B flexible vs absolu prévu)
7. Dashboard stats avancées Premium (prédictions, tendances)
8. Onboarding < 30 secondes (pas de questionnaire marathon)
9. **Support émotionnel algorithmique (pas juste metrics)**

---

### Journey #2: Utilisateur Prise de Masse/Athlète (Segment Secondaire - 15-20% des users)

**Persona**: Basé sur tendance 2026 composition corporelle
- **Segment**: 15-20% utilisateurs nutrition apps fitness-oriented
- **Comportement type**: Tracking protéines (2g/kg), poids 3×/semaine, recettes haute protéine
- **Référence**: Segment croissant Fitia/MacroFactor

#### Opening Scene - Frustration Apps Classiques

**Émotion: Frustration + Détermination**

L'utilisateur (sportif régulier, objectif masse musculaire) trouve MyFitnessPal axé "perte de poids" inadapté. Il pense: *"Ces apps sont toutes pour maigrir. Personne comprend que je veux PRENDRE du muscle sain!"*

#### Rising Action - Découverte Personnalisation

**Onboarding**:
- Sélection "Prise de masse" → Calcul TDEE × 1.1 (surplus 10%)
- **Émotion (Espoir)**: *"Tiens, cette app comprend la prise de masse. Intéressant..."*
- **Profil nutritionnel**:
  - Objectif: +0.5 kg/mois muscle (réaliste)
  - Macros auto: 2g protéine/kg, 40% glucides, 25% lipides
  - **Sentiment**: *"Enfin des chiffres qui ont du SENS pour mon objectif!"*

**Première semaine**:
- Scan photo post-training: "Poulet 200g + Patates douces 300g = 520 kcal, 52g protéines"
- Coach IA: "Excellent! 150g protéines atteints aujourd'hui (objectif 160g)"
- **Émotion (Satisfaction)**: *"L'app suit mes protéines précisément. C'est exactement ce qu'il me faut."*
- Tracking poids 3×/semaine avec graphique tendance

#### Climax - Value Proposition Pro (Time-Saving)

**Jour 10**:
- Limite Free recettes atteinte (1/semaine)
- **Émotion (Frustration légère)**: *"1 recette/semaine, c'est trop peu. J'ai besoin de variété."*
- Upgrade Premium 5€/mois → 5 recettes IA/semaine:
  - Prompt: "Recette hyperprotéinée 600 kcal, sans lactose, <30 min"
  - Mistral-7B génère: "Bowl Saumon Quinoa Edamame - 54g protéines"
  - Calcul nutrition automatique par portion
  - **Émotion (Satisfaction + Créativité culinaire)**: *"Ces recettes sont vraiment bonnes ET adaptées à mes macros!"*

**Mois 2**:
- +2 kg masse (suivi poids), composition améliorée
- **Émotion (Progrès visible mais...)**: *"Je progresse, mais passer 2h chaque dimanche à planifier mes repas de la semaine, c'est épuisant..."*

**Nouvelle Scène - Dimanche Soir: Le Time-Saving Moment**

**Mois 3, 20h un Dimanche**:

**Situation**: Athlète termine training, rentre fatigué. Doit planifier 21 repas semaine (3 repas/jour × 7 jours).

**Ancienne routine**:
- Ouvre Excel, liste 21 repas
- Calcule macros manuellement pour chacun
- Fait liste courses Carrefour à la main
- **Temps**: 2 heures
- **Émotion**: Épuisement mental, procrastination

**Nouvelle routine avec NutriProfile Pro (10€/mois)**:

**20h05** - Ouvre app, clique "Générer plan repas semaine"

**20h06** - Questionnaire rapide:
- Objectif: Prise masse (pré-rempli profil)
- Calories/jour: 2800 kcal (auto-calculé)
- Macros: 160g protéines, 280g glucides, 78g lipides
- Contraintes: Pas lactose, < 30 min prep (pré-rempli)

**20h07** - Mistral-7B + templates génèrent plan 7 jours:
- Lundi: Petit-déj (Overnight oats protéinés), Lunch (Bowl poulet quinoa), Dîner (Saumon patates douces)
- Mardi-Dimanche: 18 autres repas planifiés
- **Total nutrition semaine**: 19,600 kcal, 1,120g protéines ✅
- Liste courses automatique:
  - Protéines: Poulet (1kg), Saumon (600g), Œufs (18), Tofu (400g)
  - Glucides: Riz basmati (2kg), Patates douces (1.5kg), Quinoa (500g)
  - Légumes: Brocoli (800g), Épinards (500g), Tomates (1kg)
  - Graisses: Avocat (4), Huile olive (250ml)

**20h09** - Export PDF plan + liste courses

**Émotion (Soulagement IMMENSE + Joie)**:
- *"QUOI?! 2 minutes au lieu de 2 HEURES?! Cette feature vaut 100€, pas 10€!"*
- **AHA MOMENT VALUE PRO**: *"C'est pas juste des recettes... c'est mon TEMPS de vie récupéré!"*

**Décision**: Upgrade Pro 10€/mois **IMMÉDIAT**
- **Justification mentale**: "10€/mois = économiser 8h/mois de planification = 1.25€/heure. C'est donné!"

#### Resolution - Utilisateur Pro Fidélisé

**Mois 4-6**:
- 2 plans repas/mois utilisés systématiquement (100% adoption Pro)
- +4 kg masse musculaire (objectif ×8 mois = +0.5 kg/mois)
- **Émotion (Fierté + Gratitude)**: *"Ma progression a explosé depuis que je ne stresse plus sur la planification. Je me concentre sur l'essentiel: training!"*
- Rating plan 5/5 étoiles: "Game changer pour athlètes sérieux"
- Recommande à 3 amis salle de sport

#### Capabilities Révélées

1. Profil nutritionnel objectifs multiples (perte/maintien/prise masse)
2. Calcul macros adaptatif (2g protéine/kg auto)
3. Coach IA suivi macros quotidien
4. Recettes IA personnalisées allergies/objectifs
5. **Plans repas IA hebdomadaires ONE-CLICK (tier Pro)**
6. **Liste courses automatique catégorisée**
7. **Export PDF plan complet (intégration Phase 2)**
8. **UX time-saving focus (pas juste nutrition tracking)**
9. Tracking poids graphique tendances
10. **Value proposition claire Pro vs Premium: Temps gagné > Volume features**

---

### Journey #3: Utilisateur Nutrition Consciente (Segment Wellness - 10-12% des users)

**Persona**: Utilisateur consciencieux de son alimentation
- **Segment**: 10-12% utilisateurs nutrition apps wellness-oriented
- **Comportement type**: Suivi macros détaillé (glucides, protéines, lipides), objectifs personnels, journal alimentaire long-terme
- **Référence**: Utilisateurs Chronometer, Lifesum wellness focus

**⚠️ Disclaimer Wellness**:

> NutriProfile est un outil de suivi nutritionnel personnel à usage wellness.
> Pour toute question de santé, condition médicale, ou conseil nutritionnel personnalisé, consultez un professionnel de santé qualifié.
> L'application ne remplace en aucun cas un avis médical professionnel.

#### Opening Scene - Recherche de Contrôle Personnel

**Émotion: Détermination + Responsabilité personnelle**

L'utilisateur souhaite suivre précisément son alimentation pour des raisons personnelles (bien-être général, objectifs personnels). Il cherche un outil détaillé mais accessible.

**Pensée utilisateur**: *"Je veux comprendre exactement ce que je mange. Pas un régime strict, juste être conscient et responsable."*

#### Rising Action - Tracking Détaillé Personnel

**Onboarding**:
- Objectif: "Bien-être et équilibre nutritionnel"
- Préférences personnelles: Suivi glucides modérés (150-200g/jour selon objectif personnel)
- **Émotion (Sérieux + Organisation)**: *"Cette fois, je vais vraiment suivre mon alimentation avec rigueur."*
- Calcul TDEE standard avec ajustement personnel

**Semaine 1**:
- Scan repas → Focus détail macros: "Pâtes 200g = 50g glucides, 8g protéines"
- **Émotion (Prise de conscience)**: *"Je ne réalisais pas la répartition exacte de mes macros!"*
- Coach IA général wellness: "Belle journée équilibrée! Macros bien répartis (30% protéines, 40% glucides, 30% lipides)"
- Tracking poids + notes personnelles quotidiennes

**Mois 1**:
- Logging quotidien régulier
- Découverte patterns personnels: "Je dépasse souvent glucides le week-end"
- **Émotion (Satisfaction apprentissage)**: *"J'apprends tellement sur mes habitudes alimentaires!"*

#### Climax - Journal Personnel Long-Terme

**Mois 2**:
- Besoin de suivi long-terme pour analyser tendances personnelles
- **Émotion (Besoin organisation)**: *"J'aimerais avoir un journal complet de mon parcours nutrition."*
- Upgrade Pro 10€/mois pour:
  - Historique illimité (Free 7j, Premium 90j, Pro illimité)
  - Export PDF "Journal Nutritionnel Personnel":
    - Graphiques 6 mois nutrition (calories, macros, tendances)
    - Notes personnelles quotidiennes
    - Progrès objectifs personnels
    - **Usage**: Journal personnel, suivi long-terme, partage optionnel avec professionnel si utilisateur le souhaite (initiative utilisateur, pas fonctionnalité app)

**Clarification Export PDF**:
- PDF = **journal personnel** de l'utilisateur
- Utilisateur libre d'en faire ce qu'il souhaite (garder, imprimer, partager)
- **App ne suggère PAS** de partager avec professionnel santé
- Contenu = données factuelles loggées par utilisateur (calories, macros, poids)
- **Aucune interprétation médicale**, juste visualisation données

#### Resolution - Utilisateur Wellness Long-Terme

**Mois 6**:
- Équilibre nutritionnel personnel atteint selon objectifs propres
- **Émotion (Contrôle + Bien-être)**: *"Je comprends mon corps et mes besoins. Je me sens mieux."*
- Pro renouvelé (historique illimité essentiel pour suivi long-terme)
- App devenue outil bien-être quotidien, pas "régime temporaire"
- **Sentiment**: *"C'est mon journal nutrition, comme mon journal intime. Indispensable."*

#### Capabilities Révélées

1. Profil wellness objectifs personnels multiples
2. Calcul macros détaillé (glucides, protéines, lipides)
3. Coach IA messages wellness généraux (équilibre, variété)
4. Tracking notes personnelles quotidiennes
5. **Export PDF journal nutritionnel personnel (tier Pro)**
6. **Historique illimité pour analyse long-terme**
7. Focus macros détaillé (suivi précis glucides/protéines/lipides)
8. **Interface wellness focus (pas médical, juste suivi conscient)**
9. Privacy-first (données personnelles, pas partage social obligé)

---

### Journey #4: Admin/Opérations (Badre - Monitoring App)

**Persona**: Badre, développeur/propriétaire app
- **Segment**: Admin unique (1 utilisateur)
- **Comportement type**: Monitoring quotidien, analytics, support utilisateurs, anxiété infrastructure
- **Référence**: Rôle admin SaaS typique, empathie pour créateur solo

#### Opening Scene - Lancement Production

**Émotion: Excitation + Anxiété entrepreneur**

NutriProfile déployé Fly.io, premiers utilisateurs s'inscrivent organiquement (SEO francophone). Badre pense: *"Ça y est, c'est live. Pourvu que ça tienne la charge... et que les gens aiment!"*

#### Rising Action - Monitoring Quotidien

**Jour 1-30**:
- **Dashboard Admin** (endpoint `/admin/dashboard`):
  - Utilisateurs actifs: 150 (objectif 2000 - début modeste)
  - Conversions Premium: 8 (5.3%, objectif 15% - **en dessous**)
  - Analyses photo/jour: 340 (moyenne 2.3/utilisateur - correct)
  - Coût LLM HuggingFace: 1.2 USD/jour (35 USD/mois ✅ sous budget)
  - Redis cache hit rate: 42% (économie LLM - bon)
- **Logs Fly.io**:
  - Erreurs backend: 0 (API stable ✅)
  - Latence p95 BLIP-2: 2.8 sec (objectif < 5 sec ✅)

**Émotion (Satisfaction technique + Inquiétude business)**:
- *"La tech marche nickel. Mais 5.3% conversion, c'est trop bas. Dois-je changer pricing? Limites Free?"*

#### Climax - 3h du Matin: Incident Production

**Jour 45, 3h07 du matin**:

**ALERT Sentry**: Spike erreurs API Vision - 127 errors/min

**Émotion (Panique réveil brutal)**:
- Badre se réveille, smartphone vibre
- Ouvre Slack, voit alerte Sentry
- **Pensée**: *"MERDE! L'app crash! Utilisateurs vont partir!"*
- Saute du lit, ouvre laptop en panique

**3h09** - Dashboard Grafana chargé:
- Graphique erreurs: Spike 500 errors (Redis connection timeout)
- Métriques Redis: **Memory 2.1 GB / 2 GB (FULL!)**
- Cause: Cache recipes jamais flush, accumulation

**3h10** - Badre stressé, doit agir vite:
- Option 1: Manual flush (risque purger cache chaud)
- Option 2: Upgrade Redis 4 GB (+5 USD/mois - hors budget!)
- Option 3: Auto-remediation (déjà configurée Phase 1)

**3h11 - Auto-remediation KICK IN**:
- **Observability script détecte** Redis > 95% memory
- **Action auto**: Flush oldest 30% cache entries (recipes > 7 jours)
- Redis memory: 2.1 GB → 1.4 GB (espace libéré)
- Erreurs API Vision: 127/min → 3/min → 0/min

**3h13** - Badre rafraîchit dashboard:
- Graphique erreurs: Spike terminé ✅
- Redis: Stable 1.4 GB ✅
- Latence API: Normale 2.9 sec ✅

**Émotion (Soulagement IMMENSE)**:
- *"Putain... ça s'est auto-fixé. Je n'ai rien eu à faire. Je peux retourner dormir."*
- **Gratitude système**: *"L'observability Phase 1 vient de me sauver 2h de debugging à 3h du mat. MERCI passé-Badre d'avoir codé ça!"*

**3h15** - Badre retourne se coucher, détendu

#### Rising Action Suite - Pic Usage Trial Expirations

**Jour 60**:
- 30 trials expirent simultanément (vague inscription J1-J14)
- Spike analyses photo: 800/jour → 400/jour (limite Free activée)
- **Émotion (Inquiétude)**: *"Conversion rate va s'effondrer..."*
- Notifications support: "Comment upgrader Premium?" (emails × 12)

**Action Badre**:
- Modal upgrade automatique affiché (code React déjà en place)
- Email relance trial expiré (template Mailgun personnalisé):
  - "Votre essai Premium se termine. Continuez à -50% le 1er mois?"
- Monitoring conversions temps réel: 7/30 = 23% ✅ (BON taux!)

**Émotion (Surprise positive)**:
- *"23% convertissent?! Je pensais 10-15% max. Le trial fonctionne!"*

#### Resolution - App Stable et Rentable

**Mois 3 (Fin Avril 2026)**:
- **Dashboard Grafana - Métriques Business**:
  - 2000 utilisateurs actifs (objectif ✅)
  - 300 Premium/Pro (15% conversion ✅)
  - 3000€ MRR (objectif ✅)
  - Coûts: 22 USD/mois (budget 30 USD ✅ - marge 8 USD)
  - **Émotion (Fierté + Accomplissement)**: *"J'AI RÉUSSI! 3000€ MRR en 3 mois avec Claude + agents. Incroyable!"*

- **Observability Phase 5 déployée**:
  - Grafana dashboards (10+ métriques business temps réel)
  - Alertes Sentry configurées (< 5min détection incidents)
  - PostHog analytics (funnel conversions, feature adoption)
  - **Auto-remediation avancée**:
    - Redis memory > 95% → Auto-flush
    - Latence BLIP-2 > 10s → Cache hit prioritization
    - Erreurs spike > 50/min → Alert Slack + email

**Émotion finale (Sérénité + Vision)**:
- *"Je dors tranquille. L'app se surveille elle-même. Je peux scaler à 10,000 users sans refactoring."*
- Pense à Phase 6: Mobile apps, expansion Belgique/Suisse

#### Capabilities Révélées

1. Dashboard admin analytics temps réel (MAU, conversions, MRR, coûts)
2. Monitoring infrastructure (Fly.io logs, latence, erreurs)
3. **Observability Grafana + Sentry (Phase 5) - CRITICAL pour santé mentale admin**
4. **Auto-remediation incidents (Redis, latence, scaling)**
5. Gestion subscriptions (webhooks Lemon Squeezy, tiers)
6. **Alertes intelligentes (Slack/email, pas false positives)**
7. **Support émotionnel admin (réduction anxiété 3h matin via automation)**
8. PostHog analytics (funnel, adoption features)

---

### Journey Requirements Summary

Les 4 journeys révèlent **19 capabilities essentielles** (version sécurisée sans implications médicales):

#### Capabilities Core (Toutes Journeys)
1. Vision IA photo repas (BLIP-2, < 3 sec, base France)
2. Profil nutritionnel adaptatif (objectifs multiples: perte/maintien/prise masse/wellness)
3. Calcul nutrition automatique (BMR/TDEE + ajustements)
4. Coach IA personnalisé (TinyLlama, tips quotidiens)
5. Gamification engagement (streaks, badges, notifications)
6. Système freemium trial (14 jours Premium auto, limites tier)

#### Capabilities Premium/Pro (Journeys 1-3)
7. Recettes IA personnalisées (Mistral-7B, allergies, objectifs)
8. **Plans repas IA one-click** (templates + LLM, liste courses auto)
9. Dashboard stats avancées (tendances, prédictions, graphiques)
10. **Export PDF journal personnel** (historique nutrition, usage personnel utilisateur)
11. Historique étendu (Free 7j, Premium 90j, Pro illimité)

#### Capabilities Rétention Émotionnelle
12. **Détection plateau poids + messages empathiques** (Journey 1: Anxiété → Soulagement)
13. **Support émotionnel algorithmique** (pas juste metrics, empathie IA)
14. **Privacy-first positioning** (51.5% MyFitnessPal no-network → pas social invasif)
15. **Interface wellness focus** (suivi conscient personnel, pas médical)

#### Capabilities Admin (Journey 4)
16. **Dashboard Grafana + auto-remediation** (réduction anxiété admin 3h matin)
17. **Alertes intelligentes** (Slack/email, incidents critiques < 5min)
18. **Monitoring coûts temps réel** (budget 30 USD enforcement)
19. **PostHog analytics** (funnel conversions, feature adoption)

#### Capabilities Testing & Optimization (Insights équipe BMAD)
- **Test A/B limites Free**: 2 analyses/jour (actuel) vs 5 analyses/semaine (flexibilité) - Optimiser conversion Premium
- **Privacy-first social**: Pas de features sociales obligatoires (51.5% users ne networkent jamais)
- **Time-saving focus Pro**: Justifier 10€ vs 5€ Premium par économie temps (8h/mois planification)
