# Embeddings Multilingues avec Docker

## Vue d'ensemble

Le système de recherche nutritionnelle multilingue utilise des embeddings sémantiques pour une recherche cross-lingue. Ce document explique comment gérer les embeddings dans un environnement Docker.

---

## Architecture dans Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONTAINER BACKEND                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Premier démarrage:                                              │
│  1. Le modèle multilingual (500MB) se télécharge                 │
│  2. Cache dans /root/.cache/huggingface/                         │
│  3. Chargement ~2-3 secondes aux runs suivants                   │
│                                                                  │
│  Sans embeddings cache (usda_embeddings.pkl):                    │
│  - Utilise fallback: Traduction LLM + USDA Search                │
│  - Performances: ~500ms au lieu de ~50ms                         │
│  - Fonctionne parfaitement!                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Option 1: Mode Fallback (Recommandé pour Docker)

**Avantages**:
- ✅ Pas de fichier cache additionnel à gérer
- ✅ Image Docker plus légère
- ✅ Fonctionne out-of-the-box
- ✅ Télécharge uniquement le modèle (~500MB une fois)

**Inconvénients**:
- Performance: ~500ms au lieu de ~50ms pour recherche embeddings

**Build et Run**:
```bash
# Build l'image
docker-compose build backend

# Premier run: télécharge le modèle (~500MB, 2-5 min selon connexion)
docker-compose up backend

# Logs pour suivre le téléchargement
docker-compose logs -f backend
```

**Note**: Le modèle se télécharge au premier appel API de nutrition search, pas au démarrage du container.

---

## Option 2: Avec Cache Embeddings (Optionnel, Performances Maximales)

Si vous voulez les **meilleures performances** (~50ms), construisez le cache embeddings:

### Étape 1: Construire le Cache Localement

```bash
# Sur votre machine locale (hors Docker)
cd backend
python scripts/build_usda_embeddings_index.py
# Durée: 30-60 minutes
# Génère: usda_embeddings.pkl (~500MB-1GB)
```

### Étape 2: Copier dans le Container

**Option A: Volume Mount**
```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./backend/usda_embeddings.pkl:/app/usda_embeddings.pkl:ro
```

**Option B: COPY dans Dockerfile**
```dockerfile
# backend/Dockerfile - ajouter après COPY . .
COPY usda_embeddings.pkl /app/usda_embeddings.pkl
```

⚠️ **Attention**: L'image Docker sera ~1GB plus grande.

---

## Variables d'Environnement

```bash
# Optionnel: Token Hugging Face (pour modèles privés)
HUGGINGFACE_TOKEN=hf_xxxxx

# Optionnel: Désactiver warning symlinks
HF_HUB_DISABLE_SYMLINKS_WARNING=1
```

---

## Build Multi-Stage (Optimisation Avancée)

Pour optimiser la taille de l'image Docker:

```dockerfile
# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Copier les wheels du builder
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copier le code
COPY . .

# Optionnel: Pré-télécharger le modèle au build time
# RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')"

CMD ["gunicorn", "app.main:app", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080"]
```

---

## Performance Docker

### Temps de Démarrage

| Scénario | Premier Run | Runs Suivants |
|----------|-------------|---------------|
| **Sans embeddings cache** | 5-10 min (download modèle) | 5-10 secondes |
| **Avec embeddings cache** | 5-10 min + 30-60 min build | 5-10 secondes |

### Taille Image

| Configuration | Taille Image |
|---------------|--------------|
| **Base (Python 3.11-slim)** | ~150MB |
| **+ Dependencies** | ~800MB |
| **+ Modèle en cache** | ~1.3GB |
| **+ Embeddings USDA** | ~2.3GB |

---

## Recommandations par Environnement

### Développement Local
```bash
# Option 1: Sans Docker (plus rapide pour dev)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Option 2: Avec Docker
docker-compose up backend
```

### Staging/Production (Fly.io, Render, etc.)
```yaml
# Recommandé: Mode Fallback
# - Pas de cache embeddings
# - Volume persistent pour cache HuggingFace
# - Health check avec timeout élevé

volumes:
  - huggingface_cache:/root/.cache/huggingface

healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  start_period: 60s  # Laisse le temps au modèle de charger
```

---

## Troubleshooting

### Erreur "No module named 'sentence_transformers'"
```bash
# Vérifier que requirements.txt est à jour
cat requirements.txt | grep sentence-transformers

# Re-build l'image
docker-compose build --no-cache backend
```

### Modèle ne se télécharge pas
```bash
# Vérifier les logs
docker-compose logs backend

# Tester manuellement dans le container
docker-compose exec backend python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')"
```

### Espace disque insuffisant
```bash
# Nettoyer les images inutilisées
docker system prune -a

# Vérifier l'espace
docker system df
```

---

## CI/CD Considerations

### GitHub Actions

```yaml
name: Build Backend

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t backend:latest ./backend

      - name: Test embeddings
        run: |
          docker run backend:latest python -c "from app.services.food_embeddings import embed_text; print('OK')"
```

### Cache Layers

Pour accélérer les builds CI/CD:
```dockerfile
# Séparer les layers qui changent rarement
COPY requirements.txt .
RUN pip install -r requirements.txt

# Layer qui change souvent (code)
COPY . .
```

---

## Résumé

**Recommandation Simple**: Utilisez le **mode fallback** (sans cache embeddings).
- ✅ Setup simple
- ✅ Fonctionne parfaitement
- ⚠️ Performance légèrement réduite (~500ms vs ~50ms)

**Pour performances maximales**: Construisez le cache embeddings et montez-le via volume.

---

**Questions?** Consultez:
- [MULTILINGUAL_SEARCH_README.md](MULTILINGUAL_SEARCH_README.md) - Architecture complète
- [QA_REPORT.md](QA_REPORT.md) - Tests et métriques
