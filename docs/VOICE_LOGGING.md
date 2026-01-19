# Voice Logging - NutriProfile

## Vue d'ensemble

Fonctionnalité de logging vocal permettant aux utilisateurs de **dicter** leurs repas au lieu de les scanner ou de les saisir manuellement.

**Technologies utilisées**:
- **Frontend**: Web Speech API (natif navigateur, GRATUIT, pas d'API externe)
- **Backend**: HuggingFace LLM (Qwen/Qwen2.5-72B-Instruct) pour parsing NLP

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      UTILISATEUR                             │
│                  "J'ai mangé 200g de poulet"                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   WEB SPEECH API (Gratuit)                   │
│              Transcription vocale en temps réel              │
└──────────────────────────┬──────────────────────────────────┘
                           │ Texte transcrit
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend: POST /api/v1/voice/parse-voice         │
│                                                              │
│  VoiceParser → Qwen LLM:                                     │
│  "J'ai mangé 200g de poulet avec du riz"                    │
│                                                              │
│  Parsing structuré:                                          │
│  {                                                           │
│    items: [                                                  │
│      {name: "poulet", quantity: "200", unit: "g"},          │
│      {name: "riz", quantity: "150", unit: "g"}              │
│    ],                                                        │
│    confidence: 0.85                                          │
│  }                                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend: VoiceInput                      │
│                                                              │
│  ✅ Poulet - 200g                     [Edit] [Delete]        │
│  ✅ Riz - 150g                        [Edit] [Delete]        │
│                                                              │
│                 [Ajouter tout au repas]                      │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers créés/modifiés

### Backend

**Créés**:
- `backend/app/schemas/voice.py` - Schémas Pydantic (VoiceInput, ParsedVoiceResponse)
- `backend/app/services/voice_parser.py` - Service de parsing LLM
- `backend/app/api/v1/voice.py` - Endpoint `/voice/parse-voice`

**Modifiés**:
- `backend/app/api/v1/__init__.py` - Enregistrement du router voice

### Frontend

**Créés**:
- `frontend/src/hooks/useSpeechRecognition.ts` - Hook Web Speech API
- `frontend/src/components/vision/VoiceInput.tsx` - Composant principal
- `frontend/docs/VOICE_LOGGING.md` - Documentation (ce fichier)

**Modifiés**:
- `frontend/src/services/visionApi.ts` - Ajout `parseVoice()` API call
- `frontend/src/i18n/locales/{en,fr,de,es,pt,zh,ar}/vision.json` - Traductions (7 langues)

## API Endpoint

### POST /api/v1/voice/parse-voice

**Request**:
```json
{
  "transcription": "J'ai mangé 200g de poulet grillé avec du riz et des brocolis",
  "language": "fr"
}
```

**Response**:
```json
{
  "items": [
    {"name": "poulet grillé", "quantity": "200", "unit": "g"},
    {"name": "riz", "quantity": "150", "unit": "g"},
    {"name": "brocolis", "quantity": "100", "unit": "g"}
  ],
  "confidence": 0.85,
  "raw_text": "J'ai mangé 200g de poulet grillé avec du riz et des brocolis"
}
```

## Utilisation Frontend

```tsx
import { VoiceInput } from '@/components/vision/VoiceInput'

function MyPage() {
  const handleFoodsDetected = (foods: ParsedFoodItem[]) => {
    // Foods est déjà parsé et structuré
    console.log(foods) // [{name, quantity, unit}, ...]
  }

  return (
    <VoiceInput
      onFoodsDetected={handleFoodsDetected}
      onClose={() => console.log('Closed')}
    />
  )
}
```

## Hook useSpeechRecognition

```tsx
const {
  isListening,      // boolean: en train d'écouter?
  transcript,       // string: texte transcrit en temps réel
  error,            // string | null: erreur (permissionDenied, noSpeechDetected...)
  isSupported,      // boolean: navigateur supporte Web Speech API?
  startListening,   // () => void
  stopListening,    // () => void
  resetTranscript,  // () => void
} = useSpeechRecognition()
```

## Langues supportées

- **Frontend** (Web Speech API): Toutes les langues du navigateur
  - Français: `fr-FR`
  - Anglais: `en-US`
  - Allemand: `de-DE`
  - Espagnol: `es-ES`
  - Portugais: `pt-PT`
  - Chinois: `zh-CN`
  - Arabe: `ar-SA`

- **Backend** (Qwen LLM): Multilingue, pas de configuration spéciale

## Parsing LLM (Backend)

Le service `VoiceParser` utilise **Qwen/Qwen2.5-72B-Instruct** pour extraire les aliments du texte.

**Prompt Structure**:
```
Tu es un assistant nutritionnel expert. Analyse cette phrase et extrais les aliments.

Phrase: "J'ai mangé 200g de poulet avec du riz"

INSTRUCTIONS:
1. Identifie TOUS les aliments
2. Extrais: name, quantity, unit
3. Si quantité manquante, estime une portion typique
4. Retourne JSON uniquement

Output:
{
  "items": [
    {"name": "poulet", "quantity": "200", "unit": "g"},
    {"name": "riz", "quantity": "150", "unit": "g"}
  ]
}
```

**Fallback**: Si le LLM échoue, parsing par regex basique.

## Gestion des erreurs

### Frontend (Web Speech API)

| Erreur | Message i18n | Cause |
|--------|--------------|-------|
| `not-allowed` | `permissionDenied` | Micro refusé par user |
| `no-speech` | `noSpeechDetected` | Aucun son détecté |
| `network` | `networkError` | Pas de connexion |

### Backend (LLM Parsing)

- **LLM timeout/erreur**: Fallback vers parsing regex
- **JSON invalide**: Fallback vers parsing regex
- **Aucun aliment trouvé**: `confidence: 0.3`, liste vide

## Compatibilité navigateurs

| Navigateur | Support Web Speech API |
|------------|------------------------|
| Chrome | ✅ Excellent |
| Edge | ✅ Excellent |
| Safari | ✅ Bon (iOS 14.5+) |
| Firefox | ❌ Pas supporté |
| Opera | ✅ Bon |

**Note**: L'application détecte automatiquement si le navigateur supporte l'API et affiche un message approprié.

## Coûts

- **Web Speech API**: GRATUIT (natif navigateur)
- **Qwen LLM**: Inclus dans HuggingFace (pas de surcoût, déjà configuré)

## Flow utilisateur

1. User clique sur "🎤 Dicter" dans VisionPage
2. Permission micro demandée (1ère fois)
3. User parle: "J'ai mangé 200g de poulet avec du riz"
4. Transcription affichée en temps réel
5. Après 2s de silence → Auto-envoi au backend
6. Backend parse via Qwen LLM
7. Affichage des aliments détectés:
   - ✅ Poulet 200g [Edit] [Delete]
   - ✅ Riz 150g [Edit] [Delete]
8. User peut modifier chaque item (nom, quantité, unité)
9. User clique "Ajouter tout au repas"
10. Aliments ajoutés → Calcul nutrition automatique

## Exemples de transcriptions

### Français
- "J'ai mangé 200g de poulet grillé avec du riz et des brocolis"
- "Un sandwich jambon fromage et une pomme"
- "Petit-déjeuner: 2 œufs, une tartine de pain complet avec du beurre"

### Anglais
- "I ate 200g of grilled chicken with rice and broccoli"
- "A ham and cheese sandwich and an apple"
- "Breakfast: 2 eggs, a slice of whole wheat bread with butter"

### Espagnol
- "He comido 200g de pollo a la parrilla con arroz y brócoli"
- "Un sándwich de jamón y queso y una manzana"

## Tests

```bash
# Backend
cd backend
pytest app/services/test_voice_parser.py

# Frontend
cd frontend
npm test -- VoiceInput
```

## Prochaines améliorations

- [ ] Support offline (Web Speech API en mode offline)
- [ ] Historique des transcriptions vocales
- [ ] Suggestions basées sur l'historique
- [ ] Support multi-phrases (plusieurs repas en une fois)
- [ ] Amélioration du prompt LLM pour mieux gérer les plats composés

## Maintenance

### Mise à jour du prompt LLM

Modifier `backend/app/services/voice_parser.py`, méthode `_build_french_prompt()` ou `_build_english_prompt()`.

### Ajout d'une nouvelle langue

1. Ajouter la clé de langue dans `getLangCode()` (frontend/src/hooks/useSpeechRecognition.ts)
2. Ajouter la traduction dans `frontend/src/i18n/locales/{lang}/vision.json`
3. Ajouter le prompt LLM correspondant dans `voice_parser.py`

---

**Dernière mise à jour**: Janvier 2026
**Statut**: ✅ Implémenté et fonctionnel
