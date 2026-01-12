# CookPro - Durum Ozeti

## Yapilanlar
- Expo Router tabs template ile iskelet uygulama kuruldu
- Onboarding, Pantry, Discover, Planner, Cookbook, Progress, Shopping List ekran iskeletleri eklendi
- Recipe detail + Cooking Mode ekranlari eklendi
- Tab yapisi ve stack route ayarlari yapildi
- Uygulama adi/slug "CookPro" olarak guncellendi
- Proje icerigi root'a tasindi, `_expo/` silindi
- Zustand store, mock data ve pantry fit scoring eklendi
- React Query provider kurulumu yapildi
- Arka plan sade beyaz, blur kartlar korunuyor
- Pantry CRUD (ekle/sil) ve expiry alanlari eklendi
- Planner v1 (Meal/Day/Week) + shopping list generator eklendi
- TR/EU malzeme ayrimi icin ingredient taksonomisi + variant/substitution listeleri eklendi
- 100 ve 1000 tariflik internal dataset uretildi + generator scripti eklendi
- React Query ile recipe list/detail akislari eklendi
- Recipe import flow (URL input + placeholder parser) eklendi
- Pantry icin local placeholder gorseller eklendi

## Siradaki Isler
- Gamification eventleri ve basic progress metrikleri
- Supabase entegrasyonu ve RLS kurallari

## Dataset ve Script
- Ingredient listesi: `data/ingredients.json`
- Region variantlari: `data/ingredient-variants.json`
- Substitution listesi: `data/ingredient-substitutions.json`
- 100 tarif: `data/recipes-100.json`
- 1000 tarif: `data/recipes-1000.json`
- Generator: `scripts/generate-recipes.js`

Ornek kullanim:
```\nnode scripts/generate-recipes.js --count 100 --output data/recipes-100.json\nnode scripts/generate-recipes.js --count 1000 --output data/recipes-1000.json\n```

## Notlar
- Kurulumda Node versiyon uyarisi var (RN 0.81.5, Node >=20.19.4 isteniyor).
