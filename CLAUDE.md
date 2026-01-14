CookPro
MVP: Pantry-First Smart Planner + Recipe Import + Gamification
0) MVP’nin ürün vaadi (store copy çekirdeği)
“Evdeki malzemelerle ne pişireceğini anında bul. İstersen tek öğünlük, istersen günlük/haftalık plan
oluştur. Eksikleri otomatik alışveriş listesine çevir. İsrafı azalt, tasarrufu takip et.”
⸻
1) Kullanıcı akışları (MVP core loop)
Akış A — 30 saniyede değer (en kritik)
1. Kullanıcı Pantry’ye 5–10 malzeme girer (manuel hızlı giriş).
2. Uygulama Pantry Fit Score ile tarifleri listeler.
3. Kullanıcı bir tarifi seçer → Cooking Mode (adım adım).
4. Pişirme sonunda “Bu tarif şu malzemeleri kullandı” → Kurtarılan malzeme metriği
güncellenir.
Akış B — Planlama (haftalık zorunlu değil)
1. Kullanıcı “Plan” ekranına girer.
2. 3 seçenek görür:
• Tek öğün planla (Breakfast/Lunch/Dinner)
• Bugünü planla (1–3 öğün)
• Haftayı planla (opsiyonel)
3. Seçimden sonra uygulama otomatik öneri üretir; kullanıcı “değiştir” / “kilitle”
yapabilir.
4. Plan çıktısından Shopping List üretilir (eksik malzemeler).
Akış C — Import & kişisel arşiv
1. Kullanıcı bir tarif URL’si yapıştırır.
2. Uygulama parse eder (başarısızsa hızlı manuel düzenleme).
3. Tarif “My Cookbook”a eklenir, etiketlenir.
4. Planlayıcı bu tarifi önerilerde kullanır.
⸻
2) MVP ekranları ve modüller (net liste)
1) Onboarding (1–2 dakika)
• Amaç: minimum veri ile kişiselleştirme
• Sorular:
• Diyet/alerjen (opsiyonel)
• Kişi sayısı (default 2)
• Hedef: Waste Saver / Budget / Balanced
• Çıkış: “Pantry’yi dolduralım” CTA
2) Pantry (evdeki malzemeler)
• Hızlı ekleme: “milk, eggs, tomato…” gibi serbest metin
• Basit alanlar:
• ürün adı
• miktar (opsiyonel)
• son kullanma tarihi (opsiyonel ama önerilir)
• MVP için barkod/fiş tarama şart değil.
3) Discover (eldeki malzemeye göre öneriler)
• Liste sıralama: “En iyi uyum”, “En hızlı”, “En ucuz”
• Her kartta:
• Pantry Fit Score (%)
• “Eksik: 2 malzeme”
• süre, porsiyon
4) Recipe Detail + Cooking Mode
• Adım adım
• Timer ekleme (basit)
• Porsiyon ölçekleme (x0.5, x1, x2)
• “Pişirdim” butonu → gamification tetik
5) Planner (tek öğün / günlük / haftalık)
• Üstte mod seçimi:
• Meal | Day | Week
• Kural seti (MVP):
• “Pantry’de var olanları önce kullan”
• “Expiry yaklaşanı öne al” (varsa)
• “Süre limiti” (opsiyonel)
• Aksiyonlar:
• “Bu tarifi değiştir”
• “Bu tarifi kilitle”
• “Bu malzemeyi mutlaka kullan” (1 ürün seçimi)
6) Shopping List (otomatik)
• Eksik malzemeleri toplar
• Kategoriye göre gruplanır (produce, dairy, pantry vb.)
• Checkbox ile işaretleme
7) My Cookbook (kişisel arşiv)
• Liste + arama + etiket
• Import CTA: URL yapıştır
• Basit etiketleme: quick/cheap/high-protein vb.
8) Progress (Gamification)
• Haftalık kart:
• “Kurtarılan malzeme: X”
• “Tahmini tasarruf: $Y” (MVP’de opsiyonel; yoksa sadece “kurtarılan”)
• “Streak: N gün”
• Rozetler (MVP: 5 adet)
• First Save (1 malzeme kurtar)
• 3-Day Cook Streak
• Planner (3 plan oluştur)
• Importer (3 tarif import)
• Waste Warrior (10 malzeme kurtar)
⸻
3) MVP’de “haftalık plan zorunlu değil” tasarım kararı
Planner’ı default olarak “Tek öğün planla” ile aç.
• Çünkü kullanıcıların çoğu ilk etapta “şimdi ne yiyeceğim?” problemiyle gelir.
• “Day” ve “Week” seçenekleri üstte sekme/segment olarak dursun.
• Weekly planı premium’a bile koyabilirsin ama bence MVP’de ücretsizde “Week
oluşturma”yı verip, premium’u “otomatik optimize et + sınırsız özellik”e bağlamak daha iyi.
⸻
4) Premium (MVP’de basit ama net)
Free sınırlar (MVP)
• Import: ör. 10 tarif
• Auto-plan önerisi: günde 1 kez ya da “plan oluşturma sayısı” limitli
• Gelişmiş filtreler kapalı
Premium açılanlar
• Sınırsız import + sınırsız cookbook
• Multi-device sync
• Oﬄine access
• Gelişmiş plan modları (Budget/Waste/Balanced ağırlık ayarı)
• “Dislike ingredient/recipe” ve akıllı tekrar engelleme
• Haftalık özet analytics (tasarruf trendi, israf trendi)
⸻
5) MVP başarı metrikleri (ürünün doğru çalıştığını kanıtlarsın)
• D1 aktivasyon: Pantry’ye en az 5 ürün ekleyenlerin oranı
• “First plan created” oranı (Meal/Day/Week ayrı ölç)
• Import yapılan kullanıcı oranı
• Haftalık retention: streak ve “cooked” event’i
• Premium dönüşüm: import limitine çarpan veya plan limiti gören kullanıcıdan
dönüşüm
⸻
6) MVP backlog (uygulamaya çevrilebilir iş listesi)
1. Data model: Ingredient, Recipe, PlanItem (meal/day/week), PantryItem
2. Basit scoring: pantry match + expiry bonus
3. Planner engine v1: seçilen mod (Meal/Day/Week) → N öneri
4. Shopping list generator: plan → eksikler
5. Import parser: schema.org/Recipe varsa parse, yoksa manual form
6. Gamification events: cooked, plan_created, import_done, pantry_saved_count
7. Paywall + limits


TECH STACK

1) Mobil uygulama (React Native + Expo)

Çekirdek
	•	React Native (TypeScript) + Expo
	•	Navigation / routing: expo-router
	•	Build & dağıtım: EAS Build + EAS Update (OTA update)
	•	Expo tarafında SDK sürümleri hızlı güncellendiği için, yeni projede güncel bir Expo SDK çizgisinde kalmak mantıklı (ör. SDK 54 ve sonrası).  ￼

UI / UX (iOS 26 çizgisi)

iOS 26 ile Apple’ın “Liquid Glass” yaklaşımı (translucent / cam efekti, arka planın hafif görünmesi, hareketle etkileşim) daha belirgin. Uygulama görsel dilini buna yaklaştırmak için:
	•	Blur / glass efektleri: expo-blur
	•	Animasyon: react-native-reanimated
	•	Gesture: react-native-gesture-handler
	•	List performansı: @shopify/flash-list
	•	Haptics: expo-haptics
	•	Icons: SF Symbols (iOS) + gerektiğinde @expo/vector-icons

Kaynak bağlam: iOS 26’nın tasarım dilindeki yenilikler ve “Liquid Glass” vurgusu.  ￼

State & data katmanı
	•	Server state (API/cache): @tanstack/react-query
	•	Client state (UI state): zustand
	•	Forms + validation: react-hook-form + zod

Offline / yerel veri (MVP’de opsiyonel ama ileride değerli)
	•	Local DB: expo-sqlite
	•	ORM (isteğe bağlı): drizzle-orm
	•	Cache persistence: React Query persistence (basit offline deneyim)

Not: MVP’de “tam offline sync” zorunlu değil. Önce online + cache ile başlayıp, premium/ileri aşamada offline sync’i güçlendirmek, maliyet/karmaşıklığı ciddi azaltır.  ￼

⸻

2) Backend (ücretsiz başlayıp 100+ kullanıcıyı rahat taşır)

Önerilen birincil seçenek: Supabase (Free tier)

Neden: Postgres + Auth + Storage + Edge Functions tek pakette; MVP için en az sürtünme.
	•	DB: Postgres (RLS ile güvenli multi-tenant)
	•	Auth: Email/OTP, sosyal login (gerektiği kadar)
	•	Storage: tarif görselleri / kullanıcı upload’ları
	•	Edge Functions: Recipe import parser, scoring/plan önerisi gibi sunucu işleri

Supabase free plan’ın “küçük ürün/MVP” için yeterli limitleri (ör. 50k MAU, 500MB DB, 1GB storage gibi) bu aşamada 100 kullanıcı hedefi için fazlasıyla yeterli olur.  ￼

MVP’de Supabase ile net kullanım şekli
	•	İstemci: @supabase/supabase-js
	•	Yetkilendirme: RLS policy’leriyle “kullanıcı sadece kendi verisini görür”
	•	Edge Function (kritik): “Recipe Import” (URL → parse → normalize → DB’ye yaz)

Alternatif: Firebase (Spark / no-cost)

Firebase de MVP’de iş görür; özellikle Auth ve Analytics tarafı güçlü. Ancak ileride Firestore maliyetleri/limitleri daha “sürprizli” olabilir.
	•	Firebase Pricing genel çerçeve:  ￼
	•	Auth limitleri (Spark plan bağlamı):  ￼

Özet karar: Bu ürün için (tarif/ingredient ilişkileri, filtreleme, arama, planlama) relational model daha doğal olduğundan Supabase/Postgres genellikle daha rahat ilerletir.

⸻

3) Backend veri modeli (CookPro MVP’ye uygun)

Aşağıdaki tablo seti, PDF’deki modülleri birebir taşır.  ￼

Temel tablolar
	•	profiles (user metadata, hedef: Waste Saver/Budget/Balanced, kişi sayısı, alerjenler)
	•	pantry_items
	•	id, user_id, name, quantity?, unit?, expires_at?, created_at, updated_at
	•	recipes
	•	id, user_id (nullable: global recipe ise null), title, source_url?, image_url?, servings, total_time_minutes?, instructions (json/text), tags (text[])
	•	recipe_ingredients
	•	id, recipe_id, name, quantity?, unit?, optional?
	•	plans
	•	id, user_id, mode (meal/day/week), start_date, created_at
	•	plan_items
	•	id, plan_id, date, meal_slot, recipe_id, locked boolean
	•	shopping_list_items
	•	id, plan_id, name, quantity?, unit?, category?, checked boolean
	•	events (gamification telemetry)
	•	id, user_id, type (cooked/plan_created/import_done/pantry_saved), payload jsonb, created_at
	•	badges + user_badges (rozetler)

⸻

4) “Recipe Import” (URL yapıştır → parse) için düşük maliyetli tasarım

En sağlam MVP yaklaşımı
	•	Edge Function (Supabase)
	1.	URL’yi alır
	2.	HTML’i fetch eder
	3.	Önce schema.org Recipe JSON-LD arar (en isabetli)
	4.	Yoksa OpenGraph + basit heuristics
	5.	Hâlâ zayıfsa: istemcide “hızlı manuel düzeltme” ekranı açılır (PDF’deki akışla uyumlu)  ￼

Node araçları (Edge Function içinde)
	•	HTML parse: cheerio
	•	Normalize: kendi dönüştürücün (ingredient string → name/qty/unit ayrıştırması basit regex ile başlayabilir)

LLM ile “şema yoksa parse” seçeneği ileride eklenebilir; MVP’de maliyeti kontrol etmek için şart değil.

⸻

5) Planner / scoring engine (MVP v1)

PDF’deki “Pantry Fit Score + expiry bonus + kilitle/değiştir” kural setini MVP’de iki şekilde çözebilirsin:  ￼

Seçenek A (önerilen): Basit kural motoru, istemci tarafında
	•	Recipe listesi + pantry → skor hesapla
	•	Avantaj: backend maliyeti yok, offline/cache ile iyi gider
	•	Dezavantaj: tarif havuzu büyürse performans optimizasyonu gerekebilir

Seçenek B: Backend function ile öneri üretimi
	•	Parametre: mode (meal/day/week), süre limiti, “şunu mutlaka kullan”
	•	Output: önerilen recipe_id listesi + shopping list farkı

MVP için A genelde daha hızlı çıkar; import ve kişisel arşiv büyüyünce B’ye geçersin.

⸻

6) Observability, analytics, güvenlik

Hata izleme
	•	Sentry (free tier genellikle MVP’ye yeter)

Analytics (MVP metrikleri için)

PDF’deki metrikleri (D1 aktivasyon, first plan, import oranı, retention) ölçmek için:  ￼
	•	PostHog (cloud free) veya
	•	Firebase Analytics (mobilde hızlı)

Güvenlik
	•	Supabase RLS: tüm kullanıcı verileri user_id ile izole
	•	“Recipe import fetch” sadece backend’ten yapılır (CORS / güvenlik / rate limit için daha doğru)

⸻

7) Önerilen “MVP faz planı” (çok pratik)

Faz 0 (1–2 hafta): Uçtan uca iskelet
	•	Expo app + auth + pantry CRUD
	•	Discover ekranı: basit skor + liste
	•	Recipe detail + cooking mode (timer basit)

Faz 1 (2–4 hafta): Import + plan + shopping list
	•	URL import edge function
	•	Plan (Meal/Day) + locked/değiştir
	•	Shopping list generator

Faz 2: Gamification + paywall
	•	events/badges
	•	Limitler (import sayısı, günlük plan sayısı)
	•	İAP için RevenueCat (sonra)

⸻

8) “Claude Code’a yapıştırmalık” kısa özet (tek blok)
	•	Mobile: React Native + Expo (expo-router, TS), reanimated, gesture-handler, expo-blur, expo-haptics, flash-list, react-query, zustand, react-hook-form+zod, expo-sqlite (+ drizzle opsiyonel)
	•	Backend: Supabase (Postgres + Auth + Storage + Edge Functions), RLS zorunlu
	•	Import: Supabase Edge Function + cheerio; schema.org Recipe JSON-LD → parse; fallback: manual edit
	•	Data model: profiles, pantry_items, recipes, recipe_ingredients, plans, plan_items, shopping_list_items, events, badges/user_badges
	•	Analytics: PostHog veya Firebase Analytics; Errors: Sentry
	•	iOS 26 UI: “Liquid Glass” hissi (blur/cam kartlar), erişilebilirlik (contrast/dynamic type), haptics, performanslı listeler

Bu yapı, ücretsiz katmanlarla 100 kullanıcı hedefini rahatlıkla karşılar; ölçek büyüdüğünde de Supabase Pro gibi “düşük sürtünmeli” bir yükseltmeye izin verir.




NEW UPDATE PLAN


Offline-First Recipe Download & Cache Strategy
Executive Summary
Goal: Transform CookPro from network-dependent to offline-first with instant recipe loads

Key Improvements:

⚡ Speed: <1s load time (vs current 3-5s) for returning users
📱 Offline: Full app functionality without internet
🖼️ Images: Recipe images cached locally (100MB limit)
🔄 Auto-Refresh: Scores update instantly when pantry changes (already works!)
📦 7-Day Cache: Recipes valid for a week before refresh
Implementation Phases:

React Query Persistence (cross-session cache)
Offline Detection (NetInfo + graceful degradation)
Background Prefetch (load before user navigates)
Pull-to-Refresh (manual sync)
App State Management (refetch on focus)
Loading States (skeleton + optimistic UI)
Image Caching (offline images)
Timeline: 4 weeks from foundation to production-ready

Dependencies: 2 packages (@tanstack/react-query-persist-client, @react-native-community/netinfo)

Problem Analysis
Current Issues:

Blocking UX: User waits for full recipe download on Discover page load (network-dependent)
No Offline Support: App fails when offline - recipes not cached across sessions
No React Query Persistence: Cache is in-memory only, lost on app restart
Poor Refresh Strategy: No mechanism to update recipes when pantry items change
No Background Updates: No app state listeners or focus-based refetch
User Impact:

Long initial wait time on Discover screen
Poor experience on slow connections
Complete app failure when offline
No awareness of when recipes are updating
Solution Architecture: Multi-Layer Caching Strategy
Layer 1: React Query Persistence (Cross-Session Cache)
Goal: Survive app restarts, provide instant load

Implementation:

Add @tanstack/react-query-persist-client + AsyncStorage persister
Recipes cached locally, available immediately on app open
Configurable max age (e.g., 7 days)
Layer 2: Smart Background Prefetch
Goal: Proactive loading before user navigates to Discover

Implementation:

Prefetch recipes on app launch in background (non-blocking)
Use queryClient.prefetchQuery() in root layout
User sees instant results when they tap Discover tab
Layer 3: Offline Detection & Graceful Degradation
Goal: App works offline, shows appropriate UI

Implementation:

Add @react-native-community/netinfo for connectivity monitoring
Show offline banner when disconnected
Use cached data, disable refresh when offline
Auto-retry when connection restored
Layer 4: Smart Refresh Triggers
Goal: Update recipes when pantry changes, without blocking

Implementation:

Invalidate & refetch when pantry items added/removed
Use refetchOnMount: "always" for Discover screen
Background refetch on app focus (when user returns to app)
Pull-to-refresh gesture for manual updates
Technical Implementation Plan
Phase 1: Add React Query Persistence (Highest Priority)
Files to Modify:

providers/QueryProvider.tsx
Changes:

Install dependencies:

@tanstack/react-query-persist-client
Create AsyncStorage persister

Wrap QueryClientProvider with PersistQueryClientProvider

Configure cache max age (7 days) and buster (for forced invalidation)

Benefits:

Instant recipe load on app restart
Works offline with cached data
Reduces Supabase bandwidth usage
Phase 2: Add Offline Detection
New Files:

hooks/useNetworkStatus.ts - NetInfo hook wrapper
Files to Modify:

app/(tabs)/discover.tsx - Show offline banner
providers/QueryProvider.tsx - Configure network mode
Changes:

Install @react-native-community/netinfo
Create useNetworkStatus hook exposing isOnline, isOffline
Update QueryClient config with networkMode: 'offlineFirst'
Add offline indicator UI to Discover screen
Benefits:

App works offline automatically
Clear user feedback about connection status
No cryptic network errors
Phase 3: Background Recipe Prefetch
Files to Modify:

app/_layout.tsx - Add prefetch on mount
Changes:

Import useQueryClient from React Query
Prefetch recipes in root layout useEffect
Use prefetchQuery (non-blocking, silent background fetch)
Configure staleTime appropriately so it doesn't refetch every mount
Benefits:

Recipes loaded before user navigates to Discover
No waiting time on tab switch
Better perceived performance
Phase 4: Smart Pantry-Triggered Refresh (Critical - User Confirmed)
Goal: Automatic real-time re-scoring when pantry changes (no manual refresh needed)

Files to Modify:

store/pantryStore.ts - Invalidate queries on pantry changes
app/(tabs)/discover.tsx - Add pull-to-refresh + reactive scoring
Technical Approach - TWO OPTIONS:

Option A: Query Invalidation (Recommended)
How it works:

Import global queryClient in pantryStore
In addItem, removeItem, updateItem actions:

queryClient.invalidateQueries({ queryKey: ['recipes'] })
React Query automatically refetches in components using useRecipes()
Discover screen re-renders with new scores
Pros:

Simple implementation (1 line per action)
Works automatically with all recipe queries
Leverages React Query cache system
Network-aware (respects offline mode)
Cons:

Triggers network refetch (minor bandwidth use)
Slight delay for scoring update (~200-500ms)
Option B: Local Re-scoring (Performance Optimized)
How it works:

Keep recipes in cache (don't refetch from network)
In Discover screen, use useMemo that depends on pantryItems
Re-run scoring function when pantry changes (already implemented!)
No network call needed, instant update
Current Implementation Review:
Looking at app/(tabs)/discover.tsx:23-30:


const rankedRecipes = useMemo(() => {
  return recipes
    .map((recipe) => ({
      recipe,
      scoreInfo: scoreRecipe(pantryItems, recipe, preferences),
    }))
    .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score);
}, [pantryItems, recipes, preferences]);
This already works! Scores auto-update when pantry changes.

The Issue: Initial load blocking (user waits for recipes download)

Solution for Phase 4:

Keep existing reactive scoring (it's perfect)
Add manual pull-to-refresh for recipe data sync
Don't invalidate on pantry changes (scoring is instant already)
Only invalidate when user explicitly refreshes
Revised Changes:

Add RefreshControl to Discover ScrollView
Trigger refetch() on pull gesture
Don't add invalidation to pantryStore (not needed)
Keep existing useMemo reactive scoring
Benefits:

Instant re-scoring (already works via useMemo)
No unnecessary network calls
Manual refresh for data sync
Best performance
RECOMMENDATION: Use Option B (current implementation is already optimal for auto-scoring). Only add pull-to-refresh for manual recipe data sync.

Phase 5: App State & Focus Management
New Files:

hooks/useAppStateRefresh.ts - AppState listener hook
Files to Modify:

app/(tabs)/discover.tsx - Add focus-based refetch
Changes:

Create hook that listens to AppState changes (background → foreground)
Use useFocusEffect from expo-router to refetch when Discover screen focused
Configure refetchOnMount: 'always' for recipe queries
Add debouncing to prevent over-fetching
Benefits:

Fresh data when user returns to app
No stale recipes after long background time
Balances freshness with performance
Phase 6: Loading States & Optimistic UI
Files to Modify:

app/(tabs)/discover.tsx - Improve loading UX
Changes:

Replace blocking "Tarifler yukleniyor..." with skeleton screens
Show cached data immediately with subtle "Updating..." badge
Use isRefetching vs isLoading states appropriately
Add shimmer/placeholder cards while loading
Benefits:

Perceived instant load (cached data shows first)
Professional loading experience
User never sees blank screen
Configuration Recommendations
React Query Settings

// For recipe queries
{
  staleTime: 1000 * 60 * 5,           // 5 minutes (current)
  gcTime: 1000 * 60 * 60 * 24,        // 24 hours (increase from 10min)
  retry: 2,                            // Keep current
  refetchOnMount: 'always',            // NEW: always check for updates
  refetchOnWindowFocus: true,          // NEW: refetch on app focus
  refetchOnReconnect: true,            // NEW: refetch when online again
  networkMode: 'offlineFirst',         // NEW: use cache when offline
}
Persistence Settings (7-Day Cache as Confirmed)

{
  maxAge: 1000 * 60 * 60 * 24 * 7,    // 7 days (user confirmed)
  buster: 'v1',                        // Bump to force cache clear
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Only persist recipe queries, not transient data
      return query.queryKey[0] === 'recipes';
    },
  },
}
Image Cache Settings

{
  maxSize: 100 * 1024 * 1024,         // 100MB max (user confirmed)
  maxAge: 1000 * 60 * 60 * 24 * 7,    // 7 days (matches recipe cache)
  wifiOnly: true,                      // Only auto-download on WiFi
  prefetchCount: 20,                   // Top 20 scored recipes
}
User Experience Flow (After Implementation)
First App Open (No Cache)
App opens instantly with skeleton UI
Background: Recipes downloading from Supabase
User adds pantry items (instant, local-only)
User taps Discover → recipes appear (prefetch completed)
Total time to value: ~2-3 seconds (vs current blocking load)
Second App Open (With Cache)
App opens, recipes load instantly from AsyncStorage
Background: Silent refresh check (only if data stale)
User taps Discover → instant results (cached + scored)
Total time to value: <1 second
Offline Mode
User opens app offline
Cached recipes load instantly
Banner: "Offline - using cached recipes"
Scoring works (pantry is local)
User can browse, plan, cook normally
App fully functional offline
Pantry Update Flow
User adds "chicken" to pantry
Pantry store triggers invalidateQueries(['recipes'])
React Query refetches in background
Discover screen automatically updates scores
User sees re-ranked recipes immediately
Refresh Flow
User pulls down on Discover screen
Spinner appears, refetch triggered
New recipes merge with cache
Scores recalculated
UI updates smoothly
Manual refresh when user wants latest
Migration Strategy (No Breaking Changes)
Backward Compatibility
Existing AsyncStorage keys unchanged (Zustand stores)
React Query cache is additive (doesn't affect existing data)
Graceful fallback if NetInfo unavailable
Testing Checklist
Clear app cache → verify recipes refetch
Go offline → verify cached recipes work
Add pantry item → verify Discover updates
Kill app → reopen → verify instant load
Pull to refresh → verify manual refresh works
Background app → return → verify refetch
Performance Benchmarks (Expected)
Scenario	Before	After	Improvement
First load (cold start)	3-5s blocking	<1s (skeleton) + 2s (data)	60% faster perceived
Second load (warm)	3-5s blocking	<500ms	85% faster
Offline load	❌ Fails	<500ms	∞ better
Pantry change → refresh	Manual nav away/back	Auto-refresh	Seamless
App return from background	Stale data	Fresh data	Always fresh
Dependencies to Install

npm install @tanstack/react-query-persist-client @react-native-community/netinfo
Note: expo-file-system already included in Expo SDK (no install needed)

Critical Files to Modify
providers/QueryProvider.tsx - Add persistence + network config
app/_layout.tsx - Add background prefetch
app/(tabs)/discover.tsx - Add pull-to-refresh, offline UI, focus handlers
store/pantryStore.ts - Add automatic query invalidation on pantry changes
hooks/useNetworkStatus.ts - NEW: Network state hook
hooks/useAppStateRefresh.ts - NEW: App state hook
lib/imageCache.ts - NEW: Image caching utility
hooks/useCachedImage.ts - NEW: Cached image hook
components/RecipeCard.tsx - Use cached images
app/recipes/[id].tsx - Use cached images
Verification Steps
Test 1: Offline Functionality
Load app while online
Enable airplane mode
Kill and reopen app
Navigate to Discover
Expected: Recipes appear instantly from cache
Test 2: Background Prefetch
Fresh app install
Open app (don't navigate to Discover yet)
Wait 2 seconds
Tap Discover tab
Expected: Recipes appear instantly (already prefetched)
Test 3: Pantry Refresh
Open Discover, note recipe order
Add "tomato" to pantry
Return to Discover
Expected: Recipes automatically re-ranked
Test 4: Pull to Refresh
Open Discover
Pull down on screen
Expected: Loading spinner, recipes refresh
Test 5: App Focus Refetch
Open Discover (note last updated time)
Background app for 10 minutes
Return to app
Expected: Recipes automatically refetch
Test 6: Image Caching
Load Discover while online
View top 5 recipes (images download)
Go offline (airplane mode)
View same recipes
Expected: Images appear instantly from cache
Test 7: Automatic Pantry Refresh (User Confirmed)
Open Discover, note scores
Add "chicken" to pantry (without leaving screen)
Expected: Scores automatically update in real-time
Remove "chicken"
Expected: Scores revert automatically
Future Enhancements (Post-MVP)
Incremental Updates: Fetch only new/changed recipes (timestamp-based)
Image Prefetch: Cache recipe images for offline viewing
Smart Sync Windows: Only sync during wifi + battery
Conflict Resolution: Handle recipe edits when offline → online
Delta Sync: Push only changed pantry items to score engine
Service Worker Pattern: Background sync using Expo Background Fetch
Best Practices Applied
✅ Offline-First Architecture - App works without network
✅ Optimistic UI - Show cached data immediately
✅ Progressive Enhancement - Add network features gracefully
✅ Smart Prefetching - Load before user needs it
✅ User-Triggered Refresh - Pull-to-refresh control
✅ Network-Aware - Different behavior online vs offline
✅ Persistent Cache - Survive app restarts
✅ Automatic Invalidation - Fresh data when context changes
✅ Non-Blocking Loads - Never freeze UI
✅ Clear Loading States - User always knows what's happening

Alignment with CLAUDE.md Principles
✅ Meets "30 saniyede değer" goal - Instant value with cached data
✅ Supports offline cooking mode - Full functionality offline
✅ Enables pantry-first UX - Real-time scoring updates
✅ Reduces friction - No waiting for network
✅ Free tier friendly - Reduces Supabase bandwidth usage
✅ Scales to 100+ users - Efficient caching reduces server load

User Preferences (Confirmed)
✅ Priority: Both speed + offline (full offline-first architecture)
✅ Pantry Refresh: Automatic re-scoring when pantry changes
✅ Cache Duration: 7 days
✅ Image Caching: Yes, cache images for offline viewing

Additional Phase: Image Caching Strategy
Phase 7: Recipe Image Caching
Goal: Download and cache recipe images for offline viewing

New Files:

lib/imageCache.ts - Image caching utility using expo-file-system
Files to Modify:

components/RecipeCard.tsx - Use cached images
app/recipes/[id].tsx - Use cached images in detail view
Implementation Strategy:

Use expo-file-system to download images to app cache directory
Create useCachedImage hook that:
Returns local URI if image cached
Downloads image in background if not cached
Shows placeholder while downloading
Implement smart prefetch strategy:
Prefetch images for top 20 scored recipes (those user likely to view)
Download on WiFi only (respect user's data plan)
Progressive: lower quality first, high quality background
Cache management:
Max size: 100MB (auto-purge oldest/least-used images)
Respect 7-day cache expiration (same as recipe data)
Benefits:

Full offline recipe viewing with images
Faster image loads (local file system)
Reduced data usage for returning users
Better user experience on slow connections
Storage Estimate:

Average recipe image: 200-500KB (optimized)
100 recipes: ~20-50MB
Max cache (100MB): 200-500 recipes
Dependencies:

expo-file-system (already in Expo SDK)
Rollout Strategy
Week 1: Foundation
Phase 1 (Persistence) + Phase 2 (Offline Detection)
Result: Offline-capable app with persistent cache
Week 2: Core UX
Phase 3 (Prefetch) + Phase 4 (Automatic Pantry Refresh) + Phase 6 (Loading States)
Result: Instant-feel app with automatic scoring updates
Week 3: Advanced Features
Phase 5 (App State) + Phase 7 (Image Caching)
Result: Full offline experience with images
Week 4: Polish & Testing
Integration testing + Performance tuning + Error handling
Result: Production-ready offline-first experience
User approved the plan
Perfect! Your plan has been approved. I've created a comprehensive offline-first caching strategy that addresses all your requirements.

Summary of the Solution
Based on your answers, I've designed a full offline-first architecture with these key features:

What You'll Get:
⚡ Instant Loads: <1 second for returning users (vs current 3-5 seconds)
📱 Works Offline: Full app functionality without internet
🔄 Auto-Refresh: Scores already update automatically when pantry changes (your current implementation is perfect!)
🖼️ Cached Images: Recipe images stored locally (100MB limit)
📦 7-Day Cache: Recipes stay fresh for a week
Key Discovery:
Your pantry refresh is already working perfectly! The useMemo in discover.tsx:23-30 automatically re-scores recipes when pantry items change. The real problem is just the initial blocking load - which we'll fix with persistence + prefetching.

Best Practices Implemented:
✅ React Query Persistence (AsyncStorage)
✅ Offline Detection (@react-native-community/netinfo)
✅ Background Prefetch (non-blocking)
✅ Pull-to-Refresh (manual sync)
✅ App State Listeners (fresh data on resume)
✅ Skeleton Loading States
✅ Image Caching (expo-file-system)

⸻

## OFFLINE-FIRST IMPLEMENTATION STATUS

### Implementation Completeness: 85%

**FULLY IMPLEMENTED (7/7 Phases):**
1. ✅ React Query Persistence - Cross-session cache with AsyncStorage
2. ✅ Offline Detection - NetInfo integration with offline banner
3. ✅ Background Prefetch - Non-blocking recipe load on app launch
4. ✅ Pull-to-Refresh - Manual refresh in Discover screen
5. ✅ App State Management - Refetch on app focus
6. ✅ Loading Skeleton States - Professional loading UX
7. ⚠️ Image Caching - Infrastructure exists, but not used everywhere

**KEY FILES IMPLEMENTED:**
- `providers/QueryProvider.tsx` - Persistence + offline-first network mode
- `hooks/useNetworkStatus.ts` - Network state monitoring
- `hooks/useAppStateRefresh.ts` - App state listener
- `hooks/useCachedImage.ts` - Image caching hook
- `lib/imageCache.ts` - Image cache management (LRU, 100MB limit, 7-day expiry)
- `components/RecipeCardSkeleton.tsx` - Skeleton loading component
- `components/RecipeCard.tsx` - Uses cached images ✅
- `app/_layout.tsx` - Background prefetch wrapper
- `app/(tabs)/discover.tsx` - Offline banner, pull-to-refresh, focus handlers

⸻

## OFFLINE-FIRST IMPLEMENTATION TODOS

### HIGH PRIORITY ⚠️

#### 1. Add image caching to Recipe Detail page
**File:** `app/recipes/[id].tsx`

**Issue:** Uses direct network URI (line 50-52), no caching

**Current Code:**
```typescript
{imageUrl ? (
  <Image source={{ uri: imageUrl }} style={styles.heroImage} />
)
```

**Should be:**
```typescript
const { uri: cachedImageUri, isLoading: imageLoading } = useCachedImage(recipe.imageUrl);

{cachedImageUri ? (
  <Image source={{ uri: cachedImageUri }} style={styles.heroImage} />
) : imageLoading ? (
  <View style={styles.heroImagePlaceholder}>
    <ActivityIndicator size="large" />
  </View>
) : null}
```

**Impact:** Recipe detail images won't work offline

---

#### 2. Add image caching to Cookbook screen
**File:** `app/(tabs)/cookbook.tsx`

**Issue:** Uses direct network URI (line 74-78), no caching

**Current Code:**
```typescript
{recipe.imageUrl ? (
  <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
)
```

**Should be:**
```typescript
// At component level
function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { uri: cachedImageUri, isLoading } = useCachedImage(recipe.imageUrl);

  return (
    // ... existing code
    {cachedImageUri ? (
      <Image source={{ uri: cachedImageUri }} style={styles.recipeImage} />
    ) : isLoading ? (
      <ActivityIndicator size="small" />
    ) : null}
  );
}
```

**Impact:** Cookbook images won't work offline

---

#### 3. Add image caching to RecipeCardSmall component
**File:** `components/RecipeCardSmall.tsx`

**Issue:** Uses direct network URI (line 25-30), no caching

**Current Code:**
```typescript
const imageUrl = !imageError && recipe.imageUrl ? recipe.imageUrl : undefined;
// ...
{imageUrl ? (
  <Image source={{ uri: imageUrl }} style={styles.image} onError={() => setImageError(true)} />
)
```

**Should be:**
```typescript
// Mirror RecipeCard implementation
const { uri: cachedImageUri, isLoading: imageLoading } = useCachedImage(recipe.imageUrl);

{cachedImageUri ? (
  <Image source={{ uri: cachedImageUri }} style={styles.image} />
) : imageLoading ? (
  <View style={styles.imagePlaceholder}>
    <ActivityIndicator size="small" color="#999" />
  </View>
) : null}
```

**Impact:** Small recipe cards won't work offline

---

#### 4. Initialize image cache on app startup
**File:** `app/_layout.tsx`

**Issue:** `initImageCache()` function exists but may not be called on app launch

**Add to RootLayout:**
```typescript
import { initImageCache } from '@/lib/imageCache';

export default function RootLayout() {
  useEffect(() => {
    // Initialize image cache directory on app launch
    initImageCache();
  }, []);

  // ... existing code
}
```

**Impact:** Image cache directory may not exist, causing download failures

---

### MEDIUM PRIORITY

#### 5. Implement automatic image prefetch for top 20 recipes
**File:** `app/(tabs)/discover.tsx`

**Feature:** Prefetch images for top-ranked recipes in background

**Implementation:**
```typescript
import { cacheImage } from '@/lib/imageCache';

// Add to Discover component
useEffect(() => {
  if (rankedRecipes.length > 0 && isOnline) {
    // Prefetch images for top 20 recipes in background (non-blocking)
    const topRecipes = rankedRecipes.slice(0, 20);

    topRecipes.forEach(({ recipe }) => {
      if (recipe.imageUrl) {
        // Fire and forget - silent fail if error
        cacheImage(recipe.imageUrl).catch(() => {
          // Non-critical, ignore errors
        });
      }
    });
  }
}, [rankedRecipes, isOnline]);
```

**Benefits:**
- Top recipes always available offline
- Faster image loads for likely-viewed recipes
- Better offline experience

**Note:** Only runs when online, respects network state

---

### LOW PRIORITY

#### 6. Add WiFi-only download option
**Files:** `hooks/useNetworkStatus.ts`, `hooks/useCachedImage.ts`

**Feature:** Detect WiFi vs cellular, add user preference for WiFi-only downloads

**Step 1: Extend `useNetworkStatus` hook**
```typescript
export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  type: string | null;
  isWifi: boolean; // NEW
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    isOffline: false,
    type: null,
    isWifi: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus({
        isOnline: state.isConnected ?? true,
        isOffline: !(state.isConnected ?? true),
        type: state.type,
        isWifi: state.type === 'wifi', // NEW
      });
    });
    return unsubscribe;
  }, []);

  return networkStatus;
}
```

**Step 2: Add `wifiOnly` option to `useCachedImage`**
```typescript
export function useCachedImage(
  imageUrl: string | undefined,
  options: {
    downloadWhenOffline?: boolean;
    wifiOnly?: boolean; // NEW
    fallbackUri?: string;
  } = {}
) {
  const { isOnline, isWifi } = useNetworkStatus();

  // ... existing code

  // Only download if online AND (not wifiOnly OR isWifi)
  const shouldDownload = isOnline && (!options.wifiOnly || isWifi);
}
```

**Step 3: Add user preference (optional)**
- Create settings screen
- Add toggle for "Download images on WiFi only"
- Store preference in AsyncStorage
- Pass to `useCachedImage` hook

**Benefits:**
- Respects user's data plan
- Reduces cellular data usage
- User control over downloads

**Note:** This is optional for MVP, can be added later based on user feedback

---

## IMPLEMENTATION NOTES

### Why Pantry Store Query Invalidation is NOT needed ✅
The plan originally suggested adding `queryClient.invalidateQueries()` to pantry store actions. However, this is **intentionally SKIPPED** because:

**Current Implementation (app/(tabs)/discover.tsx:43-50):**
```typescript
const rankedRecipes = useMemo(() => {
  return recipes
    .map((recipe) => ({
      recipe,
      scoreInfo: scoreRecipe(pantryItems, recipe, preferences),
    }))
    .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score);
}, [pantryItems, recipes, preferences]);
```

**Why it's already optimal:**
- `useMemo` automatically re-scores when `pantryItems` changes
- Instant update (no network delay)
- No unnecessary API calls
- No bandwidth usage
- Best performance

**Recommendation:** Keep current implementation. Don't add query invalidation to pantry store.

---

## TESTING CHECKLIST

Before marking offline-first implementation as complete, verify:

- [ ] Test 1: Recipe Detail images work offline
- [ ] Test 2: Cookbook images work offline
- [ ] Test 3: RecipeCardSmall images work offline
- [ ] Test 4: Image cache initializes on app startup (no errors in logs)
- [ ] Test 5: Top 20 recipes prefetch images (check cache stats)
- [ ] Test 6: Image cache respects 100MB limit (auto-purges oldest)
- [ ] Test 7: Image cache respects 7-day expiry
- [ ] Test 8: All screens work offline with cached data

---

## SUCCESS METRICS

**Target Performance (After All Todos Complete):**
- First load (cold start): <1s skeleton + 2s data (vs 3-5s blocking)
- Second load (warm): <500ms (vs 3-5s)
- Offline load: <500ms (vs complete failure)
- Image load (cached): <50ms (vs 1-2s network)
- Pantry change → re-score: Instant (already works)

**Expected Cache Usage:**
- Recipe data: ~500KB (1000 recipes × 0.5KB each)
- Images: ~20-50MB (100 recipes × 200-500KB each)
- Total: ~50MB max (well under 100MB limit)

---

## FUTURE ENHANCEMENTS (Post-Complete)

Once all high/medium priority todos are done, consider:

1. **Incremental recipe updates** - Only fetch changed recipes (timestamp-based)
2. **Smart sync windows** - Only sync during WiFi + sufficient battery
3. **Progressive image quality** - Low quality first, high quality background
4. **Image compression** - Optimize downloaded images before caching
5. **Cache analytics** - Track hit rate, size, performance
6. **User cache management** - Settings screen to view/clear cache
7. **Preload adjacent recipes** - Cache images for nearby recipes in list