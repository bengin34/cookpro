# Recipe Import & Cookbook Features

## 🎯 Overview

This document describes the enhanced recipe import system with favorites/cookbook management and multi-website support.

---

## ✨ New Features

### 1. **Cookbook Store** (`store/cookbookStore.ts`)

A persistent store for managing imported recipes with favorites, tags, and notes.

**Key Methods:**
- `addRecipe(recipe, tags, notes)` - Save imported recipe with metadata
- `toggleFavorite(recipeId)` - Mark/unmark as favorite
- `removeRecipe(recipeId)` - Delete saved recipe
- `updateRecipeTags(recipeId, tags)` - Update recipe tags
- `updateRecipeNotes(recipeId, notes)` - Add/edit notes
- `getRecipesByTag(tag)` - Filter recipes by tag
- `getAllTags()` - Get all unique tags in cookbook
- `searchRecipes(query)` - Full-text search across title, tags, notes

**Data Persistence:**
- Uses AsyncStorage for local persistence
- Automatically saves on every change
- Survives app restart

---

### 2. **Enhanced Recipe Import Modal** (`app/modal.tsx`)

The import screen now includes:

**Features:**
- **URL Input** - Paste any recipe URL
- **Auto-Parse** - Intelligently extracts recipe data
- **Preview** - See parsed title, ingredients, instructions before saving
- **Tags Input** - Comma-separated tags (e.g., "quick, vegetarian, dinner")
- **Notes Field** - Add personal notes (cooking tips, modifications)
- **Save Button** - Store recipe in personal cookbook
- **Success Message** - Visual feedback when saved

**User Flow:**
1. Paste recipe URL
2. System auto-parses and shows preview
3. Add tags and notes (optional)
4. Click "Kaydet & Ekle" (Save & Add)
5. Recipe saved to personal cookbook

---

### 3. **Multi-Website Support**

Added website-specific parsers for popular recipe sites:

#### **Supported Sites:**
- **yemek.com** - Turkish recipes (dedicated parser)
- **nefisyemekterifleri.com** - Turkish recipes (dedicated parser)
- **AllRecipes & Generic Sites** - schema.org/Recipe JSON-LD format
- **Any Website** - Fallback to generic schema.org parsing

#### **Parser Strategy** (in order):
1. Check for site-specific parser (yemek.com, nefisyemekterifleri.com)
2. Try generic schema.org Recipe JSON-LD extraction
3. Parse all available schema.org data in page
4. If all fail, show placeholder + manual edit option

#### **What Gets Extracted:**
- Recipe title
- Ingredients (name, quantity, unit)
- Instructions (step-by-step)
- Cooking time (ISO 8601 duration format)
- Servings/portions
- Source URL

---

### 4. **Cookbook Screen** (`app/(tabs)/cookbook.tsx`)

Personal recipe management interface:

**Features:**

#### **Import CTA**
- Direct link to recipe import modal
- Quick access from cookbook screen

#### **Tag Filtering**
- View all unique tags used in cookbook
- Click tag to filter recipes
- Click again to clear filter
- Shows tag count

#### **Recipe Display**
Each recipe card shows:
- Title with favorite indicator (♥ icon)
- Servings and cooking time
- First 3 ingredients + "more" indicator
- All assigned tags
- Personal notes (if added)

#### **Actions per Recipe**
- **Favorite/Unfavorite** - Toggle with ♡/♥ button
- Each favorite gets marked with red ♥ icon
- Favorites accessible via sorting/filtering

#### **Statistics**
- Shows total number of saved recipes
- Shows filtered count when tag selected
- Empty state message when no recipes

---

## 📱 Integration with User Store

The import system tracks metrics for monetization:

```typescript
// Automatically incremented on successful save
incrementImportedRecipes()

// Used to trigger paywall at import limits (free tier)
importedRecipesCount
```

This feeds into the paywall system to limit free users while enabling premium unlimited imports.

---

## 🔄 Data Model

### SavedRecipe Type
```typescript
type SavedRecipe = Recipe & {
  savedAt: string;        // ISO timestamp
  isFavorite: boolean;    // Favorite status
  tags: string[];         // User-defined tags
  notes?: string;         // Personal notes
  sourceUrl?: string;     // Original URL (from Recipe)
};
```

---

## 🚀 Usage Examples

### Save a Recipe from URL

```typescript
import { useCookbookStore } from '@/store/cookbookStore';

const { addRecipe } = useCookbookStore();

// After parsing recipe from URL:
addRecipe(parsedRecipe, ['quick', 'vegetarian'], 'Loved this! Added extra garlic');
```

### Filter by Tag

```typescript
const { getRecipesByTag } = useCookbookStore();

const quickRecipes = getRecipesByTag('quick');
```

### Search Recipes

```typescript
const { searchRecipes } = useCookbookStore();

const results = searchRecipes('tomato');
// Searches in title, tags, and notes
```

### Mark as Favorite

```typescript
const { toggleFavorite } = useCookbookStore();

toggleFavorite('recipe-id-123');
```

---

## 💾 Persistence & Storage

- **AsyncStorage** - Data persists across app sessions
- **Automatic Sync** - Changes immediately saved to device storage
- **No Server Required** - All data stays on user's device (MVP)

**Future Enhancement:**
- Backend sync for multi-device access (premium feature)
- Cloud backup

---

## 🎨 UI/UX Design

Uses the existing "Liquid Glass" design system:
- Glass cards with semi-transparent background
- Orange accent color (#c2410c) for interactive elements
- Tag pills with subtle background
- Heart icons for favorites
- Responsive tag filtering

---

## ⚠️ Edge Cases Handled

1. **Missing recipe data** - Shows "needs_manual" status, allows manual edit
2. **Failed parsing** - Falls back to generic schema.org format
3. **No ingredients/instructions** - Still saves recipe, marks as incomplete
4. **Duplicate tags** - Automatically deduplicated
5. **Empty cookbook** - Friendly empty state message
6. **Special characters in tags** - Properly trimmed and filtered

---

## 📊 Metrics Tracked

For analytics & paywall decisions:
- `importedRecipesCount` - Total recipes user imported
- `incrementImportedRecipes()` - Called on each successful save
- Used by AB testing paywall system

---

## 🔮 Future Enhancements

### Short Term
- [ ] Edit saved recipes inline
- [ ] Delete recipes with confirmation
- [ ] Bulk tag management
- [ ] Recipe difficulty/cuisine filtering
- [ ] Sort by date, name, time

### Medium Term
- [ ] Recipe sharing/export (PDF, image)
- [ ] Recipe rating/review system
- [ ] Similar recipe recommendations
- [ ] Multi-language ingredient parsing

### Long Term
- [ ] Supabase sync for multi-device
- [ ] Premium: Cloud backup
- [ ] Premium: Sync across devices
- [ ] Advanced search with filters
- [ ] Recipe collections/folders
- [ ] Meal plan integration

---

## 🐛 Testing Checklist

- [x] Import from yemek.com recipes
- [x] Import from nefisyemekterifleri.com recipes
- [x] Import from generic schema.org sites
- [x] Add tags during import
- [x] Add notes during import
- [x] View saved recipes in cookbook
- [x] Filter by tag
- [x] Toggle favorite
- [x] Persistent storage across restart
- [x] Handle missing recipe fields
- [x] Empty cookbook state

---

## 📞 Support

For issues with specific websites:
1. Check browser DevTools → Network → fetch response for the URL
2. Look for `<script type="application/ld+json">` in HTML
3. If schema exists, issue is in parsing logic
4. If schema missing, site needs custom parser

Add support for new sites by creating site-specific parsers in `recipeImport.ts`.
