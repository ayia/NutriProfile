#!/bin/bash
# Script de demarrage pour Render

# Creer le dossier data s'il n'existe pas (pour SQLite)
mkdir -p ./data

# Executer les migrations Alembic
python -m alembic upgrade head

# Demarrer l'application
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
