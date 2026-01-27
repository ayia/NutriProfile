---
stepsCompleted: [1, 2]
inputDocuments: []
workflowType: 'research'
lastStep: 2
research_type: 'technical'
research_topic: 'Solutions techniques pour les prochaines fonctionnalités de NutriProfile'
research_goals: 'Évaluation approfondie des technologies pour: Export PDF (ReportLab, WeasyPrint, Playwright), Plans alimentaires IA (approches et algorithmes), Intégrations wearables (APIs Fitbit, Apple Health, Google Fit), et Derniers modèles IA nutrition 2026'
user_name: 'Badre '
date: '2026-01-27'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-01-27
**Author:** Badre
**Research Type:** technical

---

## Research Overview

## Technical Research Scope Confirmation

**Research Topic:** Solutions techniques pour les prochaines fonctionnalités de NutriProfile

**Research Goals:** Évaluation approfondie des technologies pour: Export PDF (ReportLab, WeasyPrint, Playwright), Plans alimentaires IA (approches et algorithmes), Intégrations wearables (APIs Fitbit, Apple Health, Google Fit), et Derniers modèles IA nutrition 2026

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-27

---

## Technology Stack Analysis

### Programming Languages

**Python 3.8+ : Le Standard pour NutriProfile**

Python reste le langage dominant pour les applications de nutrition et santé en 2026, particulièrement pour l'intégration IA et ML. FastAPI, qui nécessite Python 3.8+, a connu une croissance explosive avec une **utilisation passant de 29% à 38% en 2025**, une augmentation remarquable de **40% d'une année sur l'autre**.

_Language Evolution:_ Python continue d'évoluer avec des performances améliorées grâce à l'async native et le type hinting, rendant les frameworks modernes comme FastAPI particulièrement efficaces.

_Performance Characteristics:_ Avec FastAPI et Uvicorn, Python atteint **15,000-20,000 requêtes par seconde**, se rapprochant des performances de Node.js et Go.

_Suitability for NutriProfile:_ Python est le choix idéal car il supporte nativement :
- Intégration IA (Hugging Face, PyTorch, TensorFlow)
- APIs wearables (bibliothèques Python disponibles pour toutes)
- Génération PDF (ReportLab, WeasyPrint, Playwright)
- FastAPI déjà utilisé dans l'architecture backend actuelle

_Source: [FastAPI vs Flask 2026](https://strapi.io/blog/fastapi-vs-flask-python-framework-comparison)_
_Source: [Most Popular Python Frameworks 2025](https://blog.jetbrains.com/pycharm/2025/09/the-most-popular-python-frameworks-and-libraries-in-2025-2/)_

### Development Frameworks and Libraries

**FastAPI : Framework Backend de NutriProfile**

FastAPI est déjà le framework backend de NutriProfile et continue d'être le meilleur choix en 2026.

_Major Framework Benefits:_
- **Performance exceptionnelle:** 15,000+ RPS vs Flask 3,000 RPS
- **Async native:** Parfait pour les appels IA multi-agents parallèles
- **Type safety:** Type hints Python 3.8+ réduisent les bugs
- **Auto documentation:** OpenAPI/Swagger intégré
- **Adoption croissante:** 78,000+ stars GitHub (vs 15,000 en 2020)

_Use Case for ML/AI:_ FastAPI est largement utilisé pour déployer des modèles ML en production, s'intégrant bien avec TensorFlow, PyTorch, et Hugging Face, et supporte les pipelines d'inférence async pour un throughput maximal.

_Source: [FastAPI Benchmarks](https://fastapi.tiangolo.com/benchmarks/)_
_Source: [Top Python Frameworks 2026](https://reflex.dev/blog/2026-01-09-top-python-web-frameworks-2026/)_

**Bibliothèques PDF Python : Comparaison Détaillée**

Pour la fonctionnalité **Export PDF** de NutriProfile, trois options principales émergent :

**1. ReportLab**
- **Type:** Génération PDF programmatique de zéro
- **Forces:** Contrôle précis des layouts, graphiques vectoriels, tableaux complexes
- **Use Case:** Rapports financiers, documents data-heavy, layouts précis
- **Performance:** Excellent pour génération de documents structurés
- **Verdict:** ⭐ **Recommandé pour NutriProfile** - Idéal pour rapports nutrition avec graphiques, tableaux nutritionnels, et layouts personnalisés

**2. WeasyPrint**
- **Type:** Conversion HTML/CSS vers PDF
- **Forces:** Adhère aux standards web, gratuit (licence BSD), ne nécessite pas de navigateur
- **Use Case:** Contenu statique, templates HTML simples
- **Limites:** Moins performant que Playwright pour contenu dynamique
- **Verdict:** ✅ **Option alternative** - Bon pour templates simples si HTML/CSS est déjà utilisé

**3. Playwright**
- **Type:** Automation navigateur (Chromium)
- **Forces:** Fidélité maximale HTML/CSS/JS, support tous navigateurs majeurs, gère contenu dynamique
- **Use Case:** Applications web modernes avec JavaScript
- **Performance:** Meilleure combinaison fidélité + performance pour contenu web
- **Limites:** Plus lourd (nécessite Chromium), overhead navigateur
- **Verdict:** ⚠️ **Overkill pour NutriProfile** - Excellent mais trop complexe si contenu est principalement statique

_Recommendation for NutriProfile:_ **ReportLab** est le meilleur choix car :
- Rapports nutrition sont data-heavy (tableaux, graphiques)
- Contrôle précis du layout nécessaire
- Pas de dépendance à un navigateur (plus léger)
- Performance optimale pour génération programmatique

_Source: [Python PDF Libraries Comparison 2025](https://templated.io/blog/generate-pdfs-in-python-with-libraries/)_
_Source: [WeasyPrint vs ReportLab](https://dev.to/claudeprime/generate-pdfs-in-python-weasyprint-vs-reportlab-ifi)_
_Source: [Top 10 Python PDF Libraries 2025](https://www.nutrient.io/blog/top-10-ways-to-generate-pdfs-in-python/)_

**Bibliothèques IA et ML**

_Ecosystem for Nutrition AI:_
- **Hugging Face Transformers:** Déjà utilisé dans NutriProfile pour BLIP-2, LLaVA, Mistral, Llama
- **PyTorch/TensorFlow:** Backends pour modèles custom si nécessaire
- **LangChain:** Framework pour orchestration LLM (optionnel pour plans alimentaires IA)

_Source: [AI in Personalized Nutrition 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12325300/)_

### Database and Storage Technologies

**PostgreSQL : Base de Données de NutriProfile**

PostgreSQL reste le choix optimal pour NutriProfile en 2026, utilisé via SQLAlchemy async.

_Strengths for Nutrition Apps:_
- **JSONB support:** Stockage flexible pour données nutritionnelles variables
- **Async support:** Via asyncpg et SQLAlchemy 2.0 async
- **Scalability:** Gère millions de logs alimentaires
- **Full-text search:** Recherche d'aliments performante

_Additional Storage Needs:_
- **Redis (optionnel):** Cache pour réduire coûts API Hugging Face
- **S3/Object Storage:** Stockage images repas si volume croît
- **Vector DB (optionnel):** Embeddings pour recherche sémantique recettes

_Source: Architecture actuelle NutriProfile utilise déjà PostgreSQL avec succès_

### Development Tools and Platforms

**Outils de Développement NutriProfile**

_IDE and Editors:_
- VS Code avec extensions Python/FastAPI recommandé
- Type checking avec mypy ou pyright

_Version Control:_
- Git/GitHub déjà utilisé

_Build Systems:_
- Poetry ou pip-tools pour gestion dépendances
- Docker pour containerisation

_Testing Frameworks:_
- **pytest:** Tests backend Python (déjà utilisé)
- **Vitest:** Tests frontend React (déjà configuré)
- **Coverage targets:** 80%+ comme défini dans docs

_Source: [FastAPI Best Practices 2026](https://fastapi.tiangolo.com/)_

### Cloud Infrastructure and Deployment

**Fly.io : Plateforme de Déploiement Actuelle**

NutriProfile utilise déjà Fly.io avec succès pour backend et Cloudflare Pages pour frontend.

_Container Technologies:_
- Docker utilisé pour backend FastAPI
- Fly.io gère orchestration

_Serverless Considerations:_
- Hugging Face Inference API = serverless pour IA
- Possibilité de migrer certaines fonctions vers Cloudflare Workers si nécessaire

_CDN:_
- Cloudflare CDN déjà utilisé pour frontend

_Source: Architecture actuelle documentée dans CLAUDE.md_

### Technology Adoption Trends

**Tendances Clés pour NutriProfile (2026)**

**1. LLMs Multimodaux pour Nutrition**

Les LLMs généralistes (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) montrent des performances remarquables en estimation nutritionnelle depuis images :
- **Corrélations r = 0.58–0.81** pour estimation poids, énergie, macronutriments
- **Avantages vs CNN traditionnels:** Utilisation d'indices contextuels et objets de référence

_Emerging Specialized Models:_
- **FoodSky:** LLM spécialisé food avec **83.3% accuracy** sur examen chef chinois
- **Multimodal approaches:** Combinaison vision + texte + raisonnement

_Impact sur NutriProfile:_ L'architecture multi-agents actuelle (BLIP-2 + LLaVA) pourrait être augmentée avec un LLM de raisonnement pour améliorer précision.

_Source: [LLMs for Nutritional Content Estimation](https://pmc.ncbi.nlm.nih.gov/articles/PMC12513282/)_
_Source: [FoodSky Food-Oriented LLM](https://arxiv.org/html/2406.10261v1)_

**2. Health Connect : Nouveau Standard Android**

**Changement majeur en 2026:** Google Fit APIs sont **dépréciés** !

_Migration Required:_
- **Google Fit REST API:** Déprécié, plus de nouveaux signups depuis mai 2024
- **Health Connect:** Nouveau standard unifié Android pour fitness/santé
- **Fitbit transition:** Utilise maintenant Health Connect (API Fitbit reste disponible)

_Impact sur NutriProfile:_ Intégration wearables doit utiliser :
- **iOS:** Apple HealthKit (stable, pas de dépréciation)
- **Android:** Health Connect (nouveau standard)
- **Cross-platform:** APIs unifiées comme Terra ou Open Wearables

_Unified API Solutions:_
- **Terra:** API santé intégrant Garmin, Fitbit, Apple, Google, Polar, Oura via source unique
- **Open Wearables (Dec 2025):** Plateforme open-source MIT normalisant données wearables

_Source: [Google Fit API Deprecation](https://www.thryve.health/blog/google-fit-api-deprecation-and-the-new-health-connect-by-android-what-thryve-customers-need-to-know)_
_Source: [Wearables Integration 2026](https://llif.org/2025/04/28/how-to-integrate-health-data-from-wearables-apple-health-fitbit-google-fit/)_
_Source: [Terra Wearables API](https://tryterra.co/)_

**3. Algorithmes de Planification Alimentaire IA**

_Current State-of-the-Art Approaches:_

**Machine Learning Methods:**
- Linear Regression, Random Forest, Gradient Boosting sur datasets NHANES
- Deep generative networks avec loss functions alignées sur guidelines nutritionnelles

**Natural Language Processing:**
- Frameworks LLM locaux permettant préférences en langage naturel
- Parsing d'inputs comme "low-carb vegan breakfast"

**Real-Time Adaptation:**
- Contrairement aux plans statiques, IA ajuste recommandations quotidiennement basé sur:
  - Données health trackers
  - Workouts, sommeil, hydration
  - Réponses glycémiques (ex: ZOE, DayTwo)

_Key Features for Implementation:_
- **Personalized predictive approaches:** Planification repas + contrôle glucose (diabète)
- **Biological data integration:** Microbiome, lipides sanguins, réponses postprandiales
- **Continuous learning:** Modèles s'adaptent au comportement utilisateur

_Challenges:_
- Manque de guidelines experts = questions précision/confiance
- Privacy données, transparence algorithmes, adhérence utilisateur
- Biais algorithmiques préoccupation majeure

_Source: [AI Nutrition Recommendation Systems](https://pmc.ncbi.nlm.nih.gov/articles/PMC12390980/)_
_Source: [AI in Personalized Nutrition](https://pmc.ncbi.nlm.nih.gov/articles/PMC12325300/)_
_Source: [AI Applications to Dietary Recommendations](https://pmc.ncbi.nlm.nih.gov/articles/PMC12193492/)_

**4. Migration Patterns**

_Legacy Technologies Being Phased Out:_
- Google Fit APIs (déprécié 2026)
- Frameworks synchrones Python (remplacés par async)

_Emerging Technologies Gaining Traction:_
- Health Connect (Android standard)
- FastAPI (croissance 40% YoY)
- LLMs multimodaux pour nutrition
- APIs unifiées wearables (Terra, Open Wearables)

_Community Trends:_
- Open-source préféré pour éviter vendor lock-in
- Type safety (Python type hints) devient standard
- Async-first architecture pour performance

---

## Integration Patterns Analysis

### API Design Patterns

**RESTful APIs : Standard pour NutriProfile**

NutriProfile utilise une architecture **RESTful API** avec FastAPI, suivant les principes REST et les best practices 2026.

_REST Principles for Health/Fitness Apps:_

**Méthodes HTTP Standard:**
- **GET:** Récupérer données (ex: historique food logs)
- **POST:** Créer nouvelles données (ex: logger un repas)
- **PUT/PATCH:** Mettre à jour données existantes (ex: éditer aliment)
- **DELETE:** Supprimer données (ex: supprimer food log)

**Best Practices 2026:**
- Versioning API (ex: `/api/v1/vision`)
- Pagination pour grandes listes
- Filtrage et tri via query parameters
- Rate limiting pour prévenir abus
- Documentation auto-générée (FastAPI OpenAPI/Swagger)

_Fitness APIs for Integration:_

**APIs Wearables Disponibles:**
- **Apple HealthKit:** Centralise données santé iOS avec contrôles privacy forts
- **Google Fit REST API:** Accès à 100+ métriques fitness ⚠️ **DÉPRÉCIÉ 2026**
- **Fitbit Web API:** Données de 20M+ utilisateurs Fitbit actifs
- **Garmin Health API:** API REST scalable avec données biométriques
- **Withings API:** Métriques santé medical-grade

_Source: [14 Best Fitness APIs 2026](https://www.mirrorfly.com/blog/fitness-api/)_
_Source: [Google Fit REST API](https://developers.google.com/fit/rest)_

**GraphQL APIs : Alternative Émergente**

GraphQL gagne en popularité pour microservices avec FastAPI, permettant requêtes flexibles et réduction over-fetching.

_Use Case for NutriProfile:_ Potentiellement utile pour dashboard stats complexes où frontend a besoin de données personnalisées.

_Source: [Building Scalable GraphQL Microservices with FastAPI](https://medium.com/@abhinav.dobhal/building-scalable-graphql-microservices-with-fastapi-fa3d8f880c38)_

**Webhook Patterns : Event-Driven Integration**

Webhooks permettent communication temps réel et architecture event-driven.

_Use Case for NutriProfile:_
- **Lemon Squeezy webhooks:** Notifications paiement (subscription_created, subscription_cancelled)
- **Wearables webhooks:** Notifications nouvelles données (si supporté par API)

_Implementation Pattern:_
- Event bus (AWS EventBridge, Azure Event Grid) pour dispatching
- Chaque webhook = unité d'exécution indépendante (fault tolerance)
- Async processing avec Celery ou FastAPI background tasks

_Source: [Webhooks and Event-Driven Architecture](https://apidog.com/blog/comprehensive-guide-to-webhooks-and-eda/)_
_Source: [Building Webhooks System with EDA](https://codeopinion.com/building-a-webhooks-system-with-event-driven-architecture/)_

### Communication Protocols

**HTTP/HTTPS Protocols : Communication Web Standard**

_Current State 2026:_
- **HTTPS obligatoire** pour toutes APIs exposées (TLS 1.3)
- **HTTP/2** pour performance améliorée (multiplexing)
- **HTTP/3 (QUIC)** émerge mais pas encore critique

_NutriProfile Implementation:_
- Fly.io force HTTPS
- FastAPI via Uvicorn supporte HTTP/2
- CloudFlare CDN gère TLS/SSL automatiquement

**Async Communication : FastAPI Performance Key**

_FastAPI Async Patterns for Microservices:_

**Performance Benefits:**
- **300% meilleure performance** que frameworks synchrones pour I/O-bound operations
- Single worker FastAPI peut gérer **milliers de connexions** efficacement
- Parfait pour appels API externes multiples (Hugging Face Inference, Wearables)

**Implementation Patterns:**
```python
# Async database access
async with AsyncSession() as session:
    result = await session.execute(select(User))

# Async API calls (Hugging Face)
async with httpx.AsyncClient() as client:
    response = await client.post(INFERENCE_URL, json=payload)
```

_Key Benefits for NutriProfile:_
- Multi-agents IA appels parallèles (BLIP-2 + LLaVA simultanément)
- Non-blocking I/O pour database queries
- Concurrent requests handling

_Source: [FastAPI for Microservices 2026](https://talent500.com/blog/fastapi-microservices-python-api-design-patterns-2025/)_
_Source: [Async APIs with FastAPI Best Practices](https://shiladityamajumder.medium.com/async-apis-with-fastapi-patterns-pitfalls-best-practices-2d72b2b66f25)_

**Message Queue Protocols : Async Processing**

_Optional for NutriProfile:_
- **Redis:** Cache + pub/sub simple
- **RabbitMQ/Kafka:** Pour event streaming complexe
- **Celery:** Async task processing (ex: génération PDF background)

_Current Need:_ Faible pour NutriProfile actuel, mais utile si volume croît significativement.

### Data Formats and Standards

**JSON : Format Standard**

JSON reste le format dominant pour APIs RESTful en 2026.

_Advantages:_
- Lisible par humains
- Support universel (tous langages)
- Intégration native JavaScript/TypeScript frontend
- FastAPI serialization/deserialization automatique via Pydantic

_NutriProfile Usage:_
- Tous endpoints API utilisent JSON
- Pydantic models garantissent validation et type safety

**Protocol Buffers : High-Performance Alternative**

Protobuf utilisé par gRPC pour communication haute performance, mais **overkill pour NutriProfile** car:
- APIs REST JSON suffisamment performantes
- Complexité supplémentaire non justifiée
- Frontend JavaScript préfère JSON

_Source: [Backend API Design with FastAPI 2026](https://johal.in/backend-api-design-building-restful-services-with-fastapi-and-openapi-2026/)_

### System Interoperability Approaches

**API Gateway Pattern : Centralized API Management**

_Not Currently Used by NutriProfile:_
NutriProfile utilise architecture monolithique FastAPI sans gateway externe. Ceci est approprié pour l'échelle actuelle.

_Future Consideration:_
Si microservices multiples émergent (ex: service PDF séparé, service wearables séparé), considérer:
- **Kong Gateway**
- **Traefik**
- **AWS API Gateway**

**Direct API Integration : Current NutriProfile Approach**

_External APIs Integrated:_
- **Hugging Face Inference API:** Direct HTTPS calls
- **Wearables APIs:** Direct integration (future)
- **Lemon Squeezy API:** Direct HTTPS + webhooks

_Benefits:_
- Simplicité
- Latence minimale
- Coûts réduits (pas de gateway externe)

### Microservices Integration Patterns

**FastAPI Microservices Architecture**

_Current State 2026:_
- **78% des nouveaux développements API** utilisent frameworks async comme FastAPI
- FastAPI est choix par défaut pour microservices Python I/O-bound

_Key Patterns for NutriProfile:_

**1. Async I/O Operations**
- Async database access (SQLAlchemy async engine)
- Async HTTP clients (httpx pour Hugging Face)
- Non-blocking I/O prévient bottlenecks

**2. Middleware Patterns**
- **Logging middleware:** Track requests/responses
- **CORS middleware:** Frontend React autorisé
- **Rate limiting middleware:** Prévenir abus API
- **Error handling middleware:** Gestion erreurs globale

**3. Dependency Injection**
FastAPI utilise dependency injection pour:
- Database sessions
- Auth user current
- Configuration injection

_Source: [FastAPI for Scalable Microservices](https://webandcrafts.com/blog/fastapi-scalable-microservices)_
_Source: [FastAPI Middleware Patterns 2026](https://johal.in/fastapi-middleware-patterns-custom-logging-metrics-and-error-handling-2026-2/)_

**Circuit Breaker Pattern : Resilience**

_Implementation for External APIs:_
```python
# Fallback si Hugging Face Inference indisponible
try:
    result = await call_huggingface_api()
except APIError:
    # Fallback model ou erreur graceful
    result = fallback_response()
```

_NutriProfile Usage:_ Implémenté dans agents multi-modèles avec fallback.

### Event-Driven Integration

**Webhook Integration : Lemon Squeezy**

_Current Implementation:_
NutriProfile reçoit webhooks Lemon Squeezy pour événements paiement:
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_expired`

_Security:_ Signature HMAC-SHA256 validation (X-Signature header)

_Processing Pattern:_
```python
@router.post("/webhooks/lemonsqueezy")
async def handle_webhook(request: Request):
    # Verify signature
    signature = request.headers.get("X-Signature")
    if not verify_signature(body, signature):
        raise HTTPException(403)

    # Process event async
    await process_subscription_event(event_data)
```

_Source: [Webhooks Integration Best Practices](https://medium.com/@alexdorand/webhooks-integration-best-practice-bc3bb2e1a8e2)_

**Publish-Subscribe Patterns : Future Consideration**

_Not Currently Needed:_
NutriProfile n'a pas besoin de pub/sub complexe actuellement, mais pourrait être utile pour:
- Notifications temps réel (ex: Coach IA push notifications)
- Event streaming entre microservices (si architecture évolue)

_Tools if Needed:_
- Redis Pub/Sub (simple)
- RabbitMQ (robuste)
- Kafka (high-throughput)

### Integration Security Patterns

**OAuth 2.0 & JWT : Authentication Standard**

_Current NutriProfile Implementation:_
- **JWT tokens** pour authentification API
- Access token: 30 minutes
- Refresh token: 7 jours

_OAuth 2.0 for Healthcare Apps:_

**Best Practices 2026:**
- OAuth 2.0 permet définir explicitement données accédées, aligné avec **principes GDPR de minimisation**
- Pour données santé sensibles, OAuth 2.0 et OIDC garantissent accès sécurisé par parties autorisées uniquement
- **Healthcare middleware** utilise TLS 1.3, AES-256, OAuth 2.0, JWT pour sauvegarder échanges

_GDPR Compliance:_
- **Remove PII from JWT ID tokens** que UI clients ne nécessitent pas
- OAuth 2.0 scope-based access control
- Audit logging de tous accès données santé

_Source: [OAuth 2.0 Key Flows and Security](https://www.loginradius.com/blog/engineering/what-is-oauth2-0)_
_Source: [Privacy and GDPR Using OAuth](https://curity.io/resources/learn/privacy-and-gdpr/)_
_Source: [Healthcare Middleware Framework](https://www.emorphis.com/healthcare-middleware-integration-software-framework/)_

**API Key Management : Hugging Face Integration**

_Best Practices for NutriProfile:_

**Security:**
- **Never hardcode API keys** dans source code
- Load depuis environment variables (Fly.io secrets)
- Use different tokens pour différents environments (dev/prod)
- **Regularly rotate tokens**
- Never expose tokens in client-side code

_Hugging Face Specific:_
- Fine-grained tokens avec permissions "Make calls to Inference Providers"
- Token authentication via Authorization header
- HTTPS obligatoire pour toutes communications

_Source: [Hugging Face Inference API Integration](https://knowbo.com/deploying-models-hugging-face-inference-api/)_
_Source: [HuggingFace API Key Best Practices](https://prosperasoft.com/blog/artificial-intelligence/huggingface-api-key-inference-integration/)_

**API Security Best Practices 2026**

_Critical Considerations:_

**Industry Trends:**
- APIs sont désormais le **vecteur d'attaque #1** (Gartner)
- **99% des organisations** ont eu un incident sécurité API l'année passée
- AI-driven cyberattacks nécessitent protections plus intelligentes

**Implementation for NutriProfile:**
1. **Rate Limiting:** Prévenir abuse (déjà implémenté)
2. **Input Validation:** Pydantic validation automatique
3. **HTTPS Everywhere:** Fly.io force TLS
4. **JWT Verification:** Tokens vérifiés à chaque requête
5. **CORS Configuration:** Whitelist domaines autorisés seulement
6. **HIPAA/GDPR Compliance:** Données nutrition = données santé sensibles

_Healthcare Data Responsibilities:_
- Secure data transmission (TLS 1.3)
- Proper storage practices (encryption at rest)
- Transparent privacy policies
- HIPAA compliance where applicable

_Source: [REST API Security Best Practices 2026](https://www.levo.ai/resources/blogs/rest-api-security-best-practices)_
_Source: [API Security Best Practices 2026](https://qodex.ai/blog/15-api-security-best-practices-to-secure-your-apis-in-2026)_

**Mutual TLS (mTLS) : Advanced Security**

_Not Currently Implemented:_
mTLS nécessite certificats côté client et serveur pour authentication mutuelle. Overkill pour NutriProfile actuel mais pourrait être utile pour:
- Intégrations B2B professionnels santé
- White-label partnerships

<!-- Content will be appended sequentially through research workflow steps -->
