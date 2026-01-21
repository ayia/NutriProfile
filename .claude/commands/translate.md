# Traduction i18n

Ajoute des traductions pour NutriProfile dans les 7 langues supportées.

## Langues Obligatoires

1. **FR** - Français (primary)
2. **EN** - English
3. **DE** - Deutsch
4. **ES** - Español
5. **PT** - Português
6. **ZH** - 中文
7. **AR** - العربية (RTL)

## Étapes

1. Identifier le namespace approprié:
   - `common` - Actions, navigation, unités
   - `vision` - Analyse photo
   - `recipes` - Recettes
   - `dashboard` - Tableau de bord
   - `tracking` - Suivi activité
   - `pricing` - Tarification
   - `auth` - Authentification
   - `settings` - Paramètres

2. Vérifier les clés existantes dans le namespace

3. Ajouter les nouvelles clés dans TOUTES les 7 langues:
   ```
   frontend/src/i18n/locales/
   ├── en/{namespace}.json
   ├── fr/{namespace}.json
   ├── de/{namespace}.json
   ├── es/{namespace}.json
   ├── pt/{namespace}.json
   ├── zh/{namespace}.json
   └── ar/{namespace}.json
   ```

4. Utiliser dans le composant:
   ```tsx
   const { t } = useTranslation('namespace')
   <h1>{t('key')}</h1>
   ```

## Règles

- JAMAIS de texte codé en dur
- Clés descriptives (ex: `editFood.title` pas `t1`)
- Pluralisation avec `_plural` suffix
- Paramètres avec `{{param}}`

## Texte à traduire

$ARGUMENTS
