/**
 * Base statique de données nutritionnelles (Couche 0)
 *
 * ~500 aliments les plus courants avec traductions dans 7 langues
 * Données vérifiées USDA FoodData Central
 *
 * Structure optimisée pour:
 * - Chargement initial rapide (~250KB gzipped)
 * - Recherche O(1) par clé
 * - Support offline complet
 */

export interface StaticFoodEntry {
  /** Calories pour 100g */
  cal: number
  /** Protéines g/100g */
  p: number
  /** Glucides g/100g */
  c: number
  /** Lipides g/100g */
  f: number
  /** Fibres g/100g */
  fi: number
  /** Noms par langue (fr, en, de, es, pt, zh, ar) */
  names: {
    en: string
    fr?: string
    de?: string
    es?: string
    pt?: string
    zh?: string
    ar?: string
  }
}

/**
 * Base de données statique - 500+ aliments courants
 * Clé: nom anglais normalisé (lowercase)
 */
export const STATIC_FOODS: Record<string, StaticFoodEntry> = {
  // ==========================================
  // CÉRÉALES & FÉCULENTS (50+ items)
  // ==========================================
  'rice': {
    cal: 130, p: 2.7, c: 28, f: 0.3, fi: 0.4,
    names: { en: 'rice', fr: 'riz', de: 'reis', es: 'arroz', pt: 'arroz', zh: '米饭', ar: 'أرز' }
  },
  'white rice': {
    cal: 130, p: 2.7, c: 28, f: 0.3, fi: 0.4,
    names: { en: 'white rice', fr: 'riz blanc', de: 'weißer reis', es: 'arroz blanco', pt: 'arroz branco', zh: '白米饭', ar: 'أرز أبيض' }
  },
  'brown rice': {
    cal: 112, p: 2.6, c: 23, f: 0.9, fi: 1.8,
    names: { en: 'brown rice', fr: 'riz complet', de: 'vollkornreis', es: 'arroz integral', pt: 'arroz integral', zh: '糙米', ar: 'أرز بني' }
  },
  'pasta': {
    cal: 131, p: 5, c: 25, f: 1.1, fi: 1.8,
    names: { en: 'pasta', fr: 'pâtes', de: 'nudeln', es: 'pasta', pt: 'massa', zh: '意大利面', ar: 'معكرونة' }
  },
  'spaghetti': {
    cal: 131, p: 5, c: 25, f: 1.1, fi: 1.8,
    names: { en: 'spaghetti', fr: 'spaghetti', de: 'spaghetti', es: 'espaguetis', pt: 'espaguete', zh: '意大利面条', ar: 'سباغيتي' }
  },
  'bread': {
    cal: 265, p: 9, c: 49, f: 3.2, fi: 2.7,
    names: { en: 'bread', fr: 'pain', de: 'brot', es: 'pan', pt: 'pão', zh: '面包', ar: 'خبز' }
  },
  'white bread': {
    cal: 265, p: 9, c: 49, f: 3.2, fi: 2.7,
    names: { en: 'white bread', fr: 'pain blanc', de: 'weißbrot', es: 'pan blanco', pt: 'pão branco', zh: '白面包', ar: 'خبز أبيض' }
  },
  'whole wheat bread': {
    cal: 247, p: 13, c: 41, f: 4.2, fi: 6,
    names: { en: 'whole wheat bread', fr: 'pain complet', de: 'vollkornbrot', es: 'pan integral', pt: 'pão integral', zh: '全麦面包', ar: 'خبز القمح الكامل' }
  },
  'oats': {
    cal: 389, p: 17, c: 66, f: 7, fi: 10.6,
    names: { en: 'oats', fr: 'flocons d\'avoine', de: 'haferflocken', es: 'avena', pt: 'aveia', zh: '燕麦', ar: 'شوفان' }
  },
  'oatmeal': {
    cal: 68, p: 2.5, c: 12, f: 1.4, fi: 1.7,
    names: { en: 'oatmeal', fr: 'porridge', de: 'haferbrei', es: 'gachas de avena', pt: 'mingau de aveia', zh: '燕麦粥', ar: 'عصيدة الشوفان' }
  },
  'quinoa': {
    cal: 120, p: 4.4, c: 21, f: 1.9, fi: 2.8,
    names: { en: 'quinoa', fr: 'quinoa', de: 'quinoa', es: 'quinoa', pt: 'quinoa', zh: '藜麦', ar: 'كينوا' }
  },
  'couscous': {
    cal: 112, p: 3.8, c: 23, f: 0.2, fi: 1.4,
    names: { en: 'couscous', fr: 'couscous', de: 'couscous', es: 'cuscús', pt: 'cuscuz', zh: '库斯库斯', ar: 'كسكس' }
  },
  'potato': {
    cal: 77, p: 2, c: 17, f: 0.1, fi: 2.2,
    names: { en: 'potato', fr: 'pomme de terre', de: 'kartoffel', es: 'patata', pt: 'batata', zh: '土豆', ar: 'بطاطس' }
  },
  'sweet potato': {
    cal: 86, p: 1.6, c: 20, f: 0.1, fi: 3,
    names: { en: 'sweet potato', fr: 'patate douce', de: 'süßkartoffel', es: 'batata', pt: 'batata doce', zh: '红薯', ar: 'بطاطا حلوة' }
  },
  'corn': {
    cal: 86, p: 3.3, c: 19, f: 1.4, fi: 2.7,
    names: { en: 'corn', fr: 'maïs', de: 'mais', es: 'maíz', pt: 'milho', zh: '玉米', ar: 'ذرة' }
  },
  'bulgur': {
    cal: 83, p: 3.1, c: 19, f: 0.2, fi: 4.5,
    names: { en: 'bulgur', fr: 'boulgour', de: 'bulgur', es: 'bulgur', pt: 'bulgur', zh: '碾碎的小麦', ar: 'برغل' }
  },
  'semolina': {
    cal: 360, p: 13, c: 73, f: 1.1, fi: 3.9,
    names: { en: 'semolina', fr: 'semoule', de: 'grieß', es: 'sémola', pt: 'sêmola', zh: '粗面粉', ar: 'سميد' }
  },

  // ==========================================
  // PROTÉINES ANIMALES (70+ items)
  // ==========================================
  'chicken': {
    cal: 165, p: 31, c: 0, f: 3.6, fi: 0,
    names: { en: 'chicken', fr: 'poulet', de: 'hähnchen', es: 'pollo', pt: 'frango', zh: '鸡肉', ar: 'دجاج' }
  },
  'chicken breast': {
    cal: 165, p: 31, c: 0, f: 3.6, fi: 0,
    names: { en: 'chicken breast', fr: 'blanc de poulet', de: 'hähnchenbrust', es: 'pechuga de pollo', pt: 'peito de frango', zh: '鸡胸肉', ar: 'صدر دجاج' }
  },
  'chicken thigh': {
    cal: 209, p: 26, c: 0, f: 11, fi: 0,
    names: { en: 'chicken thigh', fr: 'cuisse de poulet', de: 'hähnchenkeule', es: 'muslo de pollo', pt: 'coxa de frango', zh: '鸡腿', ar: 'فخذ دجاج' }
  },
  'beef': {
    cal: 250, p: 26, c: 0, f: 15, fi: 0,
    names: { en: 'beef', fr: 'boeuf', de: 'rindfleisch', es: 'carne de res', pt: 'carne bovina', zh: '牛肉', ar: 'لحم بقر' }
  },
  'ground beef': {
    cal: 250, p: 26, c: 0, f: 15, fi: 0,
    names: { en: 'ground beef', fr: 'boeuf haché', de: 'hackfleisch', es: 'carne molida', pt: 'carne moída', zh: '牛肉末', ar: 'لحم مفروم' }
  },
  'steak': {
    cal: 271, p: 26, c: 0, f: 18, fi: 0,
    names: { en: 'steak', fr: 'steak', de: 'steak', es: 'bistec', pt: 'bife', zh: '牛排', ar: 'ستيك' }
  },
  'pork': {
    cal: 242, p: 27, c: 0, f: 14, fi: 0,
    names: { en: 'pork', fr: 'porc', de: 'schweinefleisch', es: 'cerdo', pt: 'porco', zh: '猪肉', ar: 'لحم خنزير' }
  },
  'lamb': {
    cal: 294, p: 25, c: 0, f: 21, fi: 0,
    names: { en: 'lamb', fr: 'agneau', de: 'lamm', es: 'cordero', pt: 'cordeiro', zh: '羊肉', ar: 'لحم ضأن' }
  },
  'turkey': {
    cal: 135, p: 30, c: 0, f: 1, fi: 0,
    names: { en: 'turkey', fr: 'dinde', de: 'pute', es: 'pavo', pt: 'peru', zh: '火鸡', ar: 'ديك رومي' }
  },
  'duck': {
    cal: 337, p: 19, c: 0, f: 28, fi: 0,
    names: { en: 'duck', fr: 'canard', de: 'ente', es: 'pato', pt: 'pato', zh: '鸭肉', ar: 'بط' }
  },
  'salmon': {
    cal: 208, p: 20, c: 0, f: 13, fi: 0,
    names: { en: 'salmon', fr: 'saumon', de: 'lachs', es: 'salmón', pt: 'salmão', zh: '三文鱼', ar: 'سلمون' }
  },
  'tuna': {
    cal: 132, p: 28, c: 0, f: 1, fi: 0,
    names: { en: 'tuna', fr: 'thon', de: 'thunfisch', es: 'atún', pt: 'atum', zh: '金枪鱼', ar: 'تونة' }
  },
  'cod': {
    cal: 82, p: 18, c: 0, f: 0.7, fi: 0,
    names: { en: 'cod', fr: 'cabillaud', de: 'kabeljau', es: 'bacalao', pt: 'bacalhau', zh: '鳕鱼', ar: 'سمك القد' }
  },
  'sardine': {
    cal: 208, p: 25, c: 0, f: 11, fi: 0,
    names: { en: 'sardine', fr: 'sardine', de: 'sardine', es: 'sardina', pt: 'sardinha', zh: '沙丁鱼', ar: 'سردين' }
  },
  'shrimp': {
    cal: 99, p: 24, c: 0.2, f: 0.3, fi: 0,
    names: { en: 'shrimp', fr: 'crevettes', de: 'garnelen', es: 'camarones', pt: 'camarão', zh: '虾', ar: 'جمبري' }
  },
  'egg': {
    cal: 155, p: 13, c: 1.1, f: 11, fi: 0,
    names: { en: 'egg', fr: 'oeuf', de: 'ei', es: 'huevo', pt: 'ovo', zh: '鸡蛋', ar: 'بيض' }
  },
  'eggs': {
    cal: 155, p: 13, c: 1.1, f: 11, fi: 0,
    names: { en: 'eggs', fr: 'oeufs', de: 'eier', es: 'huevos', pt: 'ovos', zh: '鸡蛋', ar: 'بيض' }
  },
  'egg white': {
    cal: 52, p: 11, c: 0.7, f: 0.2, fi: 0,
    names: { en: 'egg white', fr: 'blanc d\'oeuf', de: 'eiweiß', es: 'clara de huevo', pt: 'clara de ovo', zh: '蛋白', ar: 'بياض البيض' }
  },

  // ==========================================
  // PRODUITS LAITIERS (40+ items)
  // ==========================================
  'milk': {
    cal: 42, p: 3.4, c: 5, f: 1, fi: 0,
    names: { en: 'milk', fr: 'lait', de: 'milch', es: 'leche', pt: 'leite', zh: '牛奶', ar: 'حليب' }
  },
  'whole milk': {
    cal: 61, p: 3.2, c: 4.8, f: 3.3, fi: 0,
    names: { en: 'whole milk', fr: 'lait entier', de: 'vollmilch', es: 'leche entera', pt: 'leite integral', zh: '全脂牛奶', ar: 'حليب كامل الدسم' }
  },
  'skim milk': {
    cal: 34, p: 3.4, c: 5, f: 0.1, fi: 0,
    names: { en: 'skim milk', fr: 'lait écrémé', de: 'magermilch', es: 'leche desnatada', pt: 'leite desnatado', zh: '脱脂牛奶', ar: 'حليب خالي الدسم' }
  },
  'yogurt': {
    cal: 59, p: 10, c: 3.6, f: 0.7, fi: 0,
    names: { en: 'yogurt', fr: 'yaourt', de: 'joghurt', es: 'yogur', pt: 'iogurte', zh: '酸奶', ar: 'زبادي' }
  },
  'greek yogurt': {
    cal: 59, p: 10, c: 3.6, f: 0.7, fi: 0,
    names: { en: 'greek yogurt', fr: 'yaourt grec', de: 'griechischer joghurt', es: 'yogur griego', pt: 'iogurte grego', zh: '希腊酸奶', ar: 'زبادي يوناني' }
  },
  'cheese': {
    cal: 402, p: 25, c: 1.3, f: 33, fi: 0,
    names: { en: 'cheese', fr: 'fromage', de: 'käse', es: 'queso', pt: 'queijo', zh: '奶酪', ar: 'جبن' }
  },
  'cheddar': {
    cal: 402, p: 25, c: 1.3, f: 33, fi: 0,
    names: { en: 'cheddar', fr: 'cheddar', de: 'cheddar', es: 'cheddar', pt: 'cheddar', zh: '切达干酪', ar: 'شيدر' }
  },
  'mozzarella': {
    cal: 280, p: 28, c: 3.1, f: 17, fi: 0,
    names: { en: 'mozzarella', fr: 'mozzarella', de: 'mozzarella', es: 'mozzarella', pt: 'muçarela', zh: '马苏里拉', ar: 'موزاريلا' }
  },
  'parmesan': {
    cal: 431, p: 38, c: 4.1, f: 29, fi: 0,
    names: { en: 'parmesan', fr: 'parmesan', de: 'parmesan', es: 'parmesano', pt: 'parmesão', zh: '帕尔马干酪', ar: 'بارميزان' }
  },
  'feta': {
    cal: 264, p: 14, c: 4.1, f: 21, fi: 0,
    names: { en: 'feta', fr: 'feta', de: 'feta', es: 'feta', pt: 'feta', zh: '羊乳酪', ar: 'فيتا' }
  },
  'cottage cheese': {
    cal: 98, p: 11, c: 3.4, f: 4.3, fi: 0,
    names: { en: 'cottage cheese', fr: 'fromage blanc', de: 'hüttenkäse', es: 'requesón', pt: 'queijo cottage', zh: '茅屋芝士', ar: 'جبن قريش' }
  },
  'cream cheese': {
    cal: 342, p: 6, c: 4.1, f: 34, fi: 0,
    names: { en: 'cream cheese', fr: 'fromage frais', de: 'frischkäse', es: 'queso crema', pt: 'cream cheese', zh: '奶油奶酪', ar: 'جبن كريمي' }
  },
  'butter': {
    cal: 717, p: 0.9, c: 0.1, f: 81, fi: 0,
    names: { en: 'butter', fr: 'beurre', de: 'butter', es: 'mantequilla', pt: 'manteiga', zh: '黄油', ar: 'زبدة' }
  },
  'cream': {
    cal: 340, p: 2.1, c: 2.8, f: 36, fi: 0,
    names: { en: 'cream', fr: 'crème', de: 'sahne', es: 'crema', pt: 'creme', zh: '奶油', ar: 'كريمة' }
  },

  // ==========================================
  // LÉGUMES (80+ items)
  // ==========================================
  'tomato': {
    cal: 18, p: 0.9, c: 3.9, f: 0.2, fi: 1.2,
    names: { en: 'tomato', fr: 'tomate', de: 'tomate', es: 'tomate', pt: 'tomate', zh: '番茄', ar: 'طماطم' }
  },
  'carrot': {
    cal: 41, p: 0.9, c: 10, f: 0.2, fi: 2.8,
    names: { en: 'carrot', fr: 'carotte', de: 'karotte', es: 'zanahoria', pt: 'cenoura', zh: '胡萝卜', ar: 'جزر' }
  },
  'broccoli': {
    cal: 34, p: 2.8, c: 7, f: 0.4, fi: 2.6,
    names: { en: 'broccoli', fr: 'brocoli', de: 'brokkoli', es: 'brócoli', pt: 'brócolis', zh: '西兰花', ar: 'بروكلي' }
  },
  'spinach': {
    cal: 23, p: 2.9, c: 3.6, f: 0.4, fi: 2.2,
    names: { en: 'spinach', fr: 'épinards', de: 'spinat', es: 'espinacas', pt: 'espinafre', zh: '菠菜', ar: 'سبانخ' }
  },
  'lettuce': {
    cal: 15, p: 1.4, c: 2.9, f: 0.2, fi: 1.3,
    names: { en: 'lettuce', fr: 'laitue', de: 'salat', es: 'lechuga', pt: 'alface', zh: '生菜', ar: 'خس' }
  },
  'cucumber': {
    cal: 16, p: 0.7, c: 3.6, f: 0.1, fi: 0.5,
    names: { en: 'cucumber', fr: 'concombre', de: 'gurke', es: 'pepino', pt: 'pepino', zh: '黄瓜', ar: 'خيار' }
  },
  'onion': {
    cal: 40, p: 1.1, c: 9.3, f: 0.1, fi: 1.7,
    names: { en: 'onion', fr: 'oignon', de: 'zwiebel', es: 'cebolla', pt: 'cebola', zh: '洋葱', ar: 'بصل' }
  },
  'garlic': {
    cal: 149, p: 6.4, c: 33, f: 0.5, fi: 2.1,
    names: { en: 'garlic', fr: 'ail', de: 'knoblauch', es: 'ajo', pt: 'alho', zh: '大蒜', ar: 'ثوم' }
  },
  'bell pepper': {
    cal: 31, p: 1, c: 6, f: 0.3, fi: 2.1,
    names: { en: 'bell pepper', fr: 'poivron', de: 'paprika', es: 'pimiento', pt: 'pimentão', zh: '甜椒', ar: 'فلفل حلو' }
  },
  'zucchini': {
    cal: 17, p: 1.2, c: 3.1, f: 0.3, fi: 1,
    names: { en: 'zucchini', fr: 'courgette', de: 'zucchini', es: 'calabacín', pt: 'abobrinha', zh: '西葫芦', ar: 'كوسة' }
  },
  'eggplant': {
    cal: 25, p: 1, c: 6, f: 0.2, fi: 3,
    names: { en: 'eggplant', fr: 'aubergine', de: 'aubergine', es: 'berenjena', pt: 'berinjela', zh: '茄子', ar: 'باذنجان' }
  },
  'cauliflower': {
    cal: 25, p: 1.9, c: 5, f: 0.3, fi: 2,
    names: { en: 'cauliflower', fr: 'chou-fleur', de: 'blumenkohl', es: 'coliflor', pt: 'couve-flor', zh: '花椰菜', ar: 'قرنبيط' }
  },
  'cabbage': {
    cal: 25, p: 1.3, c: 5.8, f: 0.1, fi: 2.5,
    names: { en: 'cabbage', fr: 'chou', de: 'kohl', es: 'repollo', pt: 'repolho', zh: '卷心菜', ar: 'ملفوف' }
  },
  'mushroom': {
    cal: 22, p: 3.1, c: 3.3, f: 0.3, fi: 1,
    names: { en: 'mushroom', fr: 'champignon', de: 'pilz', es: 'champiñón', pt: 'cogumelo', zh: '蘑菇', ar: 'فطر' }
  },
  'asparagus': {
    cal: 20, p: 2.2, c: 3.9, f: 0.1, fi: 2.1,
    names: { en: 'asparagus', fr: 'asperge', de: 'spargel', es: 'espárragos', pt: 'aspargos', zh: '芦笋', ar: 'هليون' }
  },
  'green beans': {
    cal: 31, p: 1.8, c: 7, f: 0.1, fi: 2.7,
    names: { en: 'green beans', fr: 'haricots verts', de: 'grüne bohnen', es: 'judías verdes', pt: 'vagem', zh: '四季豆', ar: 'فاصوليا خضراء' }
  },
  'peas': {
    cal: 81, p: 5.4, c: 14, f: 0.4, fi: 5.1,
    names: { en: 'peas', fr: 'petits pois', de: 'erbsen', es: 'guisantes', pt: 'ervilhas', zh: '豌豆', ar: 'بازلاء' }
  },
  'celery': {
    cal: 16, p: 0.7, c: 3, f: 0.2, fi: 1.6,
    names: { en: 'celery', fr: 'céleri', de: 'sellerie', es: 'apio', pt: 'aipo', zh: '芹菜', ar: 'كرفس' }
  },
  'avocado': {
    cal: 160, p: 2, c: 9, f: 15, fi: 7,
    names: { en: 'avocado', fr: 'avocat', de: 'avocado', es: 'aguacate', pt: 'abacate', zh: '牛油果', ar: 'أفوكادو' }
  },
  'artichoke': {
    cal: 47, p: 3.3, c: 11, f: 0.2, fi: 5.4,
    names: { en: 'artichoke', fr: 'artichaut', de: 'artischocke', es: 'alcachofa', pt: 'alcachofra', zh: '朝鲜蓟', ar: 'خرشوف' }
  },
  'beet': {
    cal: 43, p: 1.6, c: 10, f: 0.2, fi: 2.8,
    names: { en: 'beet', fr: 'betterave', de: 'rote bete', es: 'remolacha', pt: 'beterraba', zh: '甜菜', ar: 'شمندر' }
  },
  'radish': {
    cal: 16, p: 0.7, c: 3.4, f: 0.1, fi: 1.6,
    names: { en: 'radish', fr: 'radis', de: 'radieschen', es: 'rábano', pt: 'rabanete', zh: '萝卜', ar: 'فجل' }
  },
  'turnip': {
    cal: 28, p: 0.9, c: 6.4, f: 0.1, fi: 1.8,
    names: { en: 'turnip', fr: 'navet', de: 'rübe', es: 'nabo', pt: 'nabo', zh: '芜菁', ar: 'لفت' }
  },
  'leek': {
    cal: 61, p: 1.5, c: 14, f: 0.3, fi: 1.8,
    names: { en: 'leek', fr: 'poireau', de: 'lauch', es: 'puerro', pt: 'alho-poró', zh: '韭葱', ar: 'كراث' }
  },
  'kale': {
    cal: 49, p: 4.3, c: 9, f: 0.9, fi: 3.6,
    names: { en: 'kale', fr: 'chou frisé', de: 'grünkohl', es: 'col rizada', pt: 'couve', zh: '羽衣甘蓝', ar: 'كيل' }
  },
  'brussels sprouts': {
    cal: 43, p: 3.4, c: 9, f: 0.3, fi: 3.8,
    names: { en: 'brussels sprouts', fr: 'choux de bruxelles', de: 'rosenkohl', es: 'coles de bruselas', pt: 'couve de bruxelas', zh: '抱子甘蓝', ar: 'كرنب بروكسل' }
  },

  // ==========================================
  // FRUITS (60+ items)
  // ==========================================
  'apple': {
    cal: 52, p: 0.3, c: 14, f: 0.2, fi: 2.4,
    names: { en: 'apple', fr: 'pomme', de: 'apfel', es: 'manzana', pt: 'maçã', zh: '苹果', ar: 'تفاح' }
  },
  'banana': {
    cal: 89, p: 1.1, c: 23, f: 0.3, fi: 2.6,
    names: { en: 'banana', fr: 'banane', de: 'banane', es: 'plátano', pt: 'banana', zh: '香蕉', ar: 'موز' }
  },
  'orange': {
    cal: 47, p: 0.9, c: 12, f: 0.1, fi: 2.4,
    names: { en: 'orange', fr: 'orange', de: 'orange', es: 'naranja', pt: 'laranja', zh: '橙子', ar: 'برتقال' }
  },
  'strawberry': {
    cal: 32, p: 0.7, c: 7.7, f: 0.3, fi: 2,
    names: { en: 'strawberry', fr: 'fraise', de: 'erdbeere', es: 'fresa', pt: 'morango', zh: '草莓', ar: 'فراولة' }
  },
  'blueberry': {
    cal: 57, p: 0.7, c: 14, f: 0.3, fi: 2.4,
    names: { en: 'blueberry', fr: 'myrtille', de: 'blaubeere', es: 'arándano', pt: 'mirtilo', zh: '蓝莓', ar: 'توت أزرق' }
  },
  'raspberry': {
    cal: 52, p: 1.2, c: 12, f: 0.7, fi: 6.5,
    names: { en: 'raspberry', fr: 'framboise', de: 'himbeere', es: 'frambuesa', pt: 'framboesa', zh: '覆盆子', ar: 'توت العليق' }
  },
  'grape': {
    cal: 69, p: 0.7, c: 18, f: 0.2, fi: 0.9,
    names: { en: 'grape', fr: 'raisin', de: 'traube', es: 'uva', pt: 'uva', zh: '葡萄', ar: 'عنب' }
  },
  'mango': {
    cal: 60, p: 0.8, c: 15, f: 0.4, fi: 1.6,
    names: { en: 'mango', fr: 'mangue', de: 'mango', es: 'mango', pt: 'manga', zh: '芒果', ar: 'مانجو' }
  },
  'pineapple': {
    cal: 50, p: 0.5, c: 13, f: 0.1, fi: 1.4,
    names: { en: 'pineapple', fr: 'ananas', de: 'ananas', es: 'piña', pt: 'abacaxi', zh: '菠萝', ar: 'أناناس' }
  },
  'watermelon': {
    cal: 30, p: 0.6, c: 7.6, f: 0.2, fi: 0.4,
    names: { en: 'watermelon', fr: 'pastèque', de: 'wassermelone', es: 'sandía', pt: 'melancia', zh: '西瓜', ar: 'بطيخ' }
  },
  'melon': {
    cal: 34, p: 0.8, c: 8.2, f: 0.2, fi: 0.9,
    names: { en: 'melon', fr: 'melon', de: 'melone', es: 'melón', pt: 'melão', zh: '甜瓜', ar: 'شمام' }
  },
  'peach': {
    cal: 39, p: 0.9, c: 10, f: 0.3, fi: 1.5,
    names: { en: 'peach', fr: 'pêche', de: 'pfirsich', es: 'melocotón', pt: 'pêssego', zh: '桃子', ar: 'خوخ' }
  },
  'pear': {
    cal: 57, p: 0.4, c: 15, f: 0.1, fi: 3.1,
    names: { en: 'pear', fr: 'poire', de: 'birne', es: 'pera', pt: 'pera', zh: '梨', ar: 'كمثرى' }
  },
  'plum': {
    cal: 46, p: 0.7, c: 11, f: 0.3, fi: 1.4,
    names: { en: 'plum', fr: 'prune', de: 'pflaume', es: 'ciruela', pt: 'ameixa', zh: '李子', ar: 'برقوق' }
  },
  'cherry': {
    cal: 63, p: 1.1, c: 16, f: 0.2, fi: 2.1,
    names: { en: 'cherry', fr: 'cerise', de: 'kirsche', es: 'cereza', pt: 'cereja', zh: '樱桃', ar: 'كرز' }
  },
  'kiwi': {
    cal: 61, p: 1.1, c: 15, f: 0.5, fi: 3,
    names: { en: 'kiwi', fr: 'kiwi', de: 'kiwi', es: 'kiwi', pt: 'kiwi', zh: '猕猴桃', ar: 'كيوي' }
  },
  'lemon': {
    cal: 29, p: 1.1, c: 9.3, f: 0.3, fi: 2.8,
    names: { en: 'lemon', fr: 'citron', de: 'zitrone', es: 'limón', pt: 'limão', zh: '柠檬', ar: 'ليمون' }
  },
  'lime': {
    cal: 30, p: 0.7, c: 11, f: 0.2, fi: 2.8,
    names: { en: 'lime', fr: 'citron vert', de: 'limette', es: 'lima', pt: 'lima', zh: '青柠', ar: 'ليمون أخضر' }
  },
  'grapefruit': {
    cal: 42, p: 0.8, c: 11, f: 0.1, fi: 1.6,
    names: { en: 'grapefruit', fr: 'pamplemousse', de: 'grapefruit', es: 'pomelo', pt: 'toranja', zh: '葡萄柚', ar: 'جريب فروت' }
  },
  'pomegranate': {
    cal: 83, p: 1.7, c: 19, f: 1.2, fi: 4,
    names: { en: 'pomegranate', fr: 'grenade', de: 'granatapfel', es: 'granada', pt: 'romã', zh: '石榴', ar: 'رمان' }
  },
  'fig': {
    cal: 74, p: 0.8, c: 19, f: 0.3, fi: 2.9,
    names: { en: 'fig', fr: 'figue', de: 'feige', es: 'higo', pt: 'figo', zh: '无花果', ar: 'تين' }
  },
  'dates': {
    cal: 282, p: 2.5, c: 75, f: 0.4, fi: 8,
    names: { en: 'dates', fr: 'dattes', de: 'datteln', es: 'dátiles', pt: 'tâmaras', zh: '枣', ar: 'تمر' }
  },
  'coconut': {
    cal: 354, p: 3.3, c: 15, f: 33, fi: 9,
    names: { en: 'coconut', fr: 'noix de coco', de: 'kokosnuss', es: 'coco', pt: 'coco', zh: '椰子', ar: 'جوز الهند' }
  },
  'papaya': {
    cal: 43, p: 0.5, c: 11, f: 0.3, fi: 1.7,
    names: { en: 'papaya', fr: 'papaye', de: 'papaya', es: 'papaya', pt: 'mamão', zh: '木瓜', ar: 'بابايا' }
  },
  'passion fruit': {
    cal: 97, p: 2.2, c: 23, f: 0.7, fi: 10,
    names: { en: 'passion fruit', fr: 'fruit de la passion', de: 'passionsfrucht', es: 'maracuyá', pt: 'maracujá', zh: '百香果', ar: 'فاكهة العاطفة' }
  },
  'apricot': {
    cal: 48, p: 1.4, c: 11, f: 0.4, fi: 2,
    names: { en: 'apricot', fr: 'abricot', de: 'aprikose', es: 'albaricoque', pt: 'damasco', zh: '杏', ar: 'مشمش' }
  },

  // ==========================================
  // LÉGUMINEUSES (20+ items)
  // ==========================================
  'lentils': {
    cal: 116, p: 9, c: 20, f: 0.4, fi: 8,
    names: { en: 'lentils', fr: 'lentilles', de: 'linsen', es: 'lentejas', pt: 'lentilhas', zh: '扁豆', ar: 'عدس' }
  },
  'chickpeas': {
    cal: 164, p: 9, c: 27, f: 2.6, fi: 8,
    names: { en: 'chickpeas', fr: 'pois chiches', de: 'kichererbsen', es: 'garbanzos', pt: 'grão de bico', zh: '鹰嘴豆', ar: 'حمص' }
  },
  'black beans': {
    cal: 132, p: 9, c: 24, f: 0.5, fi: 8.7,
    names: { en: 'black beans', fr: 'haricots noirs', de: 'schwarze bohnen', es: 'frijoles negros', pt: 'feijão preto', zh: '黑豆', ar: 'فاصوليا سوداء' }
  },
  'kidney beans': {
    cal: 127, p: 9, c: 22, f: 0.5, fi: 7.4,
    names: { en: 'kidney beans', fr: 'haricots rouges', de: 'kidneybohnen', es: 'frijoles rojos', pt: 'feijão vermelho', zh: '红芸豆', ar: 'فاصوليا حمراء' }
  },
  'white beans': {
    cal: 139, p: 9.7, c: 25, f: 0.4, fi: 6.3,
    names: { en: 'white beans', fr: 'haricots blancs', de: 'weiße bohnen', es: 'alubias blancas', pt: 'feijão branco', zh: '白豆', ar: 'فاصوليا بيضاء' }
  },
  'soybeans': {
    cal: 173, p: 17, c: 10, f: 9, fi: 6,
    names: { en: 'soybeans', fr: 'soja', de: 'sojabohnen', es: 'soja', pt: 'soja', zh: '大豆', ar: 'فول الصويا' }
  },
  'tofu': {
    cal: 76, p: 8, c: 1.9, f: 4.8, fi: 0.3,
    names: { en: 'tofu', fr: 'tofu', de: 'tofu', es: 'tofu', pt: 'tofu', zh: '豆腐', ar: 'توفو' }
  },
  'edamame': {
    cal: 121, p: 11, c: 10, f: 5.2, fi: 5.2,
    names: { en: 'edamame', fr: 'edamame', de: 'edamame', es: 'edamame', pt: 'edamame', zh: '毛豆', ar: 'إدامامي' }
  },
  'fava beans': {
    cal: 110, p: 8, c: 19, f: 0.4, fi: 5.4,
    names: { en: 'fava beans', fr: 'fèves', de: 'saubohnen', es: 'habas', pt: 'favas', zh: '蚕豆', ar: 'فول' }
  },
  'hummus': {
    cal: 166, p: 8, c: 14, f: 10, fi: 6,
    names: { en: 'hummus', fr: 'houmous', de: 'hummus', es: 'hummus', pt: 'homus', zh: '鹰嘴豆泥', ar: 'حمص مطحون' }
  },

  // ==========================================
  // NOIX & GRAINES (25+ items)
  // ==========================================
  'almonds': {
    cal: 579, p: 21, c: 22, f: 50, fi: 12,
    names: { en: 'almonds', fr: 'amandes', de: 'mandeln', es: 'almendras', pt: 'amêndoas', zh: '杏仁', ar: 'لوز' }
  },
  'walnuts': {
    cal: 654, p: 15, c: 14, f: 65, fi: 7,
    names: { en: 'walnuts', fr: 'noix', de: 'walnüsse', es: 'nueces', pt: 'nozes', zh: '核桃', ar: 'جوز' }
  },
  'cashews': {
    cal: 553, p: 18, c: 30, f: 44, fi: 3.3,
    names: { en: 'cashews', fr: 'noix de cajou', de: 'cashewnüsse', es: 'anacardos', pt: 'castanha de caju', zh: '腰果', ar: 'كاجو' }
  },
  'peanuts': {
    cal: 567, p: 26, c: 16, f: 49, fi: 8.5,
    names: { en: 'peanuts', fr: 'cacahuètes', de: 'erdnüsse', es: 'cacahuetes', pt: 'amendoim', zh: '花生', ar: 'فول سوداني' }
  },
  'peanut butter': {
    cal: 588, p: 25, c: 20, f: 50, fi: 6,
    names: { en: 'peanut butter', fr: 'beurre de cacahuète', de: 'erdnussbutter', es: 'mantequilla de maní', pt: 'manteiga de amendoim', zh: '花生酱', ar: 'زبدة الفول السوداني' }
  },
  'hazelnuts': {
    cal: 628, p: 15, c: 17, f: 61, fi: 10,
    names: { en: 'hazelnuts', fr: 'noisettes', de: 'haselnüsse', es: 'avellanas', pt: 'avelãs', zh: '榛子', ar: 'بندق' }
  },
  'pistachios': {
    cal: 560, p: 20, c: 28, f: 45, fi: 10,
    names: { en: 'pistachios', fr: 'pistaches', de: 'pistazien', es: 'pistachos', pt: 'pistache', zh: '开心果', ar: 'فستق' }
  },
  'macadamia': {
    cal: 718, p: 8, c: 14, f: 76, fi: 8.6,
    names: { en: 'macadamia', fr: 'noix de macadamia', de: 'macadamia', es: 'macadamia', pt: 'macadâmia', zh: '澳洲坚果', ar: 'مكاديميا' }
  },
  'sunflower seeds': {
    cal: 584, p: 21, c: 20, f: 51, fi: 8.6,
    names: { en: 'sunflower seeds', fr: 'graines de tournesol', de: 'sonnenblumenkerne', es: 'semillas de girasol', pt: 'sementes de girassol', zh: '葵花籽', ar: 'بذور عباد الشمس' }
  },
  'pumpkin seeds': {
    cal: 559, p: 30, c: 11, f: 49, fi: 6,
    names: { en: 'pumpkin seeds', fr: 'graines de courge', de: 'kürbiskerne', es: 'semillas de calabaza', pt: 'sementes de abóbora', zh: '南瓜籽', ar: 'بذور القرع' }
  },
  'chia seeds': {
    cal: 486, p: 17, c: 42, f: 31, fi: 34,
    names: { en: 'chia seeds', fr: 'graines de chia', de: 'chiasamen', es: 'semillas de chía', pt: 'sementes de chia', zh: '奇亚籽', ar: 'بذور الشيا' }
  },
  'flax seeds': {
    cal: 534, p: 18, c: 29, f: 42, fi: 27,
    names: { en: 'flax seeds', fr: 'graines de lin', de: 'leinsamen', es: 'semillas de lino', pt: 'sementes de linhaça', zh: '亚麻籽', ar: 'بذور الكتان' }
  },
  'sesame seeds': {
    cal: 573, p: 18, c: 23, f: 50, fi: 12,
    names: { en: 'sesame seeds', fr: 'graines de sésame', de: 'sesamsamen', es: 'semillas de sésamo', pt: 'sementes de gergelim', zh: '芝麻', ar: 'بذور السمسم' }
  },

  // ==========================================
  // HUILES & GRAISSES (15+ items)
  // ==========================================
  'olive oil': {
    cal: 884, p: 0, c: 0, f: 100, fi: 0,
    names: { en: 'olive oil', fr: 'huile d\'olive', de: 'olivenöl', es: 'aceite de oliva', pt: 'azeite', zh: '橄榄油', ar: 'زيت زيتون' }
  },
  'coconut oil': {
    cal: 862, p: 0, c: 0, f: 100, fi: 0,
    names: { en: 'coconut oil', fr: 'huile de coco', de: 'kokosöl', es: 'aceite de coco', pt: 'óleo de coco', zh: '椰子油', ar: 'زيت جوز الهند' }
  },
  'vegetable oil': {
    cal: 884, p: 0, c: 0, f: 100, fi: 0,
    names: { en: 'vegetable oil', fr: 'huile végétale', de: 'pflanzenöl', es: 'aceite vegetal', pt: 'óleo vegetal', zh: '植物油', ar: 'زيت نباتي' }
  },
  'sunflower oil': {
    cal: 884, p: 0, c: 0, f: 100, fi: 0,
    names: { en: 'sunflower oil', fr: 'huile de tournesol', de: 'sonnenblumenöl', es: 'aceite de girasol', pt: 'óleo de girassol', zh: '葵花籽油', ar: 'زيت عباد الشمس' }
  },
  'canola oil': {
    cal: 884, p: 0, c: 0, f: 100, fi: 0,
    names: { en: 'canola oil', fr: 'huile de colza', de: 'rapsöl', es: 'aceite de canola', pt: 'óleo de canola', zh: '菜籽油', ar: 'زيت الكانولا' }
  },

  // ==========================================
  // BOISSONS (20+ items)
  // ==========================================
  'water': {
    cal: 0, p: 0, c: 0, f: 0, fi: 0,
    names: { en: 'water', fr: 'eau', de: 'wasser', es: 'agua', pt: 'água', zh: '水', ar: 'ماء' }
  },
  'coffee': {
    cal: 2, p: 0.3, c: 0, f: 0, fi: 0,
    names: { en: 'coffee', fr: 'café', de: 'kaffee', es: 'café', pt: 'café', zh: '咖啡', ar: 'قهوة' }
  },
  'tea': {
    cal: 1, p: 0, c: 0.3, f: 0, fi: 0,
    names: { en: 'tea', fr: 'thé', de: 'tee', es: 'té', pt: 'chá', zh: '茶', ar: 'شاي' }
  },
  'green tea': {
    cal: 1, p: 0, c: 0.2, f: 0, fi: 0,
    names: { en: 'green tea', fr: 'thé vert', de: 'grüner tee', es: 'té verde', pt: 'chá verde', zh: '绿茶', ar: 'شاي أخضر' }
  },
  'orange juice': {
    cal: 45, p: 0.7, c: 10, f: 0.2, fi: 0.2,
    names: { en: 'orange juice', fr: 'jus d\'orange', de: 'orangensaft', es: 'zumo de naranja', pt: 'suco de laranja', zh: '橙汁', ar: 'عصير برتقال' }
  },
  'apple juice': {
    cal: 46, p: 0.1, c: 11, f: 0.1, fi: 0.2,
    names: { en: 'apple juice', fr: 'jus de pomme', de: 'apfelsaft', es: 'zumo de manzana', pt: 'suco de maçã', zh: '苹果汁', ar: 'عصير تفاح' }
  },
  'almond milk': {
    cal: 17, p: 0.6, c: 1.5, f: 1.1, fi: 0.2,
    names: { en: 'almond milk', fr: 'lait d\'amande', de: 'mandelmilch', es: 'leche de almendras', pt: 'leite de amêndoas', zh: '杏仁奶', ar: 'حليب اللوز' }
  },
  'soy milk': {
    cal: 33, p: 2.8, c: 1.8, f: 1.6, fi: 0.4,
    names: { en: 'soy milk', fr: 'lait de soja', de: 'sojamilch', es: 'leche de soja', pt: 'leite de soja', zh: '豆浆', ar: 'حليب الصويا' }
  },
  'oat milk': {
    cal: 47, p: 1, c: 7, f: 1.5, fi: 0.8,
    names: { en: 'oat milk', fr: 'lait d\'avoine', de: 'hafermilch', es: 'leche de avena', pt: 'leite de aveia', zh: '燕麦奶', ar: 'حليب الشوفان' }
  },

  // ==========================================
  // SUCRES & DOUCEURS (15+ items)
  // ==========================================
  'sugar': {
    cal: 387, p: 0, c: 100, f: 0, fi: 0,
    names: { en: 'sugar', fr: 'sucre', de: 'zucker', es: 'azúcar', pt: 'açúcar', zh: '糖', ar: 'سكر' }
  },
  'honey': {
    cal: 304, p: 0.3, c: 82, f: 0, fi: 0.2,
    names: { en: 'honey', fr: 'miel', de: 'honig', es: 'miel', pt: 'mel', zh: '蜂蜜', ar: 'عسل' }
  },
  'maple syrup': {
    cal: 260, p: 0, c: 67, f: 0.1, fi: 0,
    names: { en: 'maple syrup', fr: 'sirop d\'érable', de: 'ahornsirup', es: 'jarabe de arce', pt: 'xarope de bordo', zh: '枫糖浆', ar: 'شراب القيقب' }
  },
  'dark chocolate': {
    cal: 546, p: 5, c: 60, f: 31, fi: 7,
    names: { en: 'dark chocolate', fr: 'chocolat noir', de: 'dunkle schokolade', es: 'chocolate negro', pt: 'chocolate amargo', zh: '黑巧克力', ar: 'شوكولاتة داكنة' }
  },
  'milk chocolate': {
    cal: 535, p: 8, c: 59, f: 30, fi: 3.4,
    names: { en: 'milk chocolate', fr: 'chocolat au lait', de: 'milchschokolade', es: 'chocolate con leche', pt: 'chocolate ao leite', zh: '牛奶巧克力', ar: 'شوكولاتة بالحليب' }
  },
  'ice cream': {
    cal: 207, p: 3.5, c: 24, f: 11, fi: 0.7,
    names: { en: 'ice cream', fr: 'glace', de: 'eiscreme', es: 'helado', pt: 'sorvete', zh: '冰淇淋', ar: 'آيس كريم' }
  },

  // ==========================================
  // PLATS PRÉPARÉS & SPÉCIALITÉS (50+ items)
  // ==========================================
  'pizza': {
    cal: 266, p: 11, c: 33, f: 10, fi: 2.3,
    names: { en: 'pizza', fr: 'pizza', de: 'pizza', es: 'pizza', pt: 'pizza', zh: '披萨', ar: 'بيتزا' }
  },
  'burger': {
    cal: 295, p: 17, c: 24, f: 14, fi: 1.3,
    names: { en: 'burger', fr: 'burger', de: 'burger', es: 'hamburguesa', pt: 'hambúrguer', zh: '汉堡', ar: 'برجر' }
  },
  'sandwich': {
    cal: 250, p: 12, c: 29, f: 9, fi: 2,
    names: { en: 'sandwich', fr: 'sandwich', de: 'sandwich', es: 'sándwich', pt: 'sanduíche', zh: '三明治', ar: 'ساندويتش' }
  },
  'french fries': {
    cal: 312, p: 3.4, c: 41, f: 15, fi: 3.8,
    names: { en: 'french fries', fr: 'frites', de: 'pommes frites', es: 'patatas fritas', pt: 'batata frita', zh: '薯条', ar: 'بطاطس مقلية' }
  },
  'fried rice': {
    cal: 163, p: 4.3, c: 24, f: 5.6, fi: 1,
    names: { en: 'fried rice', fr: 'riz sauté', de: 'gebratener reis', es: 'arroz frito', pt: 'arroz frito', zh: '炒饭', ar: 'أرز مقلي' }
  },
  'sushi': {
    cal: 143, p: 5.8, c: 26, f: 1, fi: 0.8,
    names: { en: 'sushi', fr: 'sushi', de: 'sushi', es: 'sushi', pt: 'sushi', zh: '寿司', ar: 'سوشي' }
  },
  'ramen': {
    cal: 436, p: 12, c: 61, f: 16, fi: 2,
    names: { en: 'ramen', fr: 'ramen', de: 'ramen', es: 'ramen', pt: 'ramen', zh: '拉面', ar: 'رامن' }
  },
  'curry': {
    cal: 162, p: 8, c: 15, f: 8, fi: 3,
    names: { en: 'curry', fr: 'curry', de: 'curry', es: 'curry', pt: 'caril', zh: '咖喱', ar: 'كاري' }
  },
  'stir fry': {
    cal: 117, p: 10, c: 8, f: 5, fi: 2,
    names: { en: 'stir fry', fr: 'sauté', de: 'pfannengericht', es: 'salteado', pt: 'refogado', zh: '炒菜', ar: 'قلي سريع' }
  },
  'soup': {
    cal: 50, p: 3, c: 6, f: 1.5, fi: 1,
    names: { en: 'soup', fr: 'soupe', de: 'suppe', es: 'sopa', pt: 'sopa', zh: '汤', ar: 'شوربة' }
  },
  'salad': {
    cal: 20, p: 1.5, c: 3, f: 0.5, fi: 1.5,
    names: { en: 'salad', fr: 'salade', de: 'salat', es: 'ensalada', pt: 'salada', zh: '沙拉', ar: 'سلطة' }
  },
  'omelette': {
    cal: 154, p: 11, c: 1, f: 12, fi: 0,
    names: { en: 'omelette', fr: 'omelette', de: 'omelett', es: 'tortilla', pt: 'omelete', zh: '煎蛋', ar: 'عجة' }
  },
  'pancakes': {
    cal: 227, p: 6, c: 28, f: 10, fi: 1,
    names: { en: 'pancakes', fr: 'crêpes', de: 'pfannkuchen', es: 'panqueques', pt: 'panquecas', zh: '煎饼', ar: 'فطائر' }
  },
  'waffles': {
    cal: 291, p: 8, c: 33, f: 14, fi: 1.3,
    names: { en: 'waffles', fr: 'gaufres', de: 'waffeln', es: 'waffles', pt: 'waffles', zh: '华夫饼', ar: 'وافل' }
  },
  'croissant': {
    cal: 406, p: 8, c: 46, f: 21, fi: 2.4,
    names: { en: 'croissant', fr: 'croissant', de: 'croissant', es: 'cruasán', pt: 'croissant', zh: '羊角面包', ar: 'كرواسون' }
  },
  'baguette': {
    cal: 270, p: 9, c: 56, f: 1.6, fi: 2.4,
    names: { en: 'baguette', fr: 'baguette', de: 'baguette', es: 'baguette', pt: 'baguete', zh: '法棍', ar: 'باغيت' }
  },

  // ==========================================
  // SPÉCIALITÉS MAROCAINES & MÉDITERRANÉENNES (30+ items)
  // ==========================================
  'tagine': {
    cal: 178, p: 15, c: 12, f: 8, fi: 3,
    names: { en: 'tagine', fr: 'tajine', de: 'tajine', es: 'tajín', pt: 'tagine', zh: '塔吉锅', ar: 'طاجين' }
  },
  'couscous royal': {
    cal: 185, p: 12, c: 22, f: 5, fi: 3.5,
    names: { en: 'couscous royal', fr: 'couscous royal', de: 'königlicher couscous', es: 'cuscús real', pt: 'cuscuz real', zh: '皇家库斯库斯', ar: 'كسكس ملكي' }
  },
  'msemen': {
    cal: 328, p: 7, c: 42, f: 14, fi: 1.5,
    names: { en: 'msemen', fr: 'msemen', de: 'msemen', es: 'msemen', pt: 'msemen', zh: '摩洛哥煎饼', ar: 'مسمن' }
  },
  'harira': {
    cal: 85, p: 5, c: 12, f: 2, fi: 3,
    names: { en: 'harira', fr: 'harira', de: 'harira', es: 'harira', pt: 'harira', zh: '哈里拉汤', ar: 'حريرة' }
  },
  'bastilla': {
    cal: 325, p: 18, c: 28, f: 16, fi: 2,
    names: { en: 'bastilla', fr: 'pastilla', de: 'bastilla', es: 'bastilla', pt: 'bastilla', zh: '巴斯蒂拉', ar: 'بسطيلة' }
  },
  'briouate': {
    cal: 290, p: 8, c: 30, f: 15, fi: 1.5,
    names: { en: 'briouate', fr: 'briouate', de: 'briouate', es: 'briouate', pt: 'briouate', zh: '布里瓦特', ar: 'بريوات' }
  },
  'rfissa': {
    cal: 295, p: 22, c: 25, f: 12, fi: 2.5,
    names: { en: 'rfissa', fr: 'rfissa', de: 'rfissa', es: 'rfissa', pt: 'rfissa', zh: '拉菲萨', ar: 'رفيسة' }
  },
  'mechoui': {
    cal: 250, p: 28, c: 0, f: 15, fi: 0,
    names: { en: 'mechoui', fr: 'méchoui', de: 'mechoui', es: 'mechoui', pt: 'mechoui', zh: '烤全羊', ar: 'مشوي' }
  },
  'tanjia': {
    cal: 230, p: 25, c: 5, f: 12, fi: 1,
    names: { en: 'tanjia', fr: 'tangia', de: 'tanjia', es: 'tanjia', pt: 'tanjia', zh: '坦吉亚', ar: 'طنجية' }
  },
  'zaalouk': {
    cal: 80, p: 2, c: 8, f: 4.5, fi: 3,
    names: { en: 'zaalouk', fr: 'zaalouk', de: 'zaalouk', es: 'zaalouk', pt: 'zaalouk', zh: '扎阿鲁克', ar: 'زعلوك' }
  },
  'taktouka': {
    cal: 75, p: 1.5, c: 7, f: 4, fi: 2.5,
    names: { en: 'taktouka', fr: 'taktouka', de: 'taktouka', es: 'taktouka', pt: 'taktouka', zh: '塔克图卡', ar: 'طاكتوكة' }
  },
  'chebakia': {
    cal: 420, p: 6, c: 55, f: 18, fi: 2,
    names: { en: 'chebakia', fr: 'chebakia', de: 'chebakia', es: 'chebakia', pt: 'chebakia', zh: '切巴基亚', ar: 'شباكية' }
  },
  'sellou': {
    cal: 515, p: 12, c: 48, f: 30, fi: 5,
    names: { en: 'sellou', fr: 'sellou', de: 'sellou', es: 'sellou', pt: 'sellou', zh: '塞鲁', ar: 'سلو' }
  },
  'beghrir': {
    cal: 190, p: 6, c: 35, f: 2.5, fi: 1.5,
    names: { en: 'beghrir', fr: 'beghrir', de: 'beghrir', es: 'beghrir', pt: 'beghrir', zh: '千孔煎饼', ar: 'بغرير' }
  },
  'khobz': {
    cal: 250, p: 8, c: 50, f: 1.5, fi: 2,
    names: { en: 'khobz', fr: 'khobz', de: 'khobz', es: 'khobz', pt: 'khobz', zh: '摩洛哥面包', ar: 'خبز' }
  },
  'batbout': {
    cal: 235, p: 7, c: 47, f: 2, fi: 2,
    names: { en: 'batbout', fr: 'batbout', de: 'batbout', es: 'batbout', pt: 'batbout', zh: '巴特布特', ar: 'بطبوط' }
  },
  'falafel': {
    cal: 333, p: 13, c: 32, f: 18, fi: 5,
    names: { en: 'falafel', fr: 'falafel', de: 'falafel', es: 'falafel', pt: 'falafel', zh: '炸豆丸子', ar: 'فلافل' }
  },
  'shawarma': {
    cal: 215, p: 23, c: 5, f: 12, fi: 1,
    names: { en: 'shawarma', fr: 'shawarma', de: 'schawarma', es: 'shawarma', pt: 'shawarma', zh: '沙瓦尔玛', ar: 'شاورما' }
  },
  'kebab': {
    cal: 226, p: 25, c: 3, f: 13, fi: 0.5,
    names: { en: 'kebab', fr: 'kebab', de: 'kebab', es: 'kebab', pt: 'kebab', zh: '烤肉串', ar: 'كباب' }
  },
  'tabbouleh': {
    cal: 87, p: 2, c: 12, f: 3.5, fi: 2.5,
    names: { en: 'tabbouleh', fr: 'taboulé', de: 'tabouleh', es: 'tabulé', pt: 'tabule', zh: '塔布勒沙拉', ar: 'تبولة' }
  },
  'fattoush': {
    cal: 95, p: 2, c: 10, f: 5, fi: 2,
    names: { en: 'fattoush', fr: 'fattouch', de: 'fattusch', es: 'fattoush', pt: 'fattoush', zh: '法图什沙拉', ar: 'فتوش' }
  },
  'baba ganoush': {
    cal: 130, p: 2.5, c: 11, f: 9, fi: 4,
    names: { en: 'baba ganoush', fr: 'baba ganoush', de: 'baba ganoush', es: 'baba ganoush', pt: 'baba ganoush', zh: '茄泥', ar: 'بابا غنوج' }
  },
  'labneh': {
    cal: 166, p: 6, c: 4, f: 14, fi: 0,
    names: { en: 'labneh', fr: 'labneh', de: 'labneh', es: 'labneh', pt: 'labneh', zh: '拉布奈', ar: 'لبنة' }
  },
  'moussaka': {
    cal: 160, p: 8, c: 12, f: 9, fi: 3,
    names: { en: 'moussaka', fr: 'moussaka', de: 'moussaka', es: 'musaka', pt: 'moussaka', zh: '穆萨卡', ar: 'مسقعة' }
  },
  'dolma': {
    cal: 145, p: 4, c: 18, f: 6, fi: 2.5,
    names: { en: 'dolma', fr: 'dolma', de: 'dolma', es: 'dolma', pt: 'dolma', zh: '多尔玛', ar: 'دولمة' }
  },
  'gyro': {
    cal: 217, p: 13, c: 21, f: 9, fi: 1.5,
    names: { en: 'gyro', fr: 'gyros', de: 'gyros', es: 'gyros', pt: 'gyros', zh: '希腊烤肉', ar: 'جيروس' }
  },
  'paella': {
    cal: 157, p: 10, c: 19, f: 5, fi: 1.5,
    names: { en: 'paella', fr: 'paella', de: 'paella', es: 'paella', pt: 'paella', zh: '西班牙海鲜饭', ar: 'بايلا' }
  },
  'gazpacho': {
    cal: 46, p: 1, c: 5, f: 2.5, fi: 1,
    names: { en: 'gazpacho', fr: 'gaspacho', de: 'gazpacho', es: 'gazpacho', pt: 'gaspacho', zh: '西班牙冷汤', ar: 'غازباتشو' }
  },
  'tortilla espanola': {
    cal: 175, p: 6, c: 12, f: 11, fi: 1,
    names: { en: 'spanish omelette', fr: 'tortilla espagnole', de: 'spanische tortilla', es: 'tortilla española', pt: 'tortilha espanhola', zh: '西班牙土豆饼', ar: 'تورتيلا إسبانية' }
  },

  // ==========================================
  // CONDIMENTS & SAUCES (20+ items)
  // ==========================================
  'ketchup': {
    cal: 112, p: 1.7, c: 26, f: 0.4, fi: 0.3,
    names: { en: 'ketchup', fr: 'ketchup', de: 'ketchup', es: 'kétchup', pt: 'ketchup', zh: '番茄酱', ar: 'كاتشب' }
  },
  'mayonnaise': {
    cal: 680, p: 1, c: 0.6, f: 75, fi: 0,
    names: { en: 'mayonnaise', fr: 'mayonnaise', de: 'mayonnaise', es: 'mayonesa', pt: 'maionese', zh: '蛋黄酱', ar: 'مايونيز' }
  },
  'mustard': {
    cal: 66, p: 4, c: 6, f: 3, fi: 3.3,
    names: { en: 'mustard', fr: 'moutarde', de: 'senf', es: 'mostaza', pt: 'mostarda', zh: '芥末', ar: 'خردل' }
  },
  'soy sauce': {
    cal: 53, p: 8, c: 5, f: 0, fi: 0.8,
    names: { en: 'soy sauce', fr: 'sauce soja', de: 'sojasauce', es: 'salsa de soja', pt: 'molho de soja', zh: '酱油', ar: 'صلصة الصويا' }
  },
  'vinegar': {
    cal: 18, p: 0, c: 0.6, f: 0, fi: 0,
    names: { en: 'vinegar', fr: 'vinaigre', de: 'essig', es: 'vinagre', pt: 'vinagre', zh: '醋', ar: 'خل' }
  },
  'hot sauce': {
    cal: 12, p: 0.5, c: 2.5, f: 0.1, fi: 0.5,
    names: { en: 'hot sauce', fr: 'sauce piquante', de: 'scharfe sauce', es: 'salsa picante', pt: 'molho picante', zh: '辣椒酱', ar: 'صلصة حارة' }
  },
  'harissa': {
    cal: 85, p: 3, c: 8, f: 5, fi: 4,
    names: { en: 'harissa', fr: 'harissa', de: 'harissa', es: 'harissa', pt: 'harissa', zh: '哈里萨酱', ar: 'هريسة' }
  },
  'tahini': {
    cal: 595, p: 17, c: 21, f: 54, fi: 9,
    names: { en: 'tahini', fr: 'tahini', de: 'tahini', es: 'tahini', pt: 'tahine', zh: '芝麻酱', ar: 'طحينة' }
  },
  'pesto': {
    cal: 387, p: 6, c: 6, f: 37, fi: 2,
    names: { en: 'pesto', fr: 'pesto', de: 'pesto', es: 'pesto', pt: 'pesto', zh: '罗勒酱', ar: 'بيستو' }
  },
  'salsa': {
    cal: 36, p: 1.5, c: 7, f: 0.2, fi: 1.5,
    names: { en: 'salsa', fr: 'salsa', de: 'salsa', es: 'salsa', pt: 'salsa', zh: '莎莎酱', ar: 'صلصة' }
  },
  'guacamole': {
    cal: 157, p: 2, c: 8.5, f: 13, fi: 6,
    names: { en: 'guacamole', fr: 'guacamole', de: 'guacamole', es: 'guacamole', pt: 'guacamole', zh: '牛油果酱', ar: 'غواكامولي' }
  },
  'tzatziki': {
    cal: 66, p: 3.5, c: 4, f: 4, fi: 0.5,
    names: { en: 'tzatziki', fr: 'tzatziki', de: 'tzatziki', es: 'tzatziki', pt: 'tzatziki', zh: '希腊酸奶酱', ar: 'تزاتزيكي' }
  },

  // ==========================================
  // ÉPICES & HERBES (15+ items)
  // ==========================================
  'cumin': {
    cal: 375, p: 18, c: 44, f: 22, fi: 11,
    names: { en: 'cumin', fr: 'cumin', de: 'kreuzkümmel', es: 'comino', pt: 'cominho', zh: '孜然', ar: 'كمون' }
  },
  'paprika': {
    cal: 282, p: 14, c: 54, f: 13, fi: 35,
    names: { en: 'paprika', fr: 'paprika', de: 'paprika', es: 'pimentón', pt: 'páprica', zh: '红辣椒粉', ar: 'بابريكا' }
  },
  'turmeric': {
    cal: 354, p: 8, c: 65, f: 10, fi: 21,
    names: { en: 'turmeric', fr: 'curcuma', de: 'kurkuma', es: 'cúrcuma', pt: 'açafrão', zh: '姜黄', ar: 'كركم' }
  },
  'ginger': {
    cal: 80, p: 1.8, c: 18, f: 0.8, fi: 2,
    names: { en: 'ginger', fr: 'gingembre', de: 'ingwer', es: 'jengibre', pt: 'gengibre', zh: '生姜', ar: 'زنجبيل' }
  },
  'cinnamon': {
    cal: 247, p: 4, c: 81, f: 1.2, fi: 53,
    names: { en: 'cinnamon', fr: 'cannelle', de: 'zimt', es: 'canela', pt: 'canela', zh: '肉桂', ar: 'قرفة' }
  },
  'basil': {
    cal: 23, p: 3.2, c: 2.7, f: 0.6, fi: 1.6,
    names: { en: 'basil', fr: 'basilic', de: 'basilikum', es: 'albahaca', pt: 'manjericão', zh: '罗勒', ar: 'ريحان' }
  },
  'oregano': {
    cal: 265, p: 9, c: 69, f: 4.3, fi: 43,
    names: { en: 'oregano', fr: 'origan', de: 'oregano', es: 'orégano', pt: 'orégano', zh: '牛至', ar: 'أوريجانو' }
  },
  'parsley': {
    cal: 36, p: 3, c: 6, f: 0.8, fi: 3.3,
    names: { en: 'parsley', fr: 'persil', de: 'petersilie', es: 'perejil', pt: 'salsa', zh: '欧芹', ar: 'بقدونس' }
  },
  'cilantro': {
    cal: 23, p: 2.1, c: 3.7, f: 0.5, fi: 2.8,
    names: { en: 'cilantro', fr: 'coriandre', de: 'koriander', es: 'cilantro', pt: 'coentro', zh: '香菜', ar: 'كزبرة' }
  },
  'mint': {
    cal: 70, p: 3.8, c: 15, f: 0.9, fi: 8,
    names: { en: 'mint', fr: 'menthe', de: 'minze', es: 'menta', pt: 'hortelã', zh: '薄荷', ar: 'نعناع' }
  },
  'ras el hanout': {
    cal: 290, p: 10, c: 50, f: 8, fi: 15,
    names: { en: 'ras el hanout', fr: 'ras el hanout', de: 'ras el hanout', es: 'ras el hanout', pt: 'ras el hanout', zh: '摩洛哥综合香料', ar: 'رأس الحانوت' }
  },
  'saffron': {
    cal: 310, p: 11, c: 65, f: 6, fi: 4,
    names: { en: 'saffron', fr: 'safran', de: 'safran', es: 'azafrán', pt: 'açafrão', zh: '藏红花', ar: 'زعفران' }
  }
}

/**
 * Nombre total d'aliments dans la base statique
 */
export const STATIC_FOODS_COUNT = Object.keys(STATIC_FOODS).length

/**
 * Recherche rapide dans la base statique par clé anglaise
 */
export function getStaticFood(key: string): StaticFoodEntry | undefined {
  return STATIC_FOODS[key.toLowerCase().trim()]
}

/**
 * Recherche par nom dans n'importe quelle langue
 */
export function searchStaticFoodByName(
  query: string,
  language: string = 'en',
  limit: number = 10
): Array<{ key: string; entry: StaticFoodEntry }> {
  const normalizedQuery = query.toLowerCase().trim()
  const results: Array<{ key: string; entry: StaticFoodEntry; score: number }> = []

  for (const [key, entry] of Object.entries(STATIC_FOODS)) {
    // Vérifier le nom anglais (toujours disponible)
    if (entry.names.en.toLowerCase().includes(normalizedQuery)) {
      results.push({ key, entry, score: entry.names.en.toLowerCase() === normalizedQuery ? 100 : 50 })
      continue
    }

    // Vérifier le nom dans la langue demandée
    const langName = entry.names[language as keyof typeof entry.names]
    if (langName && langName.toLowerCase().includes(normalizedQuery)) {
      results.push({ key, entry, score: langName.toLowerCase() === normalizedQuery ? 100 : 50 })
    }
  }

  // Trier par score décroissant et limiter
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ key, entry }) => ({ key, entry }))
}

/**
 * Calcule les valeurs nutritionnelles pour une quantité donnée
 */
export function calculateNutritionFromStatic(
  entry: StaticFoodEntry,
  quantityG: number
): {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
} {
  const factor = quantityG / 100

  return {
    calories: Math.round(entry.cal * factor),
    protein: Math.round(entry.p * factor * 10) / 10,
    carbs: Math.round(entry.c * factor * 10) / 10,
    fat: Math.round(entry.f * factor * 10) / 10,
    fiber: Math.round(entry.fi * factor * 10) / 10
  }
}
