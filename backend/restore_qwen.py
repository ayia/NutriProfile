"""Script pour restaurer les modeles Qwen dans tous les agents."""
import os

# Fichiers a modifier
files = [
    "app/agents/recipe.py",
    "app/agents/coach.py",
    "app/agents/profiling.py",
    "app/agents/dashboard_personalizer.py",
    "app/agents/meal_plan.py",
]

replacements = [
    ("mistralai/Mistral-7B-Instruct-v0.2", "Qwen/Qwen2.5-72B-Instruct"),
    ("microsoft/Phi-3-mini-4k-instruct", "Qwen/Qwen2.5-7B-Instruct"),
    ("microsoft/Phi-3-medium-4k-instruct", "Qwen/Qwen2.5-7B-Instruct"),
]

for file_path in files:
    print(f"Traitement de {file_path}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for old, new in replacements:
        content = content.replace(old, new)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [OK] Qwen restaure")
    else:
        print(f"  [-] Aucun changement")

print("\nRestauration terminee!")
print("Qwen 72B et 7B sont de retour - qualite parfaite restauree!")
