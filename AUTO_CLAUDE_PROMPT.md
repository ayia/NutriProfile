# Prompt pour Auto Claude - NutriProfile Vision Editing Feature

## 🎯 Objectif Principal

Implémenter la fonctionnalité d'édition des aliments détectés après scan dans la section Vision de NutriProfile. Le système doit permettre à l'utilisateur de corriger les aliments mal identifiés par l'IA (exemple: "riz" détecté alors que ce sont des "pâtes"), puis recalculer automatiquement les valeurs nutritionnelles en fonction du nouvel aliment et de la quantité spécifiée.

---

## 📋 Contexte du Projet

### Stack Technique
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Python 3.11+ + FastAPI + SQLAlchemy 2.0 async + PostgreSQL
- **IA**: Hugging Face Inference API (Qwen/Qwen2.5-VL-72B-Instruct pour vision)
- **i18n**: react-i18next (7 langues: FR, EN, DE, ES, PT, ZH, AR)
- **État**: Zustand + React Query
- **Déploiement**: Frontend sur Cloudflare Pages, Backend sur Fly.io

### Système Freemium Actif
- **Free**: 3 analyses photo/jour
- **Premium**: Analyses illimitées
- **Trial**: 7 jours Premium gratuits à l'inscription

---

## 🔍 État Actuel du Système

### ✅ Backend Complètement Implémenté

Les endpoints API existent déjà et fonctionnent:

```python
# backend/app/api/v1/vision.py

PATCH /api/v1/vision/items/{item_id}  (lignes 690-738)
  → Met à jour un FoodItem individuel
  → Paramètres: name, quantity, unit, calories, protein, carbs, fat, fiber
  → Marque automatiquement: source="manual", user_corrected=True
  → Recalcule les totaux du FoodLog parent
  → Met à jour DailyNutrition

POST /api/v1/vision/logs/{log_id}/items  (lignes 644-687)
  → Ajoute un nouvel aliment à un repas existant
  → Recalcule totaux automatiquement

DELETE /api/v1/vision/items/{item_id}  (lignes 741-776)
  → Supprime un aliment
  → Recalcule totaux automatiquement
```

**Modèles de données (backend/app/models/food_log.py)**:
```python
class FoodItem:
  id: int
  food_log_id: int
  name: str                    # Nom de l'aliment
  quantity: str                # Quantité numérique
  unit: str                    # "g", "ml", "portion", "piece"
  calories: int | null
  protein: float | null
  carbs: float | null
  fat: float | null
  fiber: float | null
  source: str                  # "ai", "manual", "database"
  confidence: float | null
  is_verified: bool

class FoodLog:
  user_corrected: bool         # Flag si correction utilisateur
  corrected_items: JSON        # Historique des corrections
  items: List[FoodItem]        # Relation cascade
```

### ❌ Frontend À Implémenter

**Fichiers concernés**:

1. **`frontend/src/components/vision/AnalysisResult.tsx`** (lignes 97-104)
   - Actuellement: Commentaire TODO
   - Besoin: Modal/form d'édition d'aliment
   - Affiche après scan initial (avant sauvegarde du log)

2. **`frontend/src/components/vision/FoodLogCard.tsx`** (lignes 146-149)
   - Actuellement: Pas de bouton Edit
   - Besoin: Modal/form d'édition sur repas sauvegardés
   - Affiche dans l'historique (tabs "Today" et "History")

3. **`frontend/src/services/visionApi.ts`**
   - ✅ Méthodes déjà disponibles:
     - `updateItem(itemId, data)`
     - `addItem(logId, data)`
     - `deleteItem(itemId)`

---

## 🎨 Spécifications UX/UI

### Flow Utilisateur

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        SCÉNARIO PRINCIPAL                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User scanne un repas avec son téléphone                             │
│  2. IA détecte: "Riz (200g)", "Poulet (150g)", "Brocoli (100g)"         │
│  3. User voit que "Riz" est incorrect → ce sont des PÂTES               │
│  4. User clique sur "Riz" dans la liste des aliments détectés           │
│  5. Modal d'édition s'ouvre avec:                                        │
│     ┌────────────────────────────────────────────────────────┐          │
│     │ Modifier l'aliment                                     │          │
│     ├────────────────────────────────────────────────────────┤          │
│     │ Nom: [Riz ▼] → User tape "Pâtes"                      │          │
│     │ Quantité: [200]                                        │          │
│     │ Unité: [g ▼] (options: g, ml, portion, piece)         │          │
│     │                                                        │          │
│     │ 💡 Nutrition (auto-calculée):                         │          │
│     │   Calories: 260 kcal                                  │          │
│     │   Protéines: 9g                                       │          │
│     │   Glucides: 53g                                       │          │
│     │   Lipides: 1g                                         │          │
│     │                                                        │          │
│     │ [Annuler]  [Sauvegarder ✓]                           │          │
│     └────────────────────────────────────────────────────────┘          │
│  6. User clique "Sauvegarder"                                           │
│  7. API call: PATCH /vision/items/{item_id}                             │
│  8. Backend recalcule les totaux du repas                               │
│  9. Frontend met à jour l'affichage avec les nouvelles valeurs          │
│ 10. Badge "Corrigé par l'utilisateur" affiché sur l'aliment             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Design Requirements

#### 1. Bouton d'édition sur chaque aliment
```tsx
// Dans AnalysisResult.tsx et FoodLogCard.tsx
<div className="flex items-center justify-between">
  <span>{item.name} ({item.quantity}{item.unit})</span>
  <div className="flex gap-2">
    <button onClick={() => handleEditItem(item)}>
      <Pencil className="w-4 h-4" />
    </button>
    {canDelete && (
      <button onClick={() => handleDeleteItem(item.id)}>
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
</div>
```

#### 2. Modal d'édition (shadcn/ui Dialog)
- **Champs requis**:
  - Nom (Input + suggestions intelligentes)
  - Quantité (Number input)
  - Unité (Select: g, ml, portion, piece, cup, tbsp)
- **Nutrition preview** (lecture seule, calculée automatiquement)
- **Validation**: Nom non vide, Quantité > 0
- **Responsive**: Full-screen sur mobile (<768px)

#### 3. Calcul nutritionnel automatique

**Source de données**: Table de référence nutritionnelle dans `backend/app/agents/vision.py` (lignes 352-380)

```python
NUTRITION_REFERENCE = {
    "riz": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3},
    "pâtes": {"calories": 131, "protein": 5, "carbs": 25, "fat": 1.1},
    "poulet": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6},
    # ... 20+ aliments
}
```

**Logique frontend**:
```typescript
function calculateNutrition(foodName: string, quantity: number, unit: string) {
  const reference = NUTRITION_DB[foodName.toLowerCase()] || DEFAULT_VALUES
  const portionSize = convertToGrams(quantity, unit)
  const factor = portionSize / 100

  return {
    calories: Math.round(reference.calories * factor),
    protein: (reference.protein * factor).toFixed(1),
    carbs: (reference.carbs * factor).toFixed(1),
    fat: (reference.fat * factor).toFixed(1)
  }
}
```

#### 4. Suggestions d'aliments (autocomplete)

Utiliser une liste d'aliments communs (top 50-100) pour l'autocomplete:
```typescript
const COMMON_FOODS = [
  "Riz", "Pâtes", "Pain", "Pommes de terre", "Quinoa",
  "Poulet", "Bœuf", "Poisson", "Œufs", "Tofu",
  "Brocoli", "Carottes", "Tomates", "Salade", "Épinards",
  // ... etc.
]
```

#### 5. États visuels

```tsx
// Badge si corrigé
{item.source === 'manual' && (
  <Badge variant="secondary" className="text-xs">
    <CheckCircle2 className="w-3 h-3 mr-1" />
    {t('vision.userCorrected')}
  </Badge>
)}

// Confidence score si IA
{item.source === 'ai' && item.confidence && (
  <span className="text-xs text-gray-500">
    {Math.round(item.confidence * 100)}% confiance
  </span>
)}
```

---

## 🚀 Tâches Détaillées

### Phase 1: Composant d'édition réutilisable

**Créer**: `frontend/src/components/vision/EditFoodItemModal.tsx`

```typescript
interface EditFoodItemModalProps {
  item: FoodItem | null  // null = modal fermé
  onClose: () => void
  onSave: (updatedItem: FoodItemUpdate) => Promise<void>
  isLoading: boolean
}

export function EditFoodItemModal({ item, onClose, onSave, isLoading }: EditFoodItemModalProps) {
  const { t } = useTranslation('vision')
  const [formData, setFormData] = useState<FoodItemUpdate>({
    name: item?.name || '',
    quantity: item?.quantity || '',
    unit: item?.unit || 'g',
  })
  const [nutrition, setNutrition] = useState<NutritionValues | null>(null)

  // Recalculer nutrition quand formData change
  useEffect(() => {
    if (formData.name && formData.quantity) {
      const calculated = calculateNutrition(
        formData.name,
        parseFloat(formData.quantity),
        formData.unit
      )
      setNutrition(calculated)
      setFormData(prev => ({ ...prev, ...calculated }))
    }
  }, [formData.name, formData.quantity, formData.unit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('vision.editFood')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom avec autocomplete */}
          <div>
            <Label>{t('vision.foodName')}</Label>
            <AutocompleteInput
              value={formData.name}
              onChange={(val) => setFormData({...formData, name: val})}
              suggestions={COMMON_FOODS}
              placeholder={t('vision.foodNamePlaceholder')}
            />
          </div>

          {/* Quantité et unité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('vision.quantity')}</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                min="0"
                step="any"
              />
            </div>
            <div>
              <Label>{t('vision.unit')}</Label>
              <Select
                value={formData.unit}
                onValueChange={(val) => setFormData({...formData, unit: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="portion">{t('vision.portion')}</SelectItem>
                  <SelectItem value="piece">{t('vision.piece')}</SelectItem>
                  <SelectItem value="cup">{t('vision.cup')}</SelectItem>
                  <SelectItem value="tbsp">{t('vision.tablespoon')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prévisualisation nutrition */}
          {nutrition && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                💡 {t('vision.nutritionPreview')}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">{t('common.calories')}:</span>
                  <span className="ml-2 font-medium">{nutrition.calories} kcal</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('common.protein')}:</span>
                  <span className="ml-2 font-medium">{nutrition.protein}g</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('common.carbs')}:</span>
                  <span className="ml-2 font-medium">{nutrition.carbs}g</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('common.fat')}:</span>
                  <span className="ml-2 font-medium">{nutrition.fat}g</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t('common.saving')}</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{t('common.save')}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Phase 2: Intégration dans AnalysisResult.tsx

**Modifier**: `frontend/src/components/vision/AnalysisResult.tsx` (lignes 97-104)

```typescript
import { EditFoodItemModal } from './EditFoodItemModal'
import { visionApi } from '@/services/api'

export function AnalysisResult({ analysis, onSave, onBack }: AnalysisResultProps) {
  // ... code existant ...

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)

  // Mutation pour update item (avant sauvegarde du log)
  const updateItemMutation = useMutation({
    mutationFn: async (data: { itemIndex: number; update: FoodItemUpdate }) => {
      // Mettre à jour localement dans analysis
      const updatedItems = [...analysis.items]
      updatedItems[data.itemIndex] = { ...updatedItems[data.itemIndex], ...data.update }

      // Recalculer totaux
      const newTotals = calculateTotals(updatedItems)

      return { items: updatedItems, ...newTotals }
    },
    onSuccess: (data) => {
      // Mettre à jour l'état local
      setAnalysis((prev) => ({ ...prev, ...data }))
      setEditingItem(null)
      toast.success(t('vision.itemUpdated'))
    }
  })

  const handleEditItem = (item: FoodItem, index: number) => {
    setEditingItem({ ...item, _index: index })
  }

  const handleSaveEdit = async (update: FoodItemUpdate) => {
    if (!editingItem) return
    await updateItemMutation.mutateAsync({
      itemIndex: editingItem._index,
      update
    })
  }

  return (
    <>
      {/* Liste des aliments avec bouton edit */}
      <div className="space-y-2">
        {analysis.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">
                {item.quantity}{item.unit} • {item.calories} kcal
              </p>
            </div>
            <button
              onClick={() => handleEditItem(item, index)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal d'édition */}
      <EditFoodItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        isLoading={updateItemMutation.isPending}
      />
    </>
  )
}
```

### Phase 3: Intégration dans FoodLogCard.tsx

**Modifier**: `frontend/src/components/vision/FoodLogCard.tsx` (lignes 146-149)

```typescript
import { EditFoodItemModal } from './EditFoodItemModal'

export function FoodLogCard({ log }: FoodLogCardProps) {
  const { t } = useTranslation('vision')
  const queryClient = useQueryClient()

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [expanded, setExpanded] = useState(false)

  // Mutation pour update item (après sauvegarde)
  const updateItemMutation = useMutation({
    mutationFn: async (data: FoodItemUpdate) => {
      if (!editingItem?.id) throw new Error('No item ID')
      return await visionApi.updateItem(editingItem.id, data)
    },
    onSuccess: () => {
      // Invalider les queries pour refetch
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
      queryClient.invalidateQueries({ queryKey: ['dailyMeals'] })
      setEditingItem(null)
      toast.success(t('vision.itemUpdated'))
    },
    onError: (error) => {
      toast.error(t('vision.updateError'))
      console.error('Update error:', error)
    }
  })

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item)
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm(t('vision.confirmDeleteItem'))) return

    try {
      await visionApi.deleteItem(itemId)
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
      queryClient.invalidateQueries({ queryKey: ['dailyMeals'] })
      toast.success(t('vision.itemDeleted'))
    } catch (error) {
      toast.error(t('vision.deleteError'))
    }
  }

  return (
    <div className="glass-card p-4">
      {/* Header avec meal type et totaux */}
      <div className="flex items-center justify-between mb-4">
        {/* ... code existant ... */}
      </div>

      {/* Détails expandable */}
      {expanded && (
        <div className="mt-4 space-y-2">
          {log.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity}{item.unit} • {item.calories} kcal
                </p>
                {item.source === 'manual' && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {t('vision.userCorrected')}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'édition */}
      <EditFoodItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(data) => updateItemMutation.mutateAsync(data)}
        isLoading={updateItemMutation.isPending}
      />
    </div>
  )
}
```

### Phase 4: Table de référence nutritionnelle

**Créer**: `frontend/src/data/nutritionReference.ts`

```typescript
// Copier depuis backend/app/agents/vision.py (lignes 352-380)
export const NUTRITION_REFERENCE: Record<string, NutritionValues> = {
  "riz": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  "pâtes": { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  "pain": { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  "pommes de terre": { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  "quinoa": { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  "poulet": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  "bœuf": { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  "poisson": { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 },
  "œufs": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  "tofu": { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  "brocoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  "carottes": { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  "tomates": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  "salade": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  "épinards": { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  // ... etc.
}

// Liste pour autocomplete
export const COMMON_FOODS = Object.keys(NUTRITION_REFERENCE).sort()

// Valeurs par défaut si aliment inconnu
export const DEFAULT_NUTRITION = {
  calories: 100,
  protein: 3,
  carbs: 15,
  fat: 3,
  fiber: 1
}

export function calculateNutrition(
  foodName: string,
  quantity: number,
  unit: string
): NutritionValues {
  const reference = NUTRITION_REFERENCE[foodName.toLowerCase()] || DEFAULT_NUTRITION
  const portionGrams = convertToGrams(quantity, unit)
  const factor = portionGrams / 100

  return {
    calories: Math.round(reference.calories * factor),
    protein: parseFloat((reference.protein * factor).toFixed(1)),
    carbs: parseFloat((reference.carbs * factor).toFixed(1)),
    fat: parseFloat((reference.fat * factor).toFixed(1)),
    fiber: parseFloat((reference.fiber * factor).toFixed(1))
  }
}

function convertToGrams(quantity: number, unit: string): number {
  const conversions: Record<string, number> = {
    'g': 1,
    'ml': 1,
    'portion': 150,
    'piece': 100,
    'cup': 240,
    'tbsp': 15,
    'tsp': 5
  }
  return quantity * (conversions[unit] || 100)
}
```

### Phase 5: Traductions i18n

**Ajouter dans**: `frontend/src/i18n/locales/{lang}/vision.json`

```json
{
  "editFood": "Modifier l'aliment",
  "foodName": "Nom de l'aliment",
  "foodNamePlaceholder": "Ex: Pâtes, Poulet, Brocoli...",
  "quantity": "Quantité",
  "unit": "Unité",
  "portion": "Portion",
  "piece": "Pièce",
  "cup": "Tasse",
  "tablespoon": "Cuillère à soupe",
  "nutritionPreview": "Aperçu nutritionnel",
  "itemUpdated": "Aliment mis à jour avec succès",
  "updateError": "Erreur lors de la mise à jour",
  "userCorrected": "Corrigé par l'utilisateur",
  "confirmDeleteItem": "Voulez-vous vraiment supprimer cet aliment ?",
  "itemDeleted": "Aliment supprimé avec succès",
  "deleteError": "Erreur lors de la suppression"
}
```

**Ajouter pour TOUTES les 7 langues**: FR, EN, DE, ES, PT, ZH, AR

---

## ✅ Critères d'Acceptation

### Fonctionnel
- [ ] L'utilisateur peut cliquer sur un aliment détecté pour l'éditer
- [ ] Le modal d'édition affiche les valeurs actuelles
- [ ] L'autocomplete suggère des aliments courants
- [ ] La nutrition est recalculée automatiquement en temps réel
- [ ] Les totaux du repas sont mis à jour après sauvegarde
- [ ] Le badge "Corrigé par l'utilisateur" s'affiche correctement
- [ ] L'édition fonctionne aussi bien dans AnalysisResult que FoodLogCard
- [ ] La suppression d'aliment recalcule les totaux
- [ ] Les limites freemium sont respectées (pas de re-scan = pas de crédit consommé)

### Technique
- [ ] Code TypeScript strict (pas de `any`)
- [ ] Validation Zod des formulaires
- [ ] Gestion d'erreur avec try/catch et toasts
- [ ] React Query pour cache invalidation
- [ ] Tests de mutation optimistes si possible
- [ ] Pas de console.log en production

### UX/UI
- [ ] Modal responsive (full-screen mobile < 768px)
- [ ] Animations fluides (transitions Tailwind)
- [ ] Loading states pendant les mutations
- [ ] Messages de succès/erreur clairs
- [ ] Accessible (keyboard navigation, ARIA labels)

### i18n
- [ ] Toutes les chaînes traduites dans les 7 langues
- [ ] Suggestions d'aliments traduites (ou multilingue)
- [ ] Format des nombres selon la locale

---

## 🚨 Points d'Attention

### 1. Recalcul des Totaux
Le backend recalcule automatiquement les totaux du `FoodLog` après chaque modification d'item (lignes 717-727 de vision.py). Le frontend doit invalider les queries pour refetch:
```typescript
queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
queryClient.invalidateQueries({ queryKey: ['dailyMeals'] })
```

### 2. Source Tracking
Dès qu'un item est modifié:
- `source` passe de `"ai"` à `"manual"`
- `user_corrected` passe à `True` sur le FoodLog parent
- Le badge doit s'afficher immédiatement

### 3. Limites Freemium
**Important**: L'édition d'un aliment NE consomme PAS de crédit d'analyse. Seul l'appel initial à `/vision/analyze` consomme un crédit.

### 4. Table Nutritionnelle
La table frontend doit être synchronisée avec celle du backend (vision.py lignes 352-380). Envisager de créer un endpoint API dédié pour centraliser cette donnée.

### 5. Responsive Design
Le projet suit une approche **mobile-first**. Le modal doit être:
- Full-screen sur mobile (max-width < 768px)
- Dialog centré sur desktop
- Touch-friendly (boutons minimum 44x44px)

---

## 📝 Livrables Attendus

1. **Composant**: `EditFoodItemModal.tsx` (complet, testé, responsive)
2. **Intégration**: Modifications dans `AnalysisResult.tsx`
3. **Intégration**: Modifications dans `FoodLogCard.tsx`
4. **Données**: `nutritionReference.ts` avec table complète
5. **Traductions**: Fichiers i18n mis à jour pour les 7 langues
6. **Tests**: Tests unitaires pour `calculateNutrition()` et le composant modal
7. **Documentation**: README mis à jour avec exemples d'utilisation

---

## 🔗 Références

### Fichiers Clés à Consulter
- Backend API: `backend/app/api/v1/vision.py`
- Modèles: `backend/app/models/food_log.py`
- Vision Agent: `backend/app/agents/vision.py`
- API Service: `frontend/src/services/visionApi.ts`
- Types: `frontend/src/types/foodLog.ts`
- Page Vision: `frontend/src/pages/VisionPage.tsx`

### Documentation Externe
- shadcn/ui Dialog: https://ui.shadcn.com/docs/components/dialog
- React Query Mutations: https://tanstack.com/query/latest/docs/react/guides/mutations
- react-i18next: https://react.i18next.com/

---

## 🎯 Objectif Final

À la fin de cette implémentation, l'utilisateur doit pouvoir:
1. Scanner un repas avec l'IA
2. Voir les aliments détectés
3. Corriger instantanément tout aliment mal identifié
4. Voir la nutrition recalculée automatiquement
5. Sauvegarder le repas avec les corrections
6. Retrouver ses corrections dans l'historique avec le badge "Corrigé"

Cette feature améliore drastiquement l'expérience utilisateur en donnant le contrôle sur la précision des données nutritionnelles, tout en conservant la rapidité de l'analyse IA.

---

**Bon courage ! 🚀**
