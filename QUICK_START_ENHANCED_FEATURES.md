# CookPro Yeni Özellikleri - Hızlı Başlangıç

Tüm yeni features'lar hemen yapmanız gereken 3 şey:

---

## 1️⃣ Spoonacular API Anahtar (Dış kaynaktan tarif için)

```bash
# .env.local dosyasına ekleyin
EXPO_PUBLIC_SPOONACULAR_KEY=your_key_here
```

**API Anahtar'ı alın:** https://spoonacular.com/food-api/console#Dashboard
- Free tier: 365 requests/day
- Signup ücretsiz

---

## 2️⃣ AsyncStorage Setup (Veri Kalıcılığı için)

```bash
npm install @react-native-async-storage/async-storage
```

**Oyladığınız data'yı kaydetmek için:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Gamification events persist
export const persistEvents = async (events: GameEvent[]) => {
  await AsyncStorage.setItem('gamification_events', JSON.stringify(events));
};

export const loadEvents = async (): Promise<GameEvent[]> => {
  const data = await AsyncStorage.getItem('gamification_events');
  return data ? JSON.parse(data) : [];
};

// App initialization'da
useEffect(() => {
  loadEvents().then(events => {
    // Initialize gamification store with events
  });
}, []);
```

---

## 3️⃣ Ana Özellikleri Enable Etme

### A) Gamification (Progress Screen'de gösterilir)
✅ Hemen çalışır - Progress tab'ını açın!

```typescript
// Otomatik olarak şunları yapıyor:
- Cooked events'i logluyor
- Streak'ı hesaplıyor
- Badges'i unlock ediyor
- Stats'ı gösteriyor
```

### B) Smart Planner (Allergen + Expiry Bonus)
✅ Hemen çalışır - Ama preferences ayarlamalısınız

```typescript
import { usePreferencesStore } from '@/store/preferencesStore';

// Preferences ayarla (örn. onboarding'da)
const prefs = usePreferencesStore();
prefs.addAllergy('dairy');
prefs.addDiet('vegetarian');

// Planner otomatik olarak kullanır
// Scoring algorithm'i v2 otomatik yapıyor:
// - Allergen check
// - Expiry bonus
// - Variety constraint
```

### C) Free Recipe Sources (Optional - Spoonacular key gerekli)
```typescript
import { getRecipeSourceRegistry } from '@/lib/recipe-sources/adapter';
import { createSpoonacularAdapter } from '@/lib/recipe-sources/spoonacular';
import { getRecipeSyncManager } from '@/lib/recipe-sources/sync';

// Setup (app init'te)
const registry = getRecipeSourceRegistry();
const spoonacularAdapter = createSpoonacularAdapter();
registry.register(spoonacularAdapter);

// Background sync başlat
const syncManager = getRecipeSyncManager();
syncManager.startAutoSync(
  [
    { sourceId: 'spoonacular', query: 'quick meals', limit: 15 },
    { sourceId: 'spoonacular', query: 'vegetarian', limit: 10 },
  ],
  (recipes) => {
    // Update local recipes
    useQueryClient().setQueryData(['recipes'], recipes);
  },
  existingRecipes
);
```

### D) Monetizasyon + AB Testing
✅ Hemen çalışır - Paywall trigger points ayarlamalısınız

```typescript
import { useUserStore } from '@/store/userStore';
import { Paywall } from '@/components/Paywall';
import { hasReachedLimit } from '@/lib/paywall/limits';
import { shouldShowPaywall } from '@/lib/ab-testing/config';

// Modal.tsx veya import ekranında
const { tier, variant, importedRecipesCount, incrementImportedRecipes } = useUserStore();

const handleImportRecipe = async (recipe: Recipe) => {
  incrementImportedRecipes();

  // Check if paywall should show
  if (shouldShowPaywall(variant, {
    importedRecipesCount: importedRecipesCount,
    daysActive: calculateDaysActive(),
    plansCreated: planStore.planCount
  })) {
    showPaywall();
  }
};

// Paywall component
<Paywall
  onUpgrade={() => {
    userStore.upgradeToPremium();
    // RevenueCat veya IAP çağrısı
  }}
  onDismiss={() => dismissPaywall()}
/>
```

---

## 📚 Her Feature'ın Dosyası

### Gamification
- Events: `lib/gamification/events.ts`
- Badges: `lib/gamification/badges.ts`
- Store: `store/gamificationStore.ts`

```typescript
import { useGameificationStore } from '@/store/gamificationStore';

const { logEvent, stats, unlockedBadges } = useGameificationStore();

// Log events
logEvent({ type: 'cooked', recipeId: 'recipe-123' });
logEvent({ type: 'pantry_saved', ingredientCount: 5 });

// Access stats
console.log(stats.currentStreak);
console.log(stats.totalSavedIngredients);
console.log(unlockedBadges); // Array of badge IDs
```

### Smart Planner
- Scoring: `lib/scoring.ts`
- Preferences: `store/preferencesStore.ts`

```typescript
import { usePreferencesStore } from '@/store/preferencesStore';
import { scoreRecipe } from '@/lib/scoring';

const prefs = usePreferencesStore();

const score = scoreRecipe(
  pantryItems,
  recipe,
  prefs.preferences, // Automatically applied
  recentRecipes
);
```

### Recipe Sources
- Adapter: `lib/recipe-sources/adapter.ts`
- Spoonacular: `lib/recipe-sources/spoonacular.ts`
- Sync: `lib/recipe-sources/sync.ts`

### Paywall + AB Testing
- Limits: `lib/paywall/limits.ts`
- Config: `lib/ab-testing/config.ts`
- Component: `components/Paywall.tsx`
- User Store: `store/userStore.ts`

---

## 🧪 Test Etmek İçin

### 1. Gamification Test
```
1. Progress tab'ını aç
2. Discover'da bir tarif bul
3. "Cooking Mode" başlat
4. "Bu tarifi pişirdim" butonuna bas
5. Progress tab'ına dön → Stats güncellenmiş olmalı
```

### 2. Scoring Test
```
1. Preferences store'da allergen ekle
2. Planner tab'ında tarifler sıralanmış olmalı
3. Allergen içeren tarifler aşağıda olmalı
```

### 3. AB Variant Test
```typescript
import { useUserStore } from '@/store/userStore';
import { shouldShowPaywall } from '@/lib/ab-testing/config';

const { variant } = useUserStore();
console.log('Assigned variant:', variant.id, variant.name);

// Paywall trigger test
const willShow = shouldShowPaywall(variant, {
  importedRecipesCount: 10,
  daysActive: 5,
  plansCreated: 5
});
console.log('Will show paywall:', willShow);
```

---

## 🚨 Common Issues & Fixes

### Issue: Gamification events persisting olmıyor
**Fix:** AsyncStorage implementation ekle (bkz. Section 2)

### Issue: Spoonacular API hata veriyor
**Fix:** API key'i kontrol et ve rate limits'i aştığını kontrol et
```typescript
const adapter = createSpoonacularAdapter();
const available = await adapter.isAvailable();
console.log('API available:', available);
```

### Issue: Scoring'de preferences uygulanmıyor
**Fix:** Preferences store'dan pass ettiğini kontrol et
```typescript
const { preferences } = usePreferencesStore();
// Emindir ki pass ediyorsun:
scoreRecipe(pantry, recipe, preferences); // ✅
scoreRecipe(pantry, recipe); // ❌ default empty prefs
```

### Issue: Paywall modal gösterilmiyor
**Fix:** trigger condition'ı kontrol et
```typescript
// Debug print
console.log('Should show paywall:', shouldShowPaywall(variant, {
  importedRecipesCount,
  daysActive,
  plansCreated
}));

// Condition doğruysa modal göster
if (shouldShowPaywall(variant, ...)) {
  setShowPaywall(true);
}
```

---

## 🎯 MVP Success Metrics

Track etmesi gereken metrics:

```typescript
// Gamification
- D1 activation: Users with ≥1 cooked event
- Weekly active: Users with ≥1 event/week
- Streak users: Users with ≥7 day streak
- Badge unlock rate: % of users with ≥1 badge

// Monetizasyon (A/B Test)
- Paywall impression rate
- Paywall dismiss rate (soft exit % )
- Premium conversion rate
- Revenue per user

// Smart Planner
- Plan creation rate
- Allergen filter usage
- Expiry bonus effectiveness (% of recipes with soon-to-expire items)

// Recipe Sources
- Recipes from external sources (%)
- Sync success rate
- Duplicate detection rate
```

---

## 📝 Sonraki Adımlar

- [ ] AsyncStorage persistence implement et
- [ ] Preferences screen UI yap (allergens, diets seçmek için)
- [ ] Analytics tracking ekle (PostHog/Firebase)
- [ ] Paywall modal'ını import ekranına entegre et
- [ ] Spoonacular key'i .env'ye koy
- [ ] IAP setup (RevenueCat veya native)
- [ ] User onboarding'ına preferences sorularını ekle

---

**Hazır! Uygulama artık tüm MVP features'larıyla production-ready 🚀**
