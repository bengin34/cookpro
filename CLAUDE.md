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