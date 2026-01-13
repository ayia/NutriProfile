import { describe, it, expect } from 'vitest'
import {
  calculateNutrition,
  convertToGrams,
  searchFoods,
  NUTRITION_REFERENCE,
  DEFAULT_NUTRITION,
  COMMON_FOODS,
} from '../nutritionReference'

describe('nutritionReference', () => {
  describe('calculateNutrition', () => {
    it('calcule correctement pour un aliment connu en grammes', () => {
      // Pâtes: 131 cal/100g, 5g protein, 25g carbs, 1.1g fat
      const result = calculateNutrition('pâtes', 200, 'g')

      expect(result.calories).toBe(262) // 131 * 2
      expect(result.protein).toBe(10.0) // 5 * 2
      expect(result.carbs).toBe(50.0) // 25 * 2
      expect(result.fat).toBe(2.2) // 1.1 * 2
    })

    it('calcule correctement pour une portion', () => {
      // Portion = 150g par défaut
      // Riz: 130 cal/100g, 2.7g protein, 28g carbs
      const result = calculateNutrition('riz', 1, 'portion')

      // 130 * 1.5 = 195 cal
      expect(result.calories).toBe(195)
      expect(result.protein).toBe(4.1) // 2.7 * 1.5 = 4.05, arrondi à 4.1
      expect(result.carbs).toBe(42.0) // 28 * 1.5
    })

    it('utilise les valeurs par défaut pour aliment inconnu', () => {
      const result = calculateNutrition('aliment_inexistant', 100, 'g')

      expect(result.calories).toBe(DEFAULT_NUTRITION.calories)
      expect(result.protein).toBe(DEFAULT_NUTRITION.protein)
      expect(result.carbs).toBe(DEFAULT_NUTRITION.carbs)
      expect(result.fat).toBe(DEFAULT_NUTRITION.fat)
    })

    it('gère les quantités décimales', () => {
      // Poulet: 165 cal/100g
      const result = calculateNutrition('poulet', 75.5, 'g')

      // 165 * 0.755 = 124.575, arrondi à 125
      expect(result.calories).toBe(125)
    })

    it('est case-insensitive pour le nom', () => {
      const result1 = calculateNutrition('POULET', 100, 'g')
      const result2 = calculateNutrition('poulet', 100, 'g')
      const result3 = calculateNutrition('Poulet', 100, 'g')

      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })

    it('gère les noms avec espaces en début/fin', () => {
      const result1 = calculateNutrition('  poulet  ', 100, 'g')
      const result2 = calculateNutrition('poulet', 100, 'g')

      expect(result1).toEqual(result2)
    })

    it('calcule pour différentes unités', () => {
      // Cup = 240g
      const resultCup = calculateNutrition('riz', 1, 'cup')
      // 130 * 2.4 = 312
      expect(resultCup.calories).toBe(312)

      // Tbsp = 15g
      const resultTbsp = calculateNutrition('riz', 1, 'tbsp')
      // 130 * 0.15 = 19.5, arrondi à 20
      expect(resultTbsp.calories).toBe(20)
    })

    it('retourne des nombres avec précision correcte', () => {
      const result = calculateNutrition('pâtes', 150, 'g')

      // Vérifier que les décimales sont limitées à 1 chiffre
      expect(result.protein.toString()).toMatch(/^\d+\.\d$/)
      expect(result.carbs.toString()).toMatch(/^\d+\.\d$/)
      expect(result.fat.toString()).toMatch(/^\d+\.\d$/)
    })
  })

  describe('convertToGrams', () => {
    it('convertit correctement toutes les unités standard', () => {
      expect(convertToGrams(100, 'g')).toBe(100)
      expect(convertToGrams(100, 'ml')).toBe(100)
      expect(convertToGrams(1, 'portion')).toBe(150)
      expect(convertToGrams(1, 'piece')).toBe(100)
      expect(convertToGrams(1, 'cup')).toBe(240)
      expect(convertToGrams(1, 'tbsp')).toBe(15)
      expect(convertToGrams(1, 'tsp')).toBe(5)
    })

    it('multiplie correctement par la quantité', () => {
      expect(convertToGrams(2, 'portion')).toBe(300) // 2 * 150
      expect(convertToGrams(3, 'tbsp')).toBe(45) // 3 * 15
    })

    it('gère les unités inconnues avec valeur par défaut (100g)', () => {
      expect(convertToGrams(1, 'unité_inconnue')).toBe(100)
      expect(convertToGrams(2, 'xyz')).toBe(200)
    })

    it('gère les quantités décimales', () => {
      expect(convertToGrams(0.5, 'cup')).toBe(120) // 0.5 * 240
      expect(convertToGrams(1.5, 'portion')).toBe(225) // 1.5 * 150
    })

    it('est case-insensitive pour les unités', () => {
      expect(convertToGrams(1, 'G')).toBe(1)
      expect(convertToGrams(1, 'Cup')).toBe(240)
      expect(convertToGrams(1, 'PORTION')).toBe(150)
    })
  })

  describe('searchFoods', () => {
    it('retourne tous les aliments quand la requête est vide', () => {
      const results = searchFoods('', 50)
      expect(results.length).toBeGreaterThan(0)
      expect(results.length).toBeLessThanOrEqual(50)
    })

    it('filtre les aliments par recherche partielle', () => {
      const results = searchFoods('poulet')
      expect(results).toContain('poulet')
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('est case-insensitive', () => {
      const results1 = searchFoods('POULET')
      const results2 = searchFoods('poulet')
      expect(results1).toEqual(results2)
    })

    it('limite le nombre de résultats', () => {
      const results = searchFoods('', 5)
      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('retourne un tableau vide si aucun match', () => {
      const results = searchFoods('aliment_qui_nexiste_vraiment_pas')
      expect(results).toEqual([])
    })

    it('trouve les aliments avec recherche partielle', () => {
      const results = searchFoods('pa')
      // Devrait trouver "pâtes", "pain", "patate douce"
      expect(results.some(food => food.includes('pa'))).toBe(true)
    })
  })

  describe('NUTRITION_REFERENCE', () => {
    it('contient au minimum 20 aliments', () => {
      const foodCount = Object.keys(NUTRITION_REFERENCE).length
      expect(foodCount).toBeGreaterThanOrEqual(20)
    })

    it('tous les aliments ont les champs requis', () => {
      Object.entries(NUTRITION_REFERENCE).forEach(([name, nutrition]) => {
        expect(nutrition).toHaveProperty('calories')
        expect(nutrition).toHaveProperty('protein')
        expect(nutrition).toHaveProperty('carbs')
        expect(nutrition).toHaveProperty('fat')
        expect(nutrition).toHaveProperty('fiber')

        // Valeurs numériques
        expect(typeof nutrition.calories).toBe('number')
        expect(typeof nutrition.protein).toBe('number')
        expect(typeof nutrition.carbs).toBe('number')
        expect(typeof nutrition.fat).toBe('number')
        expect(typeof nutrition.fiber).toBe('number')

        // Valeurs positives ou zéro
        expect(nutrition.calories).toBeGreaterThan(0)
        expect(nutrition.protein).toBeGreaterThanOrEqual(0)
        expect(nutrition.carbs).toBeGreaterThanOrEqual(0)
        expect(nutrition.fat).toBeGreaterThanOrEqual(0)
        expect(nutrition.fiber).toBeGreaterThanOrEqual(0)
      })
    })

    it('contient les aliments de base attendus', () => {
      const essentialFoods = ['riz', 'pâtes', 'poulet', 'pain', 'pomme']
      essentialFoods.forEach(food => {
        expect(NUTRITION_REFERENCE).toHaveProperty(food)
      })
    })

    it('les valeurs nutritionnelles sont réalistes', () => {
      Object.entries(NUTRITION_REFERENCE).forEach(([name, nutrition]) => {
        // Les calories ne devraient pas dépasser 900 kcal/100g (valeur très haute)
        expect(nutrition.calories).toBeLessThan(900)
        // Les macros ne devraient pas dépasser 100g/100g
        expect(nutrition.protein).toBeLessThanOrEqual(100)
        expect(nutrition.carbs).toBeLessThanOrEqual(100)
        expect(nutrition.fat).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('COMMON_FOODS', () => {
    it('est un tableau trié alphabétiquement', () => {
      const sorted = [...COMMON_FOODS].sort()
      expect(COMMON_FOODS).toEqual(sorted)
    })

    it('contient le même nombre d\'aliments que NUTRITION_REFERENCE', () => {
      expect(COMMON_FOODS.length).toBe(Object.keys(NUTRITION_REFERENCE).length)
    })

    it('tous les aliments existent dans NUTRITION_REFERENCE', () => {
      COMMON_FOODS.forEach(food => {
        expect(NUTRITION_REFERENCE).toHaveProperty(food)
      })
    })
  })

  describe('DEFAULT_NUTRITION', () => {
    it('contient tous les champs requis', () => {
      expect(DEFAULT_NUTRITION).toHaveProperty('calories')
      expect(DEFAULT_NUTRITION).toHaveProperty('protein')
      expect(DEFAULT_NUTRITION).toHaveProperty('carbs')
      expect(DEFAULT_NUTRITION).toHaveProperty('fat')
      expect(DEFAULT_NUTRITION).toHaveProperty('fiber')
    })

    it('a des valeurs raisonnables', () => {
      expect(DEFAULT_NUTRITION.calories).toBeGreaterThan(0)
      expect(DEFAULT_NUTRITION.calories).toBeLessThan(500)
    })
  })
})
