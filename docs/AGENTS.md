# Système Multi-Agents

## Orchestrateur Principal

Reçoit toutes requêtes IA, sélectionne agents et modèles, lance traitements parallèles, coordonne validation consensus.

## Agents Spécialisés

### Agent Profilage
Analyse questionnaire utilisateur, calcule besoins nutritionnels (Mifflin-St Jeor), génère profil personnalisé.

### Agent Recettes  
Génère recettes selon ingrédients disponibles et objectifs. Utilise 2+ modèles, fusionne résultats.

### Agent Vision
Analyse photos assiettes avec BLIP-2 et LLaVA. Croise détections, garde intersection aliments.

### Agent Nutrition
Valide toutes données nutritionnelles. Détecte outliers, vérifie cohérence.

### Agent Coach
Coaching personnalisé et motivation. Utilise modèles conversationnels.

## Validateur Consensus

Compare outputs multi-modèles selon type de tâche :
- Recettes : fusion ingrédients + moyenne temps
- Vision : intersection détections + moyenne quantités  
- Nutrition : moyenne pondérée sans outliers

Retourne toujours score de confiance et signale désaccords.