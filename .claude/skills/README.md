# NutriProfile Claude Agent Skills

Ce dossier contient les **Claude Agent Skills** personnalisés pour le projet NutriProfile, basés sur le [standard ouvert d'Anthropic](https://github.com/anthropics/skills).

## Qu'est-ce qu'un Skill ?

Les Skills sont des dossiers d'instructions, scripts et ressources que Claude charge dynamiquement pour améliorer ses performances sur des tâches spécialisées. Ils étendent les capacités de Claude pour des domaines spécifiques.

## Skills Disponibles

### 🍽️ Domaine Application (Features)

| Skill | Description |
|-------|-------------|
| **nutrition-analyzer** | Analyse des aliments, calculs nutritionnels, page Vision |
| **recipe-generator** | Génération de recettes IA, gestion des ingrédients |
| **ai-coach** | Coaching IA, gamification, achievements, streaks |

### 💻 Développement (Code Quality)

| Skill | Description |
|-------|-------------|
| **test-writer** | Tests Vitest/pytest, coverage 80%+, mocking |
| **i18n-manager** | Traductions 7 langues (FR/EN/DE/ES/PT/ZH/AR) |
| **responsive-design** | Design mobile-first, breakpoints Tailwind |

### 🔧 Infrastructure (DevOps)

| Skill | Description |
|-------|-------------|
| **api-designer** | Design API REST, FastAPI, Pydantic schemas |
| **database-manager** | PostgreSQL, SQLAlchemy async, Alembic migrations |
| **deployment-manager** | Déploiement Fly.io, Cloudflare Pages |

### 🔒 Sécurité & Meta

| Skill | Description |
|-------|-------------|
| **security-auditor** | Audit OWASP Top 10, RGPD, authentification |
| **skill-creator** | Créer de nouveaux skills, format SKILL.md |

## Comment Utiliser les Skills

### Dans Claude Code

Claude activera automatiquement les skills pertinents basé sur votre demande :

```
Vous: "Ajoute une nouvelle traduction pour la page de settings"
Claude: [Active automatiquement i18n-manager] Je vais ajouter les traductions...
```

### Manuellement

Vous pouvez référencer un skill explicitement :

```
Vous: "Utilise le skill test-writer pour créer des tests pour ce composant"
```

## Structure d'un Skill

```
skill-name/
├── SKILL.md          # Requis: Définition principale
├── references/       # Optionnel: Documentation additionnelle
├── scripts/          # Optionnel: Scripts exécutables
└── assets/           # Optionnel: Templates, configs
```

### Format SKILL.md

```yaml
---
name: skill-name
description: Description claire de ce que fait le skill et quand l'utiliser.
allowed-tools: Read,Write,Edit,Grep,Glob,Bash
---

# Titre du Skill

Contenu du skill avec instructions, exemples et bonnes pratiques.
```

## Créer un Nouveau Skill

1. Créer le dossier: `mkdir .claude/skills/mon-skill`
2. Créer SKILL.md avec frontmatter YAML
3. Ajouter le contenu (< 5000 mots recommandé)
4. Tester en demandant à Claude une tâche correspondante

Utilisez le skill `skill-creator` pour de l'aide guidée.

## Bonnes Pratiques

1. **Description claire**: Claude utilise la description pour décider si le skill est pertinent
2. **Contenu focalisé**: Un skill = un domaine spécifique
3. **Exemples pratiques**: Incluez du code et des étapes concrètes
4. **Références externes**: Utilisez `{baseDir}` pour les chemins relatifs
5. **Permissions minimales**: N'incluez que les tools nécessaires

## Référence Anthropic

- [GitHub: anthropics/skills](https://github.com/anthropics/skills)
- [Blog: Introducing Agent Skills](https://claude.com/blog/skills)
- [Engineering: Equipping Agents with Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

## Mise à Jour

Dernière mise à jour: Janvier 2026
Skills créés selon la spécification Anthropic Agent Skills v1.0
