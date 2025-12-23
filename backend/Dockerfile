FROM python:3.11-slim

WORKDIR /app

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Dépendances système (inclut libffi-dev pour bcrypt)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code source
COPY . .

# Port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Creer le dossier data pour SQLite (sera monte comme volume sur Fly.io)
RUN mkdir -p /data

# Demarrage: migrations puis serveur
CMD ["sh", "-c", "python -m alembic upgrade head && gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8080"]
