# CookPro MVP Enhancement Plan
*CLAUDE.md'ye göre eksiklikleri tamamlama*

---

## 1. GAMIFICATION: Sosyal + Streak Mekanikler

### Mevcut Durum
- `app/(tabs)/progress.tsx`: Boş skeleton, hardcoded "0" değerleri
- Gamification events sistemi yok
- Badge/rozet sistemi tanımlanmamış
- Streak mekanikler yok

### Plan

#### 1.1 Event Tracking System
**Dosya**: `lib/gamification/events.ts`
```typescript
type GameEvent =
  | { type: 'cooked', recipeId: string }
  | { type: 'plan_created', mode: PlanMode }
  | { type: 'import_done' }
  | { type: 'pantry_saved', count: number }
  | { type: 'recipe_liked' }
  | { type: 'social_share' };

// useGameificationStore (zustand)
- events: GameEvent[]
- logEvent(event): void
- getStreak(): number
- getSavedCount(): number
```

#### 1.2 Badge System
**Dosya**: `lib/gamification/badges.ts`
```typescript
type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (user: UserStats) => boolean;
};

// 5 Badge MVP'ye
1. First Save: 1 ingredient saved
2. 3-Day Cook Streak: Ard arda 3 gün pişirme
3. Planner Master: 5+ plan created
4. Importer: 3+ recipe import
5. Waste Warrior: 20+ saved ingredients
```

#### 1.3 Sosyal Mekanikler
**Dosya**: `store/socialStore.ts`
```typescript
type UserProfile = {
  id: string;
  username: string;
  avatar?: string;
  stats: { streak: number, saved: number, badges: Badge[] }
};

// İşlevler:
- shareAchievement(badge): Share to WhatsApp/Tweet
- viewFriendStats(userId): Friend's progress
- compareStats(userId1, userId2): Comparison screen
```

#### 1.4 Streak Logic
**Dosya**: `lib/gamification/streak.ts`
```typescript
getStreak(events: GameEvent[]): {
  current: number;
  longest: number;
  lastCookDate: Date;
}

// Günlük cooked event ölçülecek
// Date farkı >= 1 gün ise streak reset
```

#### 1.5 Progress Screen Implementation
**Güncelle**: `app/(tabs)/progress.tsx`
- UserStats'tan gerçek veri çek
- Weekly summary card (kurtarılan, savings estimate)
- Badge showcase (4-5 rozet grid)
- Streak visual indicator
- Weekly chart (kaç gün pişirdi)

---

## 2. PLANNER ENGINE: Detaylı Kurallar

### Mevcut Durum
- `lib/planner.ts`: Sadece score ranking + lock/swap
- `lib/scoring.ts`: Basic percentage match, expiry yok
- Variety constraint yok (aynı category tekrarlama)
- Allergen filtering yok

### Plan

#### 2.1 Expiry Bonus & Freshness Score
**Güncelleştirilecek**: `lib/scoring.ts`
```typescript
scoreRecipe(pantryItems, recipe, options?: { includeExpiry?, weights? }): {
  score: number;
  breakdown: { matchScore: 50, expiryBonus: 15, variety: 10, ... }
}

// Weights (Planner store'dan gelecek):
- matchScore (50-60): ingredient match
- expiryBonus (10-20): 3 gün içinde expire olacak malzeme bonus
- varietyBonus (0-15): benzer recipe'lere penalty
- allergenPenalty (-20 to 0): user allergens var mı
```

#### 2.2 Allergen & Preferences
**Güncelleştirilecek**: `lib/types.ts`
```typescript
type UserPreferences = {
  allergies: string[]; // 'peanut', 'dairy', 'gluten'
  diets: string[]; // 'vegetarian', 'vegan', 'keto'
  disliked: string[]; // 'cilantro', 'spicy'
  cuisines?: string[]; // 'italian', 'asian'
};

type Recipe += {
  allergens?: string[];
  diet?: string[];
  cuisine?: string;
};
```

#### 2.3 Variety Constraint
**Yeni dosya**: `lib/planner/variety.ts`
```typescript
// Aynı kategoriden (örn. "Pasta") 2 resepte penalty
// Aynı protein kaynağından (örn. "Chicken") 2 resepte penalty

getVarietyScore(recipes: Recipe[], previousPlans: Recipe[]): Map<recipeId, penalty>
```

#### 2.4 Meal Slot Logic (Day/Week Plans)
**Yeni dosya**: `lib/planner/mealSlots.ts`
```typescript
type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type PlanItem = {
  recipe: Recipe;
  date: Date;
  mealSlot: MealSlot;
  locked: boolean;
};

// Logic:
- Breakfast: 15-30 min, servings 1-4
- Lunch/Dinner: 20-60 min, servings 2-6
- Snack: < 10 min
```

#### 2.5 Planning Rules Engine
**Yeni dosya**: `lib/planner/engine.ts`
```typescript
generatePlan(config: {
  mode: 'meal' | 'day' | 'week';
  pantryItems: PantryItem[];
  recipes: Recipe[];
  preferences: UserPreferences;
  constraints?: { maxTime?: number, mustUse?: string[] };
}): PlanItem[]

// Kurallar (sıra önemli):
1. Allergen filtresi uygula
2. Expiry yaklaşan malzemeleri kullanmayı tercih et
3. Pantry match score'a göre rankla
4. Variety constraint'ini uygula
5. Meal slot uygunluğunu kontrol et
```

---

## 3. DATA MODEL: Standardizasyon & Dedup

### Mevcut Durum
- `ingredient-variants.json`: Kısmi, consistency yok
- Recipe-level dedup yok (aynı tarif 2 yerde)
- Unit standardizasyonu yok ("1 cup" vs "250ml")
- Instructions format inconsistent (string[] vs string)

### Plan

#### 3.1 Unit Normalization
**Yeni dosya**: `lib/cooking/units.ts`
```typescript
type Unit = 'g' | 'ml' | 'tsp' | 'tbsp' | 'cup' | 'pcs' | 'l';

// Conversion table
const conversions = {
  'tbsp': { 'ml': 15, 'tsp': 3 },
  'cup': { 'ml': 240, 'tsp': 48 },
  // ...
};

normalizeQuantity(qty: string, unit: string): { value: number, unit: Unit }
// "1 cup" → { value: 240, unit: 'ml' }
```

#### 3.2 Instruction Format Standardization
**Güncelleştirilecek**: `lib/types.ts`
```typescript
type Instruction = {
  step: number;
  text: string;
  time?: number; // dakika (optional)
  temperature?: number; // Celsius (optional)
};

type Recipe += {
  instructions: Instruction[];
  // Eski: instructions: string[];
};
```

#### 3.3 Recipe Deduplication & Merging
**Yeni dosya**: `lib/data/recipeDedup.ts`
```typescript
// Stratejisi:
// 1. Title + source_url similarity (Levenshtein distance)
// 2. Ingredient set similarity (Jaccard)
// 3. Identical ingredients → merge (keep higher quality source)

deduplicateRecipes(recipes: Recipe[]): Recipe[]
mergeRecipeVariants(recipe1: Recipe, recipe2: Recipe): Recipe
```

#### 3.4 Ingredient Master List
**Güncelleştirilecek**: `data/ingredients.json`
```json
{
  "eggs": {
    "canonical": "eggs",
    "aliases": ["egg", "large egg", "eggo"],
    "unit": "pcs",
    "category": "dairy",
    "defaultQuantity": 1
  },
  "olive_oil": {
    "canonical": "olive oil",
    "aliases": ["extra virgin olive oil", "EVOO"],
    "unit": "ml",
    "category": "oils"
  }
}
```

#### 3.5 Schema with Allergen Tags
**Güncelleştirilecek**: Recipe'ye allergen metadata
```typescript
type Recipe += {
  allergens: string[]; // ['dairy', 'gluten', 'nuts']
  nutrition?: { calories: number, protein: number }; // Optional MVP'de
};
```

---

## 4. FREE RECIPE SOURCES: Otomatik İthalatçı

### Mevcut Durum
- JSON'dan hardcoded tarif
- URL import parseri var ama manual
- Free API access yok

### Plan

#### 4.1 Multi-Source Adapter Pattern
**Yeni dosya**: `lib/recipe-sources/adapter.ts`
```typescript
type RecipeSource = {
  name: string;
  baseUrl: string;
  fetch(query: string): Promise<Recipe[]>;
  parse(html: string): Recipe;
  rateLimit?: { perMin: number };
};

// Sources:
1. Spoonacular Free Tier (365 req/day)
2. EdamamAPI (open, kısıtlı)
3. RecipeAPI.com
4. Local JSON + Open Recipe DB
```

#### 4.2 Recipe Sync Engine
**Yeni dosya**: `lib/recipe-sources/sync.ts`
```typescript
type SyncJob = {
  sourceId: string;
  query: string; // 'pasta', 'vegetarian', 'quick'
  lastSync?: Date;
};

// Fonksiyon:
syncRecipesFromSources(jobs: SyncJob[]): Promise<Recipe[]>

// MVP Strategy:
- Uygulama açılışında arka planda sync (1 gün 1 kez)
- Free API rate limits ile uyumlu
- Local cache ile offline support
```

#### 4.3 Deduplication During Sync
**Entegre**: `lib/data/recipeDedup.ts`
```typescript
// Sync ettiğin recipes'ler local DB'deki ile merge
// Duplicate flag set et, quality score bazında best version tut
```

#### 4.4 Recipe Import Modal Enhancement
**Güncelle**: `app/modal.tsx`
```
Mevcut: Manual URL paste
Yeni:
- "Search from sources" button
- Search input + source selector dropdown
- AsyncStorage'a son imported tarifiş cache et
- Background sync indicator
```

---

## 5. MONETIZASYON: AB Testing Plan

### Mevcut Durum
- Paywall logic yok
- Feature limits yok
- Premium tier tanımlanmamış

### Plan

#### 5.1 Freemium Model (PDF ile uyumlu)
**Yeni dosya**: `lib/paywall/limits.ts`
```typescript
type SubscriptionTier = 'free' | 'premium';

const limits = {
  free: {
    importedRecipesCount: 10,
    plansPerDay: 1,
    pantryItemsMax: 50,
    features: ['basic-planner', 'discover'],
  },
  premium: {
    importedRecipesCount: Infinity,
    plansPerDay: Infinity,
    pantryItemsMax: Infinity,
    features: ['*', 'advanced-filters', 'analytics', 'offline-sync'],
  },
};
```

#### 5.2 AB Test Variants
**Yeni dosya**: `lib/ab-testing/config.ts`

```typescript
// Variant A: "Paywall on 11th recipe"
// Variant B: "Paywall on 5th day of plan creation"
// Variant C: "Soft paywall: feature-limited free (no offline)"

type ABVariant = {
  id: string;
  name: string;
  paywall: { trigger: string, delay?: number };
  messaging: string;
};

const variants = {
  'paywall-recipe': { trigger: 'importCount >= 10' },
  'paywall-plans': { trigger: 'day >= 5' },
  'soft-paywall': { trigger: null, featuresLimited: true },
};
```

#### 5.3 Paywall UI
**Yeni dosya**: `components/Paywall.tsx`
```
- Header: "Unlock Premium"
- Benefit cards: "Unlimited recipes", "Offline sync", "Advanced filters"
- CTA: "Subscribe" + "Continue Free" (soft exit)
- Pricing: $4.99/mo veya $39.99/year
```

#### 5.4 Event Tracking for AB Tests
**Entegre**: `lib/gamification/events.ts`
```typescript
type GameEvent += {
  | { type: 'paywall_shown', variant: string }
  | { type: 'paywall_dismissed' }
  | { type: 'premium_converted', variant: string }
};
```

#### 5.5 Analytics Dashboard
**Metrikleri track et**:
- Variant'a göre conversion rate
- Paywall dismiss rate
- Feature adoption per tier
- Retention (D7, D30) variant bazında

---

## 6. İMPLEMENTASYON ÖNCELİĞİ

### Faz 1 (2-3 gün): Core Gamification + Planner Rules
1. ✅ Event tracking system (Zustand store)
2. ✅ Badge system + Progress screen
3. ✅ Allergen filtering + Variety constraint
4. ✅ Scoring algorithm v2

### Faz 2 (2-3 gün): Data Model Cleanup
5. Unit normalization
6. Instruction format standardization
7. Recipe deduplication
8. Ingredient master list update

### Faz 3 (2-3 gün): Recipe Sources
9. Adapter pattern + Spoonacular integration
10. Sync engine + dedup integration
11. Import modal enhancement

### Faz 4 (1-2 gün): Monetizasyon
12. Paywall system
13. AB testing scaffold
14. Analytics events

---

## 7. DOSYA YAPISI (Yeni/Güncellenecekler)

```
lib/
├── gamification/
│   ├── events.ts          [NEW]
│   ├── badges.ts          [NEW]
│   ├── streak.ts          [NEW]
│   └── stats.ts           [NEW]
├── planner/
│   ├── variety.ts         [NEW]
│   ├── mealSlots.ts       [NEW]
│   ├── engine.ts          [NEW]
│   └── allergens.ts       [NEW]
├── cooking/
│   ├── units.ts           [NEW]
│   └── conversions.ts     [NEW]
├── recipe-sources/
│   ├── adapter.ts         [NEW]
│   ├── spoonacular.ts     [NEW]
│   ├── edamam.ts          [NEW]
│   └── sync.ts            [NEW]
├── data/
│   └── recipeDedup.ts     [NEW]
├── paywall/
│   └── limits.ts          [NEW]
├── ab-testing/
│   └── config.ts          [NEW]
├── scoring.ts             [UPDATE]
├── types.ts               [UPDATE]
└── planner.ts             [UPDATE]

store/
├── gamificationStore.ts   [NEW]
├── socialStore.ts         [NEW]
├── preferencesStore.ts    [NEW]
├── userStore.ts           [NEW]
└── pantryStore.ts         [UPDATE]

app/(tabs)/
├── progress.tsx           [UPDATE]
└── discover.tsx           [UPDATE]

components/
├── Paywall.tsx            [NEW]
├── BadgeGrid.tsx          [NEW]
├── StreakIndicator.tsx    [NEW]
└── SocialShare.tsx        [NEW]

data/
├── ingredients.json       [UPDATE]
├── ingredient-variants.json [UPDATE]
└── allergens.json         [NEW]
```

---

## 8. BAŞLAMA ADIMI

1. **Gamification Store'u oluş** (Faz 1)
2. **Progress screen'i implement et** (gerçek data ile)
3. **Scoring algorithm'i v2'ye yükselt** (allergen + variety)
4. **Event logging'i wire up et** (cooked, plan_created vs)

Hazır mısın?
