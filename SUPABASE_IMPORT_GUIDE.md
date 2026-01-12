# Supabase Recipe Import Guide

Bu doküman, JSON formatındaki tariflerinizi Supabase veritabanına aktarmak için gereken adımları detaylı olarak açıklar.

## İçindekiler
1. [Supabase Projesi Oluşturma (İlk Adımlar)](#supabase-projesi-oluşturma-ilk-adımlar)
2. [Ortam Değişkenleri Kurulumu](#ortam-değişkenleri-kurulumu)
3. [Veritabanı Şeması](#veritabanı-şeması)
4. [Tablolar ve İlişkiler](#tablolar-ve-ilişkiler)
5. [Database Schema Oluşturma](#database-schema-oluşturma)
6. [Import Script'i](#import-scripti)
7. [RLS Politikaları](#rls-politikaları)
8. [Veri Doğrulama](#veri-doğrulama)

---

## Supabase Projesi Oluşturma (İlk Adımlar)

### Adım 1: Supabase'e Üye Olun
1. [Supabase](https://supabase.com) adresine gidin
2. **Sign Up** butonuna tıklayın
3. Email veya GitHub hesabı ile kaydolun
4. Email doğrulmasını tamamlayın

### Adım 2: İlk Projenizi Oluşturun
1. Supabase Dashboard'a giriş yapın ([app.supabase.com](https://app.supabase.com))
2. Sol üstte **"New Project"** butonuna tıklayın (veya **"New"** → **"New project"**)
3. Aşağıdaki bilgileri girin:
   - **Name**: `cookpro` (veya tercih ettiğiniz isim)
   - **Database password**: Güçlü bir şifre seçin (ör: `SupabaseP@ssw0rd123!`)
     - ⚠️ Bu şifreyi not edin, sonra değiştiremezsiniz!
   - **Region**: En yakın coğrafi bölgeyi seçin (Türkiye için: Frankfurt veya Amsterdam)
   - **Organization**: Varsayılanı bırakabilirsiniz

4. **"Create new project"** butonuna tıklayın
5. Proje oluşturulana kadar bekleyin (~2-3 dakika)
   - Durum sayfasında `Building your database...` görebilirsiniz

### Adım 3: Proje Hazırlandığında
Proje hazır olunca, Dashboard göreceksiniz. Sol menüde şunları göreceksiniz:
- **SQL Editor** - SQL sorguları çalıştırmak için
- **Table Editor** - Tablolar ve verileri görüntülemek için
- **Authentication** - Kullanıcı yönetimi için
- **Storage** - Dosya depolama için

### Adım 4: API Keys'leri Kopyalayın
1. Sol menüden **Settings** → **API** bölümüne gidin
2. Aşağıdaki bilgileri bulun ve **kopyalayın**:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon/Public API Key**: `eyJhbGciOiJIUzI1NiIs...` (uzun bir kod)
   - **Service Role Key** (opsiyonel, şimdilik gerek yok)

3. Düzeltme: **Settings** → **General** seçeneğini kontrol edin ve **"Exposed schema"** bilgisini alın (genellikle `public`)

---

## Ortam Değişkenleri Kurulumu

### `.env.local` Dosyası Oluşturun
Proje kök dizininde (cookpro/) `.env.local` dosyası oluşturun ve aşağıdakini ekleyin:

```bash
# Supabase Credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Geliştirme ortamı için (Import script'ine yarar)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (admin işlemleri için, opsiyonel)
```

**Not:** `EXPO_PUBLIC_` prefix'i, değişkenleri React Native uygulamasında erişilebilir yapar.

### `.env` Dosyası Oluşturun (Node Script'leri İçin)
Proje kök dizininde `.env` dosyası oluşturun:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Node scripts için
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_DB_PASSWORD=your-db-password
```

### `.gitignore` Güncellemesi
Şirket sırlarını korumak için `.gitignore` dosyasına ekleyin:

```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production.local
```

---

---

## Veritabanı Şeması

### 1. Ana Tablolar

#### `recipes` (Base Table - English)
```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cuisine TEXT,
  region TEXT[], -- array of regions
  course TEXT[], -- array of courses (breakfast, lunch, dinner, etc.)
  servings INTEGER NOT NULL DEFAULT 2,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[], -- array of tags
  image_source TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null for global recipes
  is_global BOOLEAN DEFAULT false, -- true for system recipes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX idx_recipes_course ON recipes USING GIN(course);
```

#### `recipe_ingredients`
```sql
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- standardized ingredient name (e.g., "tomato", "egg")
  quantity DECIMAL(10,2),
  unit TEXT, -- tbsp, tsp, g, ml, whole, clove, bunch, etc.
  category TEXT, -- produce, protein, dairy, pantry
  optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_name ON recipe_ingredients(name);
```

#### `recipe_instructions`
```sql
CREATE TABLE recipe_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, step_number)
);

CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
```

#### `recipe_translations`
```sql
CREATE TABLE recipe_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('tr', 'en', 'de', 'fr', 'es')), -- expandable
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, locale)
);

CREATE INDEX idx_recipe_translations_recipe_id ON recipe_translations(recipe_id);
CREATE INDEX idx_recipe_translations_locale ON recipe_translations(locale);
```

#### `recipe_ingredient_translations`
```sql
CREATE TABLE recipe_ingredient_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL, -- matches recipe_ingredients.name
  locale TEXT NOT NULL CHECK (locale IN ('tr', 'en', 'de', 'fr', 'es')),
  translated_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, ingredient_name, locale)
);

CREATE INDEX idx_recipe_ingredient_translations_recipe_id ON recipe_ingredient_translations(recipe_id);
CREATE INDEX idx_recipe_ingredient_translations_locale ON recipe_ingredient_translations(locale);
```

#### `recipe_instruction_translations`
```sql
CREATE TABLE recipe_instruction_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('tr', 'en', 'de', 'fr', 'es')),
  instruction_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, step_number, locale)
);

CREATE INDEX idx_recipe_instruction_translations_recipe_id ON recipe_instruction_translations(recipe_id);
```

---

## Tablolar ve İlişkiler

```
recipes (1) ─────┬───── (N) recipe_ingredients
                 │
                 ├───── (N) recipe_instructions
                 │
                 ├───── (N) recipe_translations
                 │
                 ├───── (N) recipe_ingredient_translations
                 │
                 └───── (N) recipe_instruction_translations
```

### İlişki Özeti
- Her tarif (`recipes`) birden fazla malzemeye (`recipe_ingredients`) sahiptir
- Her tarif birden fazla adıma (`recipe_instructions`) sahiptir
- Her tarif birden fazla dilde çevrilere sahip olabilir
- Her malzeme ve adım da ayrıca çevrilebilir

---

## Database Schema Oluşturma

Supabase Dashboard'da SQL schemaları oluşturmak için:

1. Sol menüden **SQL Editor**'ü açın
2. Aşağıdaki SQL'leri **sırayla** çalıştırın:

### Tablolar Oluşturma Sırası

**1. Önce `recipes` tablosunu çalıştırın** (ana tablo)

**2. Ardından ilgili tablolar:**
   - `recipe_ingredients`
   - `recipe_instructions`
   - `recipe_translations`
   - `recipe_ingredient_translations`
   - `recipe_instruction_translations`

### SQL'leri Çalıştırma Adımları
1. SQL Editor'ün sağ üst kısmında **"+ New Query"** butonuna tıklayın
2. SQL kodunu yapıştırın
3. **"Run"** butonuna (▶) tıklayın veya `Ctrl+Enter` tuşuna basın
4. Başarı mesajı aldığınızda, bir sonraki SQL'i çalıştırın

---

## Import Script'i

### 1. Gerekli Paketleri Yükleme

Projenizin kök dizininde terminal açın ve şunu çalıştırın:

```bash
npm install @supabase/supabase-js dotenv ts-node typescript @types/node
```

**Paketlerin açıklaması:**
- `@supabase/supabase-js` - Supabase ile iletişim için
- `dotenv` - `.env` dosyasından ortam değişkenlerini okumak için
- `ts-node` - TypeScript dosyalarını Node.js'te çalıştırmak için
- `typescript` - TypeScript desteği
- `@types/node` - Node.js type tanımları

### 2. Import Script'i (`scripts/import-recipes.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  optional?: boolean;
}

interface Instruction {
  step: number;
  text: string;
}

interface Recipe {
  id: string;
  slug: string;
  title: string;
  description?: string;
  cuisine?: string;
  region?: string[];
  course?: string[];
  servings: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  difficulty?: string;
  tags?: string[];
  image_source?: string | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
}

interface IngredientTranslation {
  name: string;
  name_tr: string;
}

interface RecipeTranslation {
  recipe_id: string;
  locale: string;
  title: string;
  description?: string;
  ingredients_override?: IngredientTranslation[];
  instructions?: Instruction[];
}

async function importRecipes() {
  try {
    console.log('🚀 Starting recipe import...\n');

    // Read JSON files
    const recipesPath = path.join(__dirname, '../data/recipes.json');
    const translationsPath = path.join(__dirname, '../data/recipe_translations.json');

    const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf-8'));
    const translationsData = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));

    const recipes: Recipe[] = recipesData.recipes;
    const translations: RecipeTranslation[] = translationsData.recipe_translations;

    console.log(`📖 Found ${recipes.length} recipes`);
    console.log(`🌍 Found ${translations.length} translations\n`);

    // Import each recipe
    for (const recipe of recipes) {
      console.log(`\n📝 Importing: ${recipe.title} (${recipe.id})`);

      // 1. Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          id: recipe.id,
          slug: recipe.slug,
          title: recipe.title,
          description: recipe.description,
          cuisine: recipe.cuisine,
          region: recipe.region,
          course: recipe.course,
          servings: recipe.servings,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          total_time_minutes: recipe.total_time_minutes,
          difficulty: recipe.difficulty,
          tags: recipe.tags,
          image_source: recipe.image_source,
          user_id: null, // Global recipe
          is_global: true,
        })
        .select()
        .single();

      if (recipeError) {
        console.error(`   ❌ Recipe error:`, recipeError.message);
        continue;
      }
      console.log(`   ✅ Recipe inserted`);

      // 2. Insert ingredients
      const ingredientsToInsert = recipe.ingredients.map((ing) => ({
        recipe_id: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        optional: ing.optional || false,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        console.error(`   ❌ Ingredients error:`, ingredientsError.message);
      } else {
        console.log(`   ✅ ${ingredientsToInsert.length} ingredients inserted`);
      }

      // 3. Insert instructions
      const instructionsToInsert = recipe.instructions.map((inst) => ({
        recipe_id: recipe.id,
        step_number: inst.step,
        instruction_text: inst.text,
      }));

      const { error: instructionsError } = await supabase
        .from('recipe_instructions')
        .insert(instructionsToInsert);

      if (instructionsError) {
        console.error(`   ❌ Instructions error:`, instructionsError.message);
      } else {
        console.log(`   ✅ ${instructionsToInsert.length} instructions inserted`);
      }

      // 4. Insert translations
      const recipeTranslation = translations.find((t) => t.recipe_id === recipe.id);
      if (recipeTranslation) {
        // Insert recipe translation
        const { error: translationError } = await supabase
          .from('recipe_translations')
          .insert({
            recipe_id: recipe.id,
            locale: recipeTranslation.locale,
            title: recipeTranslation.title,
            description: recipeTranslation.description,
          });

        if (translationError) {
          console.error(`   ❌ Translation error:`, translationError.message);
        } else {
          console.log(`   ✅ Translation (${recipeTranslation.locale}) inserted`);
        }

        // Insert ingredient translations
        if (recipeTranslation.ingredients_override) {
          const ingredientTranslations = recipeTranslation.ingredients_override.map(
            (ing) => ({
              recipe_id: recipe.id,
              ingredient_name: ing.name,
              locale: recipeTranslation.locale,
              translated_name: ing.name_tr,
            })
          );

          const { error: ingTransError } = await supabase
            .from('recipe_ingredient_translations')
            .insert(ingredientTranslations);

          if (ingTransError) {
            console.error(`   ❌ Ingredient translations error:`, ingTransError.message);
          } else {
            console.log(`   ✅ ${ingredientTranslations.length} ingredient translations inserted`);
          }
        }

        // Insert instruction translations
        if (recipeTranslation.instructions) {
          const instructionTranslations = recipeTranslation.instructions.map(
            (inst) => ({
              recipe_id: recipe.id,
              step_number: inst.step,
              locale: recipeTranslation.locale,
              instruction_text: inst.text,
            })
          );

          const { error: instTransError } = await supabase
            .from('recipe_instruction_translations')
            .insert(instructionTranslations);

          if (instTransError) {
            console.error(`   ❌ Instruction translations error:`, instTransError.message);
          } else {
            console.log(`   ✅ ${instructionTranslations.length} instruction translations inserted`);
          }
        }
      }
    }

    console.log('\n\n✨ Import completed successfully!');
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run import
importRecipes();
```

### 3. Script'i Çalıştırma

#### Seçenek A: Doğrudan Çalıştırma
```bash
npx ts-node scripts/import-recipes.ts
```

#### Seçenek B: npm Script Olarak Eklemek (Önerilen)
`package.json` dosyasına şunu ekleyin:

```json
{
  "scripts": {
    "import:recipes": "ts-node scripts/import-recipes.ts"
  }
}
```

Ardından çalıştırın:
```bash
npm run import:recipes
```

### 4. Import Süreci
Script çalıştığında, aşağıdakine benzer bir çıktı göreceksiniz:

```
🚀 Starting recipe import...

📖 Found 45 recipes
🌍 Found 12 translations

📝 Importing: Pasta Carbonara (recipe_001)
   ✅ Recipe inserted
   ✅ 5 ingredients inserted
   ✅ 6 instructions inserted
   ✅ Translation (tr) inserted
   ✅ 5 ingredient translations inserted
   ✅ 6 instruction translations inserted

[...daha fazla tarif...]

✨ Import completed successfully!
```

**Hata varsa:**
- `.env` dosyasındaki API key'leri kontrol edin
- Supabase SQL Editor'ünde tablolar oluşturulduğundan emin olun
- Tablolara yönelik RLS politikaları etkinleştirilmiş mi diye kontrol edin

---

## RLS Politikaları

Row Level Security (RLS) ile verilerinizi koruyun. Bu, kullanıcıların sadece kendi verilerini görmesini sağlar.

### RLS Etkinleştirme ve Politika Ekleme

Supabase SQL Editor'de aşağıdaki SQL'i çalıştırın:

```sql
-- Step 1: RLS'yi Etkinleştir
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredient_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instruction_translations ENABLE ROW LEVEL SECURITY;

-- Recipes: Everyone can read global recipes, only owner can modify their own
CREATE POLICY "Global recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (is_global = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Recipe Ingredients: Follow recipe permissions
CREATE POLICY "Ingredients are viewable if recipe is viewable"
  ON recipe_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND (recipes.is_global = true OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert ingredients for their recipes"
  ON recipe_ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND recipes.user_id = auth.uid()
    )
  );

-- Similar policies for instructions and translations
CREATE POLICY "Instructions are viewable if recipe is viewable"
  ON recipe_instructions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_instructions.recipe_id
        AND (recipes.is_global = true OR recipes.user_id = auth.uid())
    )
  );

-- Translations: Everyone can read
CREATE POLICY "Translations are viewable by everyone"
  ON recipe_translations FOR SELECT
  USING (true);

CREATE POLICY "Ingredient translations are viewable by everyone"
  ON recipe_ingredient_translations FOR SELECT
  USING (true);

CREATE POLICY "Instruction translations are viewable by everyone"
  ON recipe_instruction_translations FOR SELECT
  USING (true);
```

---

## Veri Doğrulama

### İmport Öncesi Kontrol Listesi
Import script'ini çalıştırmadan önce şunları kontrol edin:

- [ ] Supabase projesi oluşturuldu
- [ ] API Keys `.env` dosyasına eklendi
- [ ] Tüm tablolar Supabase'de oluşturuldu (SQL Editor'de)
- [ ] `data/recipes.json` dosyası mevcut
- [ ] `data/recipe_translations.json` dosyası mevcut
- [ ] Gerekli paketler yüklendi (`npm install`)

### İmport Sonrası Kontrol

Import tamamlandıktan sonra verileri kontrol edin:

```sql
-- Total recipe count
SELECT COUNT(*) as total_recipes FROM recipes;

-- Recipes with ingredients count
SELECT
  r.id,
  r.title,
  COUNT(ri.id) as ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
GROUP BY r.id, r.title;

-- Recipes with translations
SELECT
  r.id,
  r.title,
  COUNT(rt.id) as translation_count,
  ARRAY_AGG(rt.locale) as available_locales
FROM recipes r
LEFT JOIN recipe_translations rt ON r.id = rt.recipe_id
GROUP BY r.id, r.title;

-- Check for missing data
SELECT
  r.id,
  r.title,
  CASE WHEN ri.id IS NULL THEN 'Missing ingredients' ELSE 'OK' END as ingredient_status,
  CASE WHEN inst.id IS NULL THEN 'Missing instructions' ELSE 'OK' END as instruction_status
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN recipe_instructions inst ON r.id = inst.recipe_id
GROUP BY r.id, r.title, ri.id, inst.id;
```

---

## Client-Side Kullanım (React Native)

React Native uygulamanızda Supabase'deki tarifleri nasıl kullanacağınızı gösterir.

### Adım 1: Supabase Client Oluşturun

`lib/supabase.ts` dosyası oluşturun:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Adım 2: Tarif Çekme (Çevirili)

```typescript
import { supabase } from '@/lib/supabase';

async function getRecipeWithTranslation(recipeId: string, locale: string = 'en') {
  // Fetch recipe with all related data
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (*),
      recipe_instructions (*)
    `)
    .eq('id', recipeId)
    .single();

  if (error || !recipe) {
    throw error;
  }

  // Fetch translation if not English
  if (locale !== 'en') {
    const { data: translation } = await supabase
      .from('recipe_translations')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('locale', locale)
      .single();

    if (translation) {
      recipe.title = translation.title || recipe.title;
      recipe.description = translation.description || recipe.description;
    }

    // Fetch ingredient translations
    const { data: ingredientTranslations } = await supabase
      .from('recipe_ingredient_translations')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('locale', locale);

    if (ingredientTranslations) {
      recipe.recipe_ingredients = recipe.recipe_ingredients.map((ing: any) => {
        const translation = ingredientTranslations.find(
          (t) => t.ingredient_name === ing.name
        );
        return {
          ...ing,
          display_name: translation?.translated_name || ing.name,
        };
      });
    }

    // Fetch instruction translations
    const { data: instructionTranslations } = await supabase
      .from('recipe_instruction_translations')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('locale', locale);

    if (instructionTranslations) {
      recipe.recipe_instructions = recipe.recipe_instructions.map((inst: any) => {
        const translation = instructionTranslations.find(
          (t) => t.step_number === inst.step_number
        );
        return {
          ...inst,
          instruction_text: translation?.instruction_text || inst.instruction_text,
        };
      });
    }
  }

  return recipe;
}
```

---

## Troubleshooting (Sorun Giderme)

### 🔴 Hata: "Cannot find module '@supabase/supabase-js'"
**Çözüm:**
```bash
npm install @supabase/supabase-js
```

### 🔴 Hata: "EXPO_PUBLIC_SUPABASE_URL is not defined"
**Çözüm:**
- `.env` dosyasının proje kök dizininde olduğundan emin olun
- Dosya adı kesinlikle `.env` olmalı (başında nokta)
- API URL ve key'lerin doğru olduğundan emin olun

### 🔴 Hata: "duplicate key value violates unique constraint"
**Nedeni:** Aynı ID'ye sahip bir tarif zaten veritabanında var
**Çözüm:**
```sql
-- Daha önce import edilmiş verileri silin
DELETE FROM recipes WHERE is_global = true;

-- Tüm tabloları temizle (opsiyonel)
DELETE FROM recipe_ingredient_translations;
DELETE FROM recipe_instruction_translations;
DELETE FROM recipe_translations;
DELETE FROM recipe_instructions;
DELETE FROM recipe_ingredients;
DELETE FROM recipes;
```

### 🔴 Hata: "permission denied for table recipes"
**Nedeni:** RLS politikaları etkin ama script anon key ile çalışıyor
**Çözüm:**
- `.env` dosyasında `SUPABASE_SERVICE_ROLE_KEY` kullanın (admin işlemler için)
- Veya RLS politikalarını Service Role için tanımlayın
- Veya authentication olmadan okuma izni verin:
  ```sql
  CREATE POLICY "Allow anonymous read" ON recipes FOR SELECT USING (true);
  ```

### 🔴 Hata: "foreign key constraint violation"
**Nedeni:** Child tablolara parent (recipes) eklemeden önce veri eklemeye çalıştı
**Çözüm:**
- Import script otomatik olarak sıra yönetiyor
- SQL'leri manuel çalıştırıyorsanız önce `recipes` tablosunu çalıştırın
- Sonra `recipe_ingredients`, `recipe_instructions` vb. çalıştırın

### 🔴 Hata: "relation 'recipes' does not exist"
**Nedeni:** Tablolar henüz oluşturulmadı
**Çözüm:**
- Supabase Dashboard'da SQL Editor'ü açın
- Tablolar bölümünde SQL'leri sırayla çalıştırın (recipes önce)
- Başarı mesajı alıncaya kadar bekleyin

### 🟡 Import Tamamlandı Ama Veri Görünmüyor
**Kontrol edin:**
1. Supabase Dashboard → Table Editor'de tablolara gidin
2. `recipes` tablosu kaç satır içeriyor? (✅ Satır var = başarılı)
3. RLS politikaları SELECT izni veriyor mu?

### 🟡 Script Çalışması Çok Uzun Sürüyor
**Normal davranış:** Büyük veri setleri (500+ tarif) 5-10 dakika alabilir
- Script'i kesin etmeyin (Ctrl+C)
- Konsolu açık bırakın
- İlerlemeyi görmek için `npm run import:recipes 2>&1 | tee import.log` kullanın

---

## Sonraki Adımlar

### Kurulum Kontrol Listesi

- [ ] **1. Supabase Projesi Oluştur**
  - Supabase'e kaydol
  - Yeni proje oluştur
  - API keys'leri not et

- [ ] **2. Ortam Değişkenlerini Kur**
  - `.env` dosyası oluştur
  - SUPABASE_URL ve ANON_KEY ekle
  - `.gitignore`'a ekle

- [ ] **3. Database Şemasını Oluştur**
  - SQL Editor'de tabloları oluştur (recipes, recipe_ingredients vb.)
  - Indexes'leri ekle
  - Başarısını kontrol et

- [ ] **4. Paketleri Kur**
  - `npm install @supabase/supabase-js dotenv ts-node`
  - `package.json`'a import script'i ekle

- [ ] **5. Import Script'ini Çalıştır**
  - `npm run import:recipes` komutunu çalıştır
  - Başarı mesajını bekle
  - Hata varsa Troubleshooting bölümüne bak

- [ ] **6. RLS Politikalarını Ekle**
  - SQL Editor'de RLS politikalarını çalıştır
  - Permissions kontrol et

- [ ] **7. Veri Doğrulama Yap**
  - SQL sorguları çalıştır
  - Veri sayısını kontrol et
  - Eksik veri varsa tekrar import et

- [ ] **8. React Native'de Kullan**
  - `lib/supabase.ts` dosyası oluştur
  - Client-Side Kullanım bölümündeki kodu ekle
  - Uygulamada test et

### Hızlı Başlangıç Komutları

```bash
# Tüm kurulumu bir çıkıyor:
npm install @supabase/supabase-js dotenv ts-node typescript @types/node

# .env dosyasını kopyala (kendi değerlerinle doldur)
echo "EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env

# Import scripti ekle ve çalıştır
npm run import:recipes

# Veri doğrulama
npm run validate:recipes  # (eğer script'i package.json'a eklediysen)
```

---

## Ek Kaynaklar

### Resmi Dokümentasyon
- [Supabase Belgeleri](https://supabase.com/docs) - Kapsamlı rehber
- [Supabase JS Client Kütüphanesi](https://supabase.com/docs/reference/javascript/overview) - API referansı
- [Supabase RLS Rehberi](https://supabase.com/docs/guides/auth/row-level-security) - Güvenlik
- [PostgreSQL Arrays](https://www.postgresql.org/docs/current/arrays.html) - Teknik detaylar

### Faydalı Linkler
- [Supabase Dashboard](https://app.supabase.com) - Projenizi yönetin
- [Supabase CLI](https://supabase.com/docs/guides/cli) - Komut satırı aracı
- [JSON-LD Recipe Schema](https://schema.org/Recipe) - Tarif formatı standardı

### Video Öğreticiler
- [Supabase Quickstart](https://www.youtube.com/results?search_query=supabase+quickstart)
- [PostgreSQL Basics](https://www.youtube.com/results?search_query=postgresql+basics)
- [React Native with Supabase](https://www.youtube.com/results?search_query=react+native+supabase)

### Topluluğa Katılın
- [Supabase Discord Community](https://discord.supabase.com) - Canlı destek
- [GitHub Discussions](https://github.com/supabase/supabase/discussions) - Sorular ve tartışmalar

