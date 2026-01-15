"""Script pour remplacer les modèles Qwen par des alternatives disponibles sur l'API gratuite."""
import os

# Fichiers à modifier
files = [
    "app/agents/meal_plan.py",
    "app/agents/dashboard_personalizer.py",
    "app/agents/recipe.py",
    "app/agents/coach.py",
]

replacements = {
    "Qwen/Qwen2.5-72B-Instruct": "mistralai/Mistral-7B-Instruct-v0.2",
    "Qwen/Qwen2.5-7B-Instruct": "microsoft/Phi-3-mini-4k-instruct",
}

for file_path in files:
    print(f"Traitement de {file_path}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [OK] Modifie")
    else:
        print(f"  [-] Aucun changement")

print("\nRemplacement terminé!")
