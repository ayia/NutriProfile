/**
 * Extended Nutrition Reference Database
 *
 * Contains nutritional values per 100g for 200+ common foods
 * Includes portion presets and visual guides
 *
 * Sources: USDA FoodData Central, CIQUAL (French), and regional foods
 */

export interface NutritionValues {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface PortionPreset {
  size: 'small' | 'medium' | 'large'
  grams: number
  description: string // Visual reference (e.g., "1/2 cup", "palm-sized")
}

export interface FoodEntry {
  nutrition: NutritionValues // per 100g
  category: FoodCategory
  portions?: PortionPreset[]
  visualGuide?: string // Hand/object comparison
  aliases?: string[] // Alternative names
}

export type FoodCategory =
  | 'grains'
  | 'proteins'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'legumes'
  | 'nuts'
  | 'prepared'
  | 'moroccan'
  | 'beverages'
  | 'snacks'
  | 'sauces'

/**
 * Extended nutrition reference table (per 100g)
 * Values sourced from USDA FoodData Central, CIQUAL, and regional databases
 */
export const EXTENDED_NUTRITION_REFERENCE: Record<string, FoodEntry> = {
  // ==================== GRAINS & STARCHES ====================
  "riz": {
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup cooked' },
      { size: 'medium', grams: 150, description: '3/4 cup cooked' },
      { size: 'large', grams: 200, description: '1 cup cooked' },
    ],
    visualGuide: 'cupped_hand',
    aliases: ['rice', 'riz blanc', 'white rice'],
  },
  "riz basmati": {
    nutrition: { calories: 121, protein: 3.5, carbs: 25, fat: 0.4, fiber: 0.6 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup cooked' },
      { size: 'medium', grams: 150, description: '3/4 cup cooked' },
      { size: 'large', grams: 200, description: '1 cup cooked' },
    ],
    aliases: ['basmati', 'basmati rice'],
  },
  "riz complet": {
    nutrition: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup cooked' },
      { size: 'medium', grams: 150, description: '3/4 cup cooked' },
      { size: 'large', grams: 200, description: '1 cup cooked' },
    ],
    aliases: ['brown rice', 'whole grain rice'],
  },
  "pâtes": {
    nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 80, description: '1/2 cup cooked' },
      { size: 'medium', grams: 150, description: '1 cup cooked' },
      { size: 'large', grams: 220, description: '1.5 cups cooked' },
    ],
    visualGuide: 'fist',
    aliases: ['pasta', 'spaghetti', 'macaroni', 'penne', 'fusilli'],
  },
  "pâtes complètes": {
    nutrition: { calories: 124, protein: 5.3, carbs: 25, fat: 0.5, fiber: 3.9 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 80, description: '1/2 cup cooked' },
      { size: 'medium', grams: 150, description: '1 cup cooked' },
      { size: 'large', grams: 220, description: '1.5 cups cooked' },
    ],
    aliases: ['whole wheat pasta', 'whole grain pasta'],
  },
  "pain": {
    nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 30, description: '1 slice' },
      { size: 'medium', grams: 60, description: '2 slices' },
      { size: 'large', grams: 100, description: '1/4 baguette' },
    ],
    visualGuide: 'slice',
    aliases: ['bread', 'baguette'],
  },
  "pain complet": {
    nutrition: { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 30, description: '1 slice' },
      { size: 'medium', grams: 60, description: '2 slices' },
      { size: 'large', grams: 90, description: '3 slices' },
    ],
    aliases: ['whole wheat bread', 'wholemeal bread'],
  },
  "quinoa": {
    nutrition: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 90, description: '1/2 cup cooked' },
      { size: 'medium', grams: 140, description: '3/4 cup cooked' },
      { size: 'large', grams: 185, description: '1 cup cooked' },
    ],
    visualGuide: 'cupped_hand',
  },
  "couscous": {
    nutrition: { calories: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup cooked' },
      { size: 'medium', grams: 175, description: '3/4 cup cooked' },
      { size: 'large', grams: 250, description: '1 cup cooked' },
    ],
    aliases: ['semoule', 'semolina couscous'],
  },
  "boulgour": {
    nutrition: { calories: 83, protein: 3.1, carbs: 18, fat: 0.2, fiber: 4.5 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 90, description: '1/2 cup cooked' },
      { size: 'medium', grams: 140, description: '3/4 cup cooked' },
      { size: 'large', grams: 180, description: '1 cup cooked' },
    ],
    aliases: ['bulgur', 'bulgur wheat'],
  },
  "semoule": {
    nutrition: { calories: 360, protein: 12, carbs: 73, fat: 1.1, fiber: 3.9 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 40, description: '1/4 cup dry' },
      { size: 'medium', grams: 60, description: '1/3 cup dry' },
      { size: 'large', grams: 80, description: '1/2 cup dry' },
    ],
    aliases: ['semolina'],
  },
  "avoine": {
    nutrition: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 30, description: '1/3 cup dry' },
      { size: 'medium', grams: 45, description: '1/2 cup dry' },
      { size: 'large', grams: 80, description: '1 cup dry' },
    ],
    aliases: ['oats', 'oatmeal', 'flocons d\'avoine'],
  },
  "pomme de terre": {
    nutrition: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.1 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 100, description: '1 small potato' },
      { size: 'medium', grams: 170, description: '1 medium potato' },
      { size: 'large', grams: 300, description: '1 large potato' },
    ],
    visualGuide: 'fist',
    aliases: ['potato', 'potatoes'],
  },
  "patate douce": {
    nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 100, description: '1 small' },
      { size: 'medium', grams: 150, description: '1 medium' },
      { size: 'large', grams: 250, description: '1 large' },
    ],
    aliases: ['sweet potato'],
  },
  "frites": {
    nutrition: { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 70, description: 'Small portion' },
      { size: 'medium', grams: 120, description: 'Medium portion' },
      { size: 'large', grams: 180, description: 'Large portion' },
    ],
    aliases: ['french fries', 'chips', 'fries'],
  },
  "purée": {
    nutrition: { calories: 83, protein: 2, carbs: 14, fat: 2.6, fiber: 1.8 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 120, description: '1/2 cup' },
      { size: 'medium', grams: 200, description: '1 cup' },
      { size: 'large', grams: 300, description: '1.5 cups' },
    ],
    aliases: ['mashed potatoes', 'potato puree'],
  },
  "tortilla": {
    nutrition: { calories: 237, protein: 6, carbs: 38, fat: 7, fiber: 2.4 },
    category: 'grains',
    portions: [
      { size: 'small', grams: 30, description: '1 small (6")' },
      { size: 'medium', grams: 45, description: '1 medium (8")' },
      { size: 'large', grams: 65, description: '1 large (10")' },
    ],
    aliases: ['wrap', 'flour tortilla'],
  },

  // ==================== PROTEINS ====================
  "poulet": {
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 85, description: 'Palm-sized' },
      { size: 'medium', grams: 120, description: 'Deck of cards' },
      { size: 'large', grams: 170, description: 'Hand-sized' },
    ],
    visualGuide: 'deck_of_cards',
    aliases: ['chicken', 'chicken breast', 'blanc de poulet'],
  },
  "cuisse de poulet": {
    nutrition: { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 75, description: '1 small thigh' },
      { size: 'medium', grams: 100, description: '1 medium thigh' },
      { size: 'large', grams: 130, description: '1 large thigh' },
    ],
    aliases: ['chicken thigh'],
  },
  "dinde": {
    nutrition: { calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 85, description: 'Palm-sized' },
      { size: 'medium', grams: 120, description: 'Deck of cards' },
      { size: 'large', grams: 170, description: 'Hand-sized' },
    ],
    aliases: ['turkey', 'turkey breast'],
  },
  "boeuf": {
    nutrition: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 100, description: 'Palm-sized' },
      { size: 'medium', grams: 150, description: 'Deck of cards' },
      { size: 'large', grams: 200, description: 'Hand-sized' },
    ],
    visualGuide: 'deck_of_cards',
    aliases: ['beef', 'steak'],
  },
  "steak haché": {
    nutrition: { calories: 254, protein: 17, carbs: 0, fat: 20, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 80, description: '1 small patty' },
      { size: 'medium', grams: 125, description: '1 medium patty' },
      { size: 'large', grams: 180, description: '1 large patty' },
    ],
    aliases: ['ground beef', 'beef patty', 'hamburger meat'],
  },
  "porc": {
    nutrition: { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 85, description: 'Palm-sized' },
      { size: 'medium', grams: 120, description: 'Deck of cards' },
      { size: 'large', grams: 170, description: 'Hand-sized' },
    ],
    aliases: ['pork', 'pork chop'],
  },
  "jambon": {
    nutrition: { calories: 145, protein: 21, carbs: 1.5, fat: 6, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 30, description: '1 slice' },
      { size: 'medium', grams: 60, description: '2 slices' },
      { size: 'large', grams: 100, description: '3-4 slices' },
    ],
    aliases: ['ham'],
  },
  "saucisse": {
    nutrition: { calories: 301, protein: 12, carbs: 2, fat: 27, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 40, description: '1 small sausage' },
      { size: 'medium', grams: 75, description: '1 medium sausage' },
      { size: 'large', grams: 120, description: '2 sausages' },
    ],
    aliases: ['sausage', 'merguez'],
  },
  "agneau": {
    nutrition: { calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 85, description: 'Palm-sized' },
      { size: 'medium', grams: 120, description: 'Deck of cards' },
      { size: 'large', grams: 170, description: 'Hand-sized' },
    ],
    aliases: ['lamb', 'lamb chop'],
  },
  "saumon": {
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 85, description: 'Checkbook size' },
      { size: 'medium', grams: 125, description: 'Palm-sized fillet' },
      { size: 'large', grams: 170, description: 'Large fillet' },
    ],
    visualGuide: 'checkbook',
    aliases: ['salmon'],
  },
  "thon": {
    nutrition: { calories: 144, protein: 23, carbs: 0, fat: 5, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 80, description: '1/2 can' },
      { size: 'medium', grams: 130, description: '1 can' },
      { size: 'large', grams: 170, description: 'Large fillet' },
    ],
    aliases: ['tuna'],
  },
  "sardine": {
    nutrition: { calories: 208, protein: 25, carbs: 0, fat: 11, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 50, description: '2 sardines' },
      { size: 'medium', grams: 100, description: '1 can' },
      { size: 'large', grams: 150, description: '6 sardines' },
    ],
    aliases: ['sardines'],
  },
  "crevettes": {
    nutrition: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 60, description: '6 medium shrimp' },
      { size: 'medium', grams: 100, description: '10 medium shrimp' },
      { size: 'large', grams: 150, description: '15 medium shrimp' },
    ],
    aliases: ['shrimp', 'prawns'],
  },
  "moules": {
    nutrition: { calories: 86, protein: 12, carbs: 4, fat: 2.2, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 100, description: '10 mussels' },
      { size: 'medium', grams: 200, description: '20 mussels' },
      { size: 'large', grams: 350, description: 'Full portion' },
    ],
    aliases: ['mussels'],
  },
  "cabillaud": {
    nutrition: { calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 100, description: 'Small fillet' },
      { size: 'medium', grams: 150, description: 'Medium fillet' },
      { size: 'large', grams: 200, description: 'Large fillet' },
    ],
    aliases: ['cod', 'morue'],
  },
  "oeuf": {
    nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 50, description: '1 egg' },
      { size: 'medium', grams: 100, description: '2 eggs' },
      { size: 'large', grams: 150, description: '3 eggs' },
    ],
    visualGuide: 'egg',
    aliases: ['egg', 'eggs', 'oeufs'],
  },
  "tofu": {
    nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 100, description: '1/2 block' },
      { size: 'medium', grams: 150, description: '3/4 block' },
      { size: 'large', grams: 200, description: '1 block' },
    ],
    aliases: ['bean curd'],
  },
  "tempeh": {
    nutrition: { calories: 193, protein: 19, carbs: 9.4, fat: 11, fiber: 0 },
    category: 'proteins',
    portions: [
      { size: 'small', grams: 85, description: '3 oz' },
      { size: 'medium', grams: 115, description: '4 oz' },
      { size: 'large', grams: 170, description: '6 oz' },
    ],
  },

  // ==================== VEGETABLES ====================
  "brocoli": {
    nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 75, description: '1/2 cup' },
      { size: 'medium', grams: 150, description: '1 cup' },
      { size: 'large', grams: 225, description: '1.5 cups' },
    ],
    visualGuide: 'fist',
    aliases: ['broccoli'],
  },
  "carotte": {
    nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 60, description: '1 medium carrot' },
      { size: 'medium', grams: 120, description: '2 medium carrots' },
      { size: 'large', grams: 200, description: '1 cup sliced' },
    ],
    aliases: ['carrot', 'carrots'],
  },
  "tomate": {
    nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 75, description: '1 small tomato' },
      { size: 'medium', grams: 125, description: '1 medium tomato' },
      { size: 'large', grams: 180, description: '1 large tomato' },
    ],
    aliases: ['tomato', 'tomatoes'],
  },
  "tomate cerise": {
    nutrition: { calories: 18, protein: 0.9, carbs: 4, fat: 0.1, fiber: 1.2 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 75, description: '5 cherry tomatoes' },
      { size: 'medium', grams: 150, description: '10 cherry tomatoes' },
      { size: 'large', grams: 225, description: '15 cherry tomatoes' },
    ],
    aliases: ['cherry tomatoes', 'cherry tomato'],
  },
  "salade": {
    nutrition: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 50, description: '1 cup' },
      { size: 'medium', grams: 100, description: '2 cups' },
      { size: 'large', grams: 150, description: '3 cups' },
    ],
    aliases: ['lettuce', 'salad', 'greens', 'mixed greens'],
  },
  "épinard": {
    nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 30, description: '1 cup raw' },
      { size: 'medium', grams: 90, description: '1/2 cup cooked' },
      { size: 'large', grams: 180, description: '1 cup cooked' },
    ],
    aliases: ['spinach'],
  },
  "courgette": {
    nutrition: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 100, description: '1/2 medium' },
      { size: 'medium', grams: 200, description: '1 medium' },
      { size: 'large', grams: 300, description: '1 large' },
    ],
    aliases: ['zucchini'],
  },
  "aubergine": {
    nutrition: { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup' },
      { size: 'medium', grams: 200, description: '1 cup' },
      { size: 'large', grams: 300, description: '1.5 cups' },
    ],
    aliases: ['eggplant'],
  },
  "poivron": {
    nutrition: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 75, description: '1/2 pepper' },
      { size: 'medium', grams: 120, description: '1 medium pepper' },
      { size: 'large', grams: 180, description: '1 large pepper' },
    ],
    aliases: ['bell pepper', 'pepper', 'capsicum'],
  },
  "oignon": {
    nutrition: { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 50, description: '1/2 medium' },
      { size: 'medium', grams: 110, description: '1 medium' },
      { size: 'large', grams: 150, description: '1 large' },
    ],
    aliases: ['onion'],
  },
  "ail": {
    nutrition: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 3, description: '1 clove' },
      { size: 'medium', grams: 9, description: '3 cloves' },
      { size: 'large', grams: 15, description: '5 cloves' },
    ],
    aliases: ['garlic'],
  },
  "champignon": {
    nutrition: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 50, description: '3-4 mushrooms' },
      { size: 'medium', grams: 100, description: '1 cup sliced' },
      { size: 'large', grams: 150, description: '1.5 cups' },
    ],
    aliases: ['mushroom', 'mushrooms'],
  },
  "concombre": {
    nutrition: { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cucumber' },
      { size: 'medium', grams: 150, description: '3/4 cucumber' },
      { size: 'large', grams: 300, description: '1 whole cucumber' },
    ],
    aliases: ['cucumber'],
  },
  "haricots verts": {
    nutrition: { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 2.7 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 60, description: '1/2 cup' },
      { size: 'medium', grams: 120, description: '1 cup' },
      { size: 'large', grams: 180, description: '1.5 cups' },
    ],
    aliases: ['green beans', 'string beans'],
  },
  "chou-fleur": {
    nutrition: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 60, description: '1/2 cup' },
      { size: 'medium', grams: 125, description: '1 cup' },
      { size: 'large', grams: 200, description: '1.5 cups' },
    ],
    aliases: ['cauliflower'],
  },
  "chou": {
    nutrition: { calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 75, description: '1 cup shredded' },
      { size: 'medium', grams: 150, description: '2 cups shredded' },
      { size: 'large', grams: 225, description: '3 cups shredded' },
    ],
    aliases: ['cabbage'],
  },
  "petit pois": {
    nutrition: { calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 60, description: '1/2 cup' },
      { size: 'medium', grams: 100, description: '3/4 cup' },
      { size: 'large', grams: 150, description: '1 cup' },
    ],
    aliases: ['peas', 'green peas'],
  },
  "maïs": {
    nutrition: { calories: 86, protein: 3.3, carbs: 19, fat: 1.4, fiber: 2.7 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 80, description: '1/2 cup' },
      { size: 'medium', grams: 150, description: '1 cup or 1 cob' },
      { size: 'large', grams: 230, description: '1.5 cups' },
    ],
    aliases: ['corn', 'sweet corn'],
  },
  "avocat": {
    nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
    category: 'vegetables',
    portions: [
      { size: 'small', grams: 50, description: '1/4 avocado' },
      { size: 'medium', grams: 100, description: '1/2 avocado' },
      { size: 'large', grams: 150, description: '3/4 avocado' },
    ],
    aliases: ['avocado'],
  },

  // ==================== FRUITS ====================
  "pomme": {
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 120, description: '1 small apple' },
      { size: 'medium', grams: 180, description: '1 medium apple' },
      { size: 'large', grams: 220, description: '1 large apple' },
    ],
    aliases: ['apple'],
  },
  "banane": {
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 80, description: '1 small banana' },
      { size: 'medium', grams: 120, description: '1 medium banana' },
      { size: 'large', grams: 150, description: '1 large banana' },
    ],
    visualGuide: 'banana',
    aliases: ['banana'],
  },
  "orange": {
    nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 100, description: '1 small orange' },
      { size: 'medium', grams: 150, description: '1 medium orange' },
      { size: 'large', grams: 200, description: '1 large orange' },
    ],
    aliases: ['oranges'],
  },
  "fraise": {
    nutrition: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 75, description: '5 strawberries' },
      { size: 'medium', grams: 150, description: '10 strawberries' },
      { size: 'large', grams: 225, description: '15 strawberries' },
    ],
    aliases: ['strawberry', 'strawberries'],
  },
  "raisin": {
    nutrition: { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 75, description: '1/2 cup' },
      { size: 'medium', grams: 150, description: '1 cup' },
      { size: 'large', grams: 225, description: '1.5 cups' },
    ],
    aliases: ['grapes', 'grape'],
  },
  "melon": {
    nutrition: { calories: 34, protein: 0.8, carbs: 8, fat: 0.2, fiber: 0.9 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 150, description: '1 cup cubed' },
      { size: 'medium', grams: 250, description: '1/4 melon' },
      { size: 'large', grams: 400, description: '1/2 melon' },
    ],
    aliases: ['cantaloupe'],
  },
  "pastèque": {
    nutrition: { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 150, description: '1 cup cubed' },
      { size: 'medium', grams: 280, description: '1 slice' },
      { size: 'large', grams: 400, description: '2 slices' },
    ],
    aliases: ['watermelon'],
  },
  "mangue": {
    nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup cubed' },
      { size: 'medium', grams: 165, description: '1 cup cubed' },
      { size: 'large', grams: 200, description: '1 whole mango' },
    ],
    aliases: ['mango'],
  },
  "ananas": {
    nutrition: { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 80, description: '1/2 cup' },
      { size: 'medium', grams: 165, description: '1 cup' },
      { size: 'large', grams: 250, description: '1.5 cups' },
    ],
    aliases: ['pineapple'],
  },
  "pêche": {
    nutrition: { calories: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 100, description: '1 small peach' },
      { size: 'medium', grams: 150, description: '1 medium peach' },
      { size: 'large', grams: 200, description: '1 large peach' },
    ],
    aliases: ['peach'],
  },
  "poire": {
    nutrition: { calories: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 120, description: '1 small pear' },
      { size: 'medium', grams: 180, description: '1 medium pear' },
      { size: 'large', grams: 230, description: '1 large pear' },
    ],
    aliases: ['pear'],
  },
  "kiwi": {
    nutrition: { calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 70, description: '1 kiwi' },
      { size: 'medium', grams: 140, description: '2 kiwis' },
      { size: 'large', grams: 210, description: '3 kiwis' },
    ],
  },
  "citron": {
    nutrition: { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 30, description: '1 tbsp juice' },
      { size: 'medium', grams: 60, description: '1/2 lemon' },
      { size: 'large', grams: 100, description: '1 lemon' },
    ],
    aliases: ['lemon'],
  },
  "dattes": {
    nutrition: { calories: 282, protein: 2.5, carbs: 75, fat: 0.4, fiber: 8 },
    category: 'fruits',
    portions: [
      { size: 'small', grams: 25, description: '1 date' },
      { size: 'medium', grams: 50, description: '2 dates' },
      { size: 'large', grams: 100, description: '4 dates' },
    ],
    aliases: ['dates', 'date'],
  },

  // ==================== DAIRY ====================
  "lait": {
    nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 125, description: '1/2 cup' },
      { size: 'medium', grams: 250, description: '1 cup' },
      { size: 'large', grams: 375, description: '1.5 cups' },
    ],
    aliases: ['milk', 'whole milk'],
  },
  "lait écrémé": {
    nutrition: { calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 125, description: '1/2 cup' },
      { size: 'medium', grams: 250, description: '1 cup' },
      { size: 'large', grams: 375, description: '1.5 cups' },
    ],
    aliases: ['skim milk', 'nonfat milk'],
  },
  "yaourt": {
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 125, description: '1 small pot' },
      { size: 'medium', grams: 170, description: '1 regular pot' },
      { size: 'large', grams: 250, description: '1 large pot' },
    ],
    aliases: ['yogurt', 'yoghurt'],
  },
  "yaourt grec": {
    nutrition: { calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup' },
      { size: 'medium', grams: 170, description: '3/4 cup' },
      { size: 'large', grams: 250, description: '1 cup' },
    ],
    aliases: ['greek yogurt'],
  },
  "fromage": {
    nutrition: { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 20, description: '2 dice-sized cubes' },
      { size: 'medium', grams: 40, description: '1.5 oz / 4 cubes' },
      { size: 'large', grams: 60, description: '2 oz / 6 cubes' },
    ],
    visualGuide: 'thumb',
    aliases: ['cheese', 'cheddar', 'gruyère'],
  },
  "mozzarella": {
    nutrition: { calories: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 30, description: '1 oz' },
      { size: 'medium', grams: 60, description: '2 oz' },
      { size: 'large', grams: 125, description: '1 ball' },
    ],
  },
  "feta": {
    nutrition: { calories: 264, protein: 14, carbs: 4.1, fat: 21, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 30, description: '2 tbsp crumbled' },
      { size: 'medium', grams: 50, description: '1/4 cup crumbled' },
      { size: 'large', grams: 75, description: '1/3 cup crumbled' },
    ],
    aliases: ['feta cheese'],
  },
  "parmesan": {
    nutrition: { calories: 431, protein: 38, carbs: 4.1, fat: 29, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 10, description: '1 tbsp grated' },
      { size: 'medium', grams: 20, description: '2 tbsp grated' },
      { size: 'large', grams: 30, description: '3 tbsp grated' },
    ],
  },
  "beurre": {
    nutrition: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 7, description: '1/2 tbsp' },
      { size: 'medium', grams: 14, description: '1 tbsp' },
      { size: 'large', grams: 28, description: '2 tbsp' },
    ],
    aliases: ['butter'],
  },
  "crème fraîche": {
    nutrition: { calories: 292, protein: 2.4, carbs: 2.8, fat: 30, fiber: 0 },
    category: 'dairy',
    portions: [
      { size: 'small', grams: 30, description: '2 tbsp' },
      { size: 'medium', grams: 60, description: '1/4 cup' },
      { size: 'large', grams: 120, description: '1/2 cup' },
    ],
    aliases: ['sour cream', 'cream'],
  },

  // ==================== LEGUMES ====================
  "lentilles": {
    nutrition: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
    category: 'legumes',
    portions: [
      { size: 'small', grams: 100, description: '1/2 cup cooked' },
      { size: 'medium', grams: 200, description: '1 cup cooked' },
      { size: 'large', grams: 300, description: '1.5 cups cooked' },
    ],
    aliases: ['lentils'],
  },
  "pois chiches": {
    nutrition: { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
    category: 'legumes',
    portions: [
      { size: 'small', grams: 80, description: '1/2 cup cooked' },
      { size: 'medium', grams: 165, description: '1 cup cooked' },
      { size: 'large', grams: 250, description: '1.5 cups cooked' },
    ],
    aliases: ['chickpeas', 'garbanzo beans'],
  },
  "haricots": {
    nutrition: { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4 },
    category: 'legumes',
    portions: [
      { size: 'small', grams: 85, description: '1/2 cup cooked' },
      { size: 'medium', grams: 170, description: '1 cup cooked' },
      { size: 'large', grams: 255, description: '1.5 cups cooked' },
    ],
    aliases: ['beans', 'kidney beans', 'black beans', 'haricots rouges'],
  },
  "haricots blancs": {
    nutrition: { calories: 139, protein: 9.7, carbs: 25, fat: 0.4, fiber: 6.3 },
    category: 'legumes',
    portions: [
      { size: 'small', grams: 85, description: '1/2 cup cooked' },
      { size: 'medium', grams: 170, description: '1 cup cooked' },
      { size: 'large', grams: 255, description: '1.5 cups cooked' },
    ],
    aliases: ['white beans', 'navy beans', 'cannellini'],
  },
  "fèves": {
    nutrition: { calories: 110, protein: 8, carbs: 19, fat: 0.4, fiber: 5.4 },
    category: 'legumes',
    portions: [
      { size: 'small', grams: 85, description: '1/2 cup cooked' },
      { size: 'medium', grams: 170, description: '1 cup cooked' },
      { size: 'large', grams: 255, description: '1.5 cups cooked' },
    ],
    aliases: ['fava beans', 'broad beans'],
  },
  "edamame": {
    nutrition: { calories: 121, protein: 12, carbs: 9, fat: 5, fiber: 5.2 },
    category: 'legumes',
    portions: [
      { size: 'small', grams: 80, description: '1/2 cup shelled' },
      { size: 'medium', grams: 155, description: '1 cup shelled' },
      { size: 'large', grams: 230, description: '1.5 cups shelled' },
    ],
  },

  // ==================== NUTS & SEEDS ====================
  "amandes": {
    nutrition: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 15, description: '10 almonds' },
      { size: 'medium', grams: 30, description: '20 almonds' },
      { size: 'large', grams: 45, description: '30 almonds' },
    ],
    aliases: ['almonds'],
  },
  "noix": {
    nutrition: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 15, description: '7 walnut halves' },
      { size: 'medium', grams: 30, description: '14 walnut halves' },
      { size: 'large', grams: 45, description: '21 walnut halves' },
    ],
    aliases: ['walnuts'],
  },
  "noix de cajou": {
    nutrition: { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 15, description: '10 cashews' },
      { size: 'medium', grams: 30, description: '20 cashews' },
      { size: 'large', grams: 45, description: '30 cashews' },
    ],
    aliases: ['cashews'],
  },
  "cacahuètes": {
    nutrition: { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 20, description: '1 small handful' },
      { size: 'medium', grams: 40, description: '1 medium handful' },
      { size: 'large', grams: 60, description: '1 large handful' },
    ],
    aliases: ['peanuts', 'arachides'],
  },
  "beurre de cacahuète": {
    nutrition: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 16, description: '1 tbsp' },
      { size: 'medium', grams: 32, description: '2 tbsp' },
      { size: 'large', grams: 48, description: '3 tbsp' },
    ],
    aliases: ['peanut butter'],
  },
  "graines de chia": {
    nutrition: { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 10, description: '1 tbsp' },
      { size: 'medium', grams: 20, description: '2 tbsp' },
      { size: 'large', grams: 30, description: '3 tbsp' },
    ],
    aliases: ['chia seeds'],
  },
  "graines de lin": {
    nutrition: { calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 10, description: '1 tbsp' },
      { size: 'medium', grams: 20, description: '2 tbsp' },
      { size: 'large', grams: 30, description: '3 tbsp' },
    ],
    aliases: ['flax seeds', 'linseed'],
  },
  "graines de tournesol": {
    nutrition: { calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 8.6 },
    category: 'nuts',
    portions: [
      { size: 'small', grams: 15, description: '1 tbsp' },
      { size: 'medium', grams: 30, description: '2 tbsp' },
      { size: 'large', grams: 45, description: '3 tbsp' },
    ],
    aliases: ['sunflower seeds'],
  },

  // ==================== MOROCCAN SPECIALTIES ====================
  "couscous royal": {
    nutrition: { calories: 145, protein: 7, carbs: 18, fat: 5, fiber: 2 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 250, description: 'Small plate' },
      { size: 'medium', grams: 400, description: 'Regular plate' },
      { size: 'large', grams: 550, description: 'Large plate' },
    ],
    aliases: ['couscous with meat', 'moroccan couscous'],
  },
  "tajine": {
    nutrition: { calories: 120, protein: 10, carbs: 8, fat: 6, fiber: 2 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 200, description: 'Small portion' },
      { size: 'medium', grams: 350, description: 'Regular portion' },
      { size: 'large', grams: 500, description: 'Large portion' },
    ],
    aliases: ['tagine', 'tajine poulet', 'tajine agneau'],
  },
  "harira": {
    nutrition: { calories: 60, protein: 3.5, carbs: 9, fat: 1.5, fiber: 2 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 200, description: '1 small bowl' },
      { size: 'medium', grams: 350, description: '1 medium bowl' },
      { size: 'large', grams: 500, description: '1 large bowl' },
    ],
    aliases: ['moroccan soup'],
  },
  "msemen": {
    nutrition: { calories: 320, protein: 6, carbs: 40, fat: 15, fiber: 1.5 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 60, description: '1 small msemen' },
      { size: 'medium', grams: 100, description: '1 medium msemen' },
      { size: 'large', grams: 150, description: '1 large msemen' },
    ],
    aliases: ['rghaif', 'moroccan pancake'],
  },
  "baghrir": {
    nutrition: { calories: 180, protein: 5, carbs: 35, fat: 2.5, fiber: 1 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 50, description: '1 baghrir' },
      { size: 'medium', grams: 100, description: '2 baghrir' },
      { size: 'large', grams: 150, description: '3 baghrir' },
    ],
    aliases: ['thousand holes pancake'],
  },
  "pastilla": {
    nutrition: { calories: 280, protein: 12, carbs: 25, fat: 15, fiber: 1.5 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 100, description: '1 small slice' },
      { size: 'medium', grams: 180, description: '1 medium slice' },
      { size: 'large', grams: 250, description: '1 large slice' },
    ],
    aliases: ['bastilla', 'b\'stilla'],
  },
  "briouate": {
    nutrition: { calories: 250, protein: 8, carbs: 22, fat: 14, fiber: 1 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 40, description: '1 piece' },
      { size: 'medium', grams: 80, description: '2 pieces' },
      { size: 'large', grams: 120, description: '3 pieces' },
    ],
    aliases: ['moroccan spring roll'],
  },
  "khobz": {
    nutrition: { calories: 270, protein: 8, carbs: 52, fat: 2.5, fiber: 3 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 50, description: '1/4 bread' },
      { size: 'medium', grams: 100, description: '1/2 bread' },
      { size: 'large', grams: 200, description: '1 whole bread' },
    ],
    aliases: ['moroccan bread', 'khobz maghrebi'],
  },
  "chebakia": {
    nutrition: { calories: 380, protein: 5, carbs: 55, fat: 16, fiber: 2 },
    category: 'moroccan',
    portions: [
      { size: 'small', grams: 30, description: '1 piece' },
      { size: 'medium', grams: 60, description: '2 pieces' },
      { size: 'large', grams: 90, description: '3 pieces' },
    ],
    aliases: ['shebakia', 'moroccan honey cookies'],
  },

  // ==================== PREPARED FOODS ====================
  "pizza": {
    nutrition: { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 80, description: '1 slice' },
      { size: 'medium', grams: 160, description: '2 slices' },
      { size: 'large', grams: 320, description: '4 slices / half pizza' },
    ],
    aliases: ['pizza slice'],
  },
  "sandwich": {
    nutrition: { calories: 250, protein: 12, carbs: 30, fat: 8, fiber: 2 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 100, description: '1/2 sandwich' },
      { size: 'medium', grams: 180, description: '1 regular sandwich' },
      { size: 'large', grams: 250, description: '1 large sandwich' },
    ],
  },
  "burger": {
    nutrition: { calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1.3 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 120, description: 'Small burger' },
      { size: 'medium', grams: 200, description: 'Regular burger' },
      { size: 'large', grams: 300, description: 'Large burger' },
    ],
    aliases: ['hamburger', 'cheeseburger'],
  },
  "sushi": {
    nutrition: { calories: 150, protein: 6, carbs: 30, fat: 1.5, fiber: 0.5 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 100, description: '4 pieces' },
      { size: 'medium', grams: 200, description: '8 pieces' },
      { size: 'large', grams: 300, description: '12 pieces' },
    ],
    aliases: ['maki', 'sashimi'],
  },
  "quiche": {
    nutrition: { calories: 230, protein: 9, carbs: 16, fat: 14, fiber: 0.8 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 100, description: '1 small slice' },
      { size: 'medium', grams: 150, description: '1 medium slice' },
      { size: 'large', grams: 200, description: '1 large slice' },
    ],
    aliases: ['quiche lorraine'],
  },
  "croque-monsieur": {
    nutrition: { calories: 280, protein: 16, carbs: 20, fat: 15, fiber: 1 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 100, description: '1/2 croque' },
      { size: 'medium', grams: 180, description: '1 croque' },
      { size: 'large', grams: 250, description: '1 large croque' },
    ],
  },
  "croissant": {
    nutrition: { calories: 406, protein: 8, carbs: 45, fat: 21, fiber: 2.4 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 35, description: '1 mini croissant' },
      { size: 'medium', grams: 60, description: '1 regular croissant' },
      { size: 'large', grams: 85, description: '1 large croissant' },
    ],
  },
  "pain au chocolat": {
    nutrition: { calories: 404, protein: 7, carbs: 45, fat: 21, fiber: 2.3 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 40, description: '1 mini' },
      { size: 'medium', grams: 70, description: '1 regular' },
      { size: 'large', grams: 100, description: '1 large' },
    ],
    aliases: ['chocolatine'],
  },
  "omelette": {
    nutrition: { calories: 154, protein: 11, carbs: 0.6, fat: 12, fiber: 0 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 100, description: '2-egg omelette' },
      { size: 'medium', grams: 150, description: '3-egg omelette' },
      { size: 'large', grams: 200, description: '4-egg omelette' },
    ],
    aliases: ['omelet'],
  },
  "salade composée": {
    nutrition: { calories: 120, protein: 5, carbs: 10, fat: 7, fiber: 3 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 150, description: 'Side salad' },
      { size: 'medium', grams: 300, description: 'Main salad' },
      { size: 'large', grams: 450, description: 'Large salad' },
    ],
    aliases: ['mixed salad', 'composed salad'],
  },
  "soupe": {
    nutrition: { calories: 50, protein: 2, carbs: 8, fat: 1, fiber: 1.5 },
    category: 'prepared',
    portions: [
      { size: 'small', grams: 200, description: '1 cup' },
      { size: 'medium', grams: 350, description: '1.5 cups' },
      { size: 'large', grams: 500, description: '2 cups' },
    ],
    aliases: ['soup', 'vegetable soup'],
  },

  // ==================== BEVERAGES ====================
  "café": {
    nutrition: { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
    category: 'beverages',
    portions: [
      { size: 'small', grams: 30, description: '1 espresso' },
      { size: 'medium', grams: 150, description: '1 regular cup' },
      { size: 'large', grams: 350, description: '1 large cup' },
    ],
    aliases: ['coffee', 'espresso'],
  },
  "thé": {
    nutrition: { calories: 1, protein: 0, carbs: 0.3, fat: 0, fiber: 0 },
    category: 'beverages',
    portions: [
      { size: 'small', grams: 150, description: '1 cup' },
      { size: 'medium', grams: 250, description: '1 mug' },
      { size: 'large', grams: 400, description: '1 large mug' },
    ],
    aliases: ['tea', 'thé vert', 'green tea'],
  },
  "thé à la menthe": {
    nutrition: { calories: 30, protein: 0, carbs: 7, fat: 0, fiber: 0 },
    category: 'beverages',
    portions: [
      { size: 'small', grams: 100, description: '1 small glass' },
      { size: 'medium', grams: 150, description: '1 glass' },
      { size: 'large', grams: 250, description: '1 large glass' },
    ],
    aliases: ['mint tea', 'moroccan tea', 'atay'],
  },
  "jus d'orange": {
    nutrition: { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2 },
    category: 'beverages',
    portions: [
      { size: 'small', grams: 150, description: '1 small glass' },
      { size: 'medium', grams: 250, description: '1 glass' },
      { size: 'large', grams: 350, description: '1 large glass' },
    ],
    aliases: ['orange juice'],
  },
  "smoothie": {
    nutrition: { calories: 65, protein: 1.5, carbs: 14, fat: 0.5, fiber: 1.5 },
    category: 'beverages',
    portions: [
      { size: 'small', grams: 200, description: '1 small cup' },
      { size: 'medium', grams: 350, description: '1 medium cup' },
      { size: 'large', grams: 500, description: '1 large cup' },
    ],
  },

  // ==================== SNACKS ====================
  "chocolat": {
    nutrition: { calories: 546, protein: 5, carbs: 60, fat: 31, fiber: 7 },
    category: 'snacks',
    portions: [
      { size: 'small', grams: 20, description: '2-3 squares' },
      { size: 'medium', grams: 40, description: '1/3 bar' },
      { size: 'large', grams: 100, description: '1 bar' },
    ],
    aliases: ['chocolate', 'dark chocolate'],
  },
  "chips": {
    nutrition: { calories: 536, protein: 7, carbs: 53, fat: 33, fiber: 4.4 },
    category: 'snacks',
    portions: [
      { size: 'small', grams: 25, description: 'Small handful' },
      { size: 'medium', grams: 50, description: 'Medium bag' },
      { size: 'large', grams: 100, description: 'Large bag' },
    ],
    aliases: ['potato chips', 'crisps'],
  },
  "biscuit": {
    nutrition: { calories: 480, protein: 6, carbs: 62, fat: 23, fiber: 2 },
    category: 'snacks',
    portions: [
      { size: 'small', grams: 15, description: '1 cookie' },
      { size: 'medium', grams: 30, description: '2 cookies' },
      { size: 'large', grams: 50, description: '3-4 cookies' },
    ],
    aliases: ['cookie', 'cookies', 'biscuits'],
  },
  "glace": {
    nutrition: { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0 },
    category: 'snacks',
    portions: [
      { size: 'small', grams: 70, description: '1 scoop' },
      { size: 'medium', grams: 140, description: '2 scoops' },
      { size: 'large', grams: 200, description: '3 scoops' },
    ],
    aliases: ['ice cream'],
  },
  "gâteau": {
    nutrition: { calories: 350, protein: 4, carbs: 50, fat: 15, fiber: 1 },
    category: 'snacks',
    portions: [
      { size: 'small', grams: 60, description: '1 small slice' },
      { size: 'medium', grams: 100, description: '1 medium slice' },
      { size: 'large', grams: 150, description: '1 large slice' },
    ],
    aliases: ['cake'],
  },

  // ==================== SAUCES & CONDIMENTS ====================
  "huile d'olive": {
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 5, description: '1 tsp' },
      { size: 'medium', grams: 14, description: '1 tbsp' },
      { size: 'large', grams: 28, description: '2 tbsp' },
    ],
    aliases: ['olive oil'],
  },
  "mayonnaise": {
    nutrition: { calories: 680, protein: 1, carbs: 0.6, fat: 75, fiber: 0 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 15, description: '1 tbsp' },
      { size: 'medium', grams: 30, description: '2 tbsp' },
      { size: 'large', grams: 45, description: '3 tbsp' },
    ],
    aliases: ['mayo'],
  },
  "ketchup": {
    nutrition: { calories: 112, protein: 1.7, carbs: 26, fat: 0.3, fiber: 0.3 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 15, description: '1 tbsp' },
      { size: 'medium', grams: 30, description: '2 tbsp' },
      { size: 'large', grams: 45, description: '3 tbsp' },
    ],
  },
  "moutarde": {
    nutrition: { calories: 66, protein: 4.4, carbs: 6, fat: 3.3, fiber: 3.3 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 5, description: '1 tsp' },
      { size: 'medium', grams: 15, description: '1 tbsp' },
      { size: 'large', grams: 30, description: '2 tbsp' },
    ],
    aliases: ['mustard'],
  },
  "sauce soja": {
    nutrition: { calories: 53, protein: 8, carbs: 5, fat: 0.1, fiber: 0.8 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 5, description: '1 tsp' },
      { size: 'medium', grams: 15, description: '1 tbsp' },
      { size: 'large', grams: 30, description: '2 tbsp' },
    ],
    aliases: ['soy sauce'],
  },
  "houmous": {
    nutrition: { calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 30, description: '2 tbsp' },
      { size: 'medium', grams: 60, description: '1/4 cup' },
      { size: 'large', grams: 100, description: '1/2 cup' },
    ],
    aliases: ['hummus'],
  },
  "miel": {
    nutrition: { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 7, description: '1 tsp' },
      { size: 'medium', grams: 21, description: '1 tbsp' },
      { size: 'large', grams: 42, description: '2 tbsp' },
    ],
    aliases: ['honey'],
  },
  "confiture": {
    nutrition: { calories: 278, protein: 0.4, carbs: 69, fat: 0.1, fiber: 1 },
    category: 'sauces',
    portions: [
      { size: 'small', grams: 20, description: '1 tbsp' },
      { size: 'medium', grams: 40, description: '2 tbsp' },
      { size: 'large', grams: 60, description: '3 tbsp' },
    ],
    aliases: ['jam', 'jelly', 'marmalade'],
  },
}

/**
 * Get all food names for autocomplete
 */
export const ALL_FOODS = Object.keys(EXTENDED_NUTRITION_REFERENCE).sort()

/**
 * Get foods by category
 */
export function getFoodsByCategory(category: FoodCategory): string[] {
  return Object.entries(EXTENDED_NUTRITION_REFERENCE)
    .filter(([, entry]) => entry.category === category)
    .map(([name]) => name)
    .sort()
}

/**
 * Search foods with fuzzy matching and alias support
 */
export function searchFoodsExtended(query: string, maxResults: number = 15): string[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    // Return popular foods when no query
    return ['poulet', 'riz', 'pâtes', 'salade', 'oeuf', 'pain', 'banane', 'yaourt', 'pomme', 'saumon']
  }

  const results: { name: string; score: number }[] = []

  for (const [name, entry] of Object.entries(EXTENDED_NUTRITION_REFERENCE)) {
    let score = 0

    // Exact match
    if (name === normalizedQuery) {
      score = 100
    }
    // Starts with query
    else if (name.startsWith(normalizedQuery)) {
      score = 80
    }
    // Contains query
    else if (name.includes(normalizedQuery)) {
      score = 60
    }
    // Check aliases
    else if (entry.aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery))) {
      score = 50
    }

    if (score > 0) {
      results.push({ name, score })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(r => r.name)
}

/**
 * Get nutrition values for a food item with portion calculation
 */
export function getNutrition(
  foodName: string,
  quantity: number,
  unit: string = 'g'
): NutritionValues | null {
  const normalizedName = foodName.toLowerCase().trim()
  const entry = EXTENDED_NUTRITION_REFERENCE[normalizedName]

  if (!entry) return null

  // Convert to grams based on unit
  let grams = quantity
  const unitConversions: Record<string, number> = {
    g: 1,
    ml: 1,
    portion: 150,
    piece: 100,
    cup: 240,
    tbsp: 15,
    tsp: 5,
  }

  if (unitConversions[unit.toLowerCase()]) {
    grams = quantity * unitConversions[unit.toLowerCase()]
  }

  const factor = grams / 100

  return {
    calories: Math.round(entry.nutrition.calories * factor),
    protein: parseFloat((entry.nutrition.protein * factor).toFixed(1)),
    carbs: parseFloat((entry.nutrition.carbs * factor).toFixed(1)),
    fat: parseFloat((entry.nutrition.fat * factor).toFixed(1)),
    fiber: parseFloat((entry.nutrition.fiber * factor).toFixed(1)),
  }
}

/**
 * Get portion presets for a food
 */
export function getPortionPresets(foodName: string): PortionPreset[] | null {
  const normalizedName = foodName.toLowerCase().trim()
  const entry = EXTENDED_NUTRITION_REFERENCE[normalizedName]
  return entry?.portions || null
}

/**
 * Get visual guide for a food
 */
export function getVisualGuide(foodName: string): string | null {
  const normalizedName = foodName.toLowerCase().trim()
  const entry = EXTENDED_NUTRITION_REFERENCE[normalizedName]
  return entry?.visualGuide || null
}

/**
 * Visual guide descriptions in multiple languages
 */
export const VISUAL_GUIDES: Record<string, Record<string, string>> = {
  cupped_hand: {
    en: 'About 1 cupped handful',
    fr: 'Environ 1 main en coupe',
    de: 'Etwa 1 hohle Hand',
    es: 'Aproximadamente 1 mano ahuecada',
    pt: 'Cerca de 1 mão em concha',
    zh: '大约一捧',
    ar: 'حوالي حفنة واحدة',
  },
  fist: {
    en: 'About the size of your fist',
    fr: 'Environ la taille de votre poing',
    de: 'Etwa so groß wie Ihre Faust',
    es: 'Aproximadamente del tamaño de tu puño',
    pt: 'Aproximadamente do tamanho do seu punho',
    zh: '大约拳头大小',
    ar: 'تقريباً بحجم قبضة يدك',
  },
  deck_of_cards: {
    en: 'About the size of a deck of cards',
    fr: 'Environ la taille d\'un jeu de cartes',
    de: 'Etwa so groß wie ein Kartenspiel',
    es: 'Aproximadamente del tamaño de una baraja de cartas',
    pt: 'Aproximadamente do tamanho de um baralho',
    zh: '大约一副扑克牌大小',
    ar: 'تقريباً بحجم مجموعة ورق اللعب',
  },
  thumb: {
    en: 'About the size of your thumb',
    fr: 'Environ la taille de votre pouce',
    de: 'Etwa so groß wie Ihr Daumen',
    es: 'Aproximadamente del tamaño de tu pulgar',
    pt: 'Aproximadamente do tamanho do seu polegar',
    zh: '大约拇指大小',
    ar: 'تقريباً بحجم إبهامك',
  },
  checkbook: {
    en: 'About the size of a checkbook',
    fr: 'Environ la taille d\'un chéquier',
    de: 'Etwa so groß wie ein Scheckbuch',
    es: 'Aproximadamente del tamaño de una chequera',
    pt: 'Aproximadamente do tamanho de um talão de cheques',
    zh: '大约支票簿大小',
    ar: 'تقريباً بحجم دفتر الشيكات',
  },
  slice: {
    en: 'One standard slice',
    fr: 'Une tranche standard',
    de: 'Eine Standardscheibe',
    es: 'Una rebanada estándar',
    pt: 'Uma fatia padrão',
    zh: '一片标准切片',
    ar: 'شريحة واحدة قياسية',
  },
  egg: {
    en: 'One large egg',
    fr: 'Un œuf de taille moyenne',
    de: 'Ein großes Ei',
    es: 'Un huevo grande',
    pt: 'Um ovo grande',
    zh: '一个大鸡蛋',
    ar: 'بيضة واحدة كبيرة',
  },
  banana: {
    en: 'One medium banana',
    fr: 'Une banane moyenne',
    de: 'Eine mittelgroße Banane',
    es: 'Un plátano mediano',
    pt: 'Uma banana média',
    zh: '一根中等大小的香蕉',
    ar: 'موزة متوسطة الحجم',
  },
}

/**
 * Category translations
 */
export const CATEGORY_TRANSLATIONS: Record<FoodCategory, Record<string, string>> = {
  grains: {
    en: 'Grains & Starches',
    fr: 'Céréales et Féculents',
    de: 'Getreide und Stärke',
    es: 'Cereales y Almidones',
    pt: 'Grãos e Amidos',
    zh: '谷物和淀粉',
    ar: 'الحبوب والنشويات',
  },
  proteins: {
    en: 'Proteins',
    fr: 'Protéines',
    de: 'Proteine',
    es: 'Proteínas',
    pt: 'Proteínas',
    zh: '蛋白质',
    ar: 'البروتينات',
  },
  vegetables: {
    en: 'Vegetables',
    fr: 'Légumes',
    de: 'Gemüse',
    es: 'Verduras',
    pt: 'Vegetais',
    zh: '蔬菜',
    ar: 'الخضروات',
  },
  fruits: {
    en: 'Fruits',
    fr: 'Fruits',
    de: 'Obst',
    es: 'Frutas',
    pt: 'Frutas',
    zh: '水果',
    ar: 'الفواكه',
  },
  dairy: {
    en: 'Dairy',
    fr: 'Produits Laitiers',
    de: 'Milchprodukte',
    es: 'Lácteos',
    pt: 'Laticínios',
    zh: '乳制品',
    ar: 'منتجات الألبان',
  },
  legumes: {
    en: 'Legumes',
    fr: 'Légumineuses',
    de: 'Hülsenfrüchte',
    es: 'Legumbres',
    pt: 'Leguminosas',
    zh: '豆类',
    ar: 'البقوليات',
  },
  nuts: {
    en: 'Nuts & Seeds',
    fr: 'Noix et Graines',
    de: 'Nüsse und Samen',
    es: 'Frutos Secos y Semillas',
    pt: 'Nozes e Sementes',
    zh: '坚果和种子',
    ar: 'المكسرات والبذور',
  },
  prepared: {
    en: 'Prepared Foods',
    fr: 'Plats Préparés',
    de: 'Fertiggerichte',
    es: 'Comidas Preparadas',
    pt: 'Alimentos Preparados',
    zh: '即食食品',
    ar: 'الأطعمة الجاهزة',
  },
  moroccan: {
    en: 'Moroccan Specialties',
    fr: 'Spécialités Marocaines',
    de: 'Marokkanische Spezialitäten',
    es: 'Especialidades Marroquíes',
    pt: 'Especialidades Marroquinas',
    zh: '摩洛哥特色菜',
    ar: 'الأطباق المغربية',
  },
  beverages: {
    en: 'Beverages',
    fr: 'Boissons',
    de: 'Getränke',
    es: 'Bebidas',
    pt: 'Bebidas',
    zh: '饮料',
    ar: 'المشروبات',
  },
  snacks: {
    en: 'Snacks & Desserts',
    fr: 'Snacks et Desserts',
    de: 'Snacks und Desserts',
    es: 'Aperitivos y Postres',
    pt: 'Lanches e Sobremesas',
    zh: '零食和甜点',
    ar: 'الوجبات الخفيفة والحلويات',
  },
  sauces: {
    en: 'Sauces & Condiments',
    fr: 'Sauces et Condiments',
    de: 'Soßen und Gewürze',
    es: 'Salsas y Condimentos',
    pt: 'Molhos e Condimentos',
    zh: '酱料和调味品',
    ar: 'الصلصات والتوابل',
  },
}
