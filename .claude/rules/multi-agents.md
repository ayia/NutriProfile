---
paths: backend/app/agents/**/*.py, backend/app/llm/**/*.py
---

# Architecture Multi-Agents LLM

## Principe fondamental

Chaque tâche IA est traitée par 2-3 modèles simultanément. Un validateur de consensus sélectionne ou fusionne les meilleurs résultats.

## Modèles Hugging Face à utiliser

Texte : mistralai/Mistral-7B-Instruct-v0.2, meta-llama/Meta-Llama-3-70B-Instruct, mistralai/Mixtral-8x7B-Instruct-v0.1

Vision : Salesforce/blip2-opt-2.7b, llava-hf/llava-1.5-7b-hf

## Structure Agent

Chaque agent doit implémenter :
- process(input, model, context) : Traitement principal
- validate(result) : Validation du résultat
- fallback() : Comportement en cas d'échec

## Consensus

- Recettes : fusion ingrédients communs + moyenne temps
- Vision : intersection aliments détectés + moyenne quantités
- Nutrition : moyenne pondérée avec exclusion outliers

## Règle de confiance

Retourner toujours un score de confiance entre 0 et 1. Si confiance < 0.7, déclencher fallback ou demander clarification utilisateur.