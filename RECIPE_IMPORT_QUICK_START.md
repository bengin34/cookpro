# Recipe Import Features - Quick Start Guide

## 🎬 Getting Started

### Installation & Setup
Nothing new to install! All features use existing dependencies:
- `zustand` - For state management ✓
- `@react-native-async-storage/async-storage` - For persistence ✓
- `react-query` - For data fetching ✓

Just start using the features immediately.

---

## 📖 Feature Overview

### Three Main Components

#### 1. **Recipe Import Modal**
- URL: `/modal`
- Imports recipes from websites
- Auto-detects Turkish sites (yemek.com, nefisyemekterifleri.com)
- Falls back to schema.org parsing
- Shows live preview
- Add tags and notes before saving

#### 2. **Cookbook Screen**
- URL: `/cookbook`
- Personal recipe library
- Browse, search, filter by tags
- Mark favorites with ♥
- View saved recipes with metadata

#### 3. **Cookbook Store**
- `store/cookbookStore.ts`
- Manages saved recipes
- Persistent across app restarts
- Full-text search capability

---

## 🚀 Quick Test

### Step 1: Import a Recipe
1. Open app → Cookbook tab
2. Click "URL ile import"
3. Paste a Turkish recipe URL:
   - `https://www.yemek.com/...`
   - `https://www.nefisyemekterifleri.com/...`
4. Wait for preview
5. Add tags like: `quick, vegetarian, dinner`
6. Add notes if desired
7. Click "Kaydet & Ekle"

### Step 2: View in Cookbook
1. You're back at Cookbook screen
2. See your imported recipe
3. Try adding more recipes

### Step 3: Filter & Search
1. Click tags at top to filter
2. View filtered recipes
3. Click ♡ button to favorite
4. Icon changes to ♥

---

## 💻 Usage in Code

### Import & Use Store

```typescript
import { useCookbookStore } from '@/store/cookbookStore';

export default function MyScreen() {
  const {
    savedRecipes,      // All saved recipes
    toggleFavorite,    // Mark as favorite
    getAllTags,        // Get all tags
    getRecipesByTag,   // Filter by tag
    searchRecipes,     // Full-text search
    addRecipe,         // Save new recipe
    removeRecipe,      // Delete recipe
    updateRecipeTags,  // Update tags
  } = useCookbookStore();

  // Use any of these functions
  return (
    <View>
      <Text>{savedRecipes.length} recipes saved</Text>
    </View>
  );
}
```

### Add Recipe to Cookbook

```typescript
const { addRecipe } = useCookbookStore();

// Save a recipe with metadata
addRecipe(
  parsedRecipe,                    // Recipe object from import
  ['quick', 'vegetarian'],         // Tags
  'Added extra garlic, loved it!'  // Notes (optional)
);
```

### Get Recipes by Tag

```typescript
const { getRecipesByTag } = useCookbookStore();

const quickRecipes = getRecipesByTag('quick');
// Returns all recipes with 'quick' tag
```

### Search Recipes

```typescript
const { searchRecipes } = useCookbookStore();

const results = searchRecipes('tomato');
// Searches in title, tags, and notes
```

### Toggle Favorite

```typescript
const { toggleFavorite } = useCookbookStore();

toggleFavorite('recipe-id-123');
// Marks as favorite or unfavorites if already favorite
```

---

## 🌐 Supported Websites

### Works Great With:
✅ **Turkish Sites:**
- yemek.com
- nefisyemekterifleri.com

✅ **International (schema.org):**
- allrecipes.com
- bbcgoodfood.com
- delish.com
- foodnetwork.com
- Any site with JSON-LD Recipe schema

✅ **Fallback:**
- Works with most recipe sites
- Manual edit option if auto-parse incomplete

### Won't Work:
❌ Instagram, TikTok, YouTube (media-only, needs manual entry)

---

## 🏷️ Tag System

### Default Tags (Auto-Added)
- `imported` - All imported recipes get this
- Site-specific: `nefisyemekleri`, `yemek` etc.

### Custom Tags
Add during import in comma-separated format:
```
quick, easy, vegetarian, low-carb, dinner, kids-friendly
```

### Using Tags
```typescript
const { getAllTags, getRecipesByTag } = useCookbookStore();

// Get all tags in cookbook
const allTags = getAllTags(); // ['quick', 'easy', 'vegetarian', ...]

// Filter recipes by tag
const quickRecipes = getRecipesByTag('quick');
```

---

## 📊 Data Persistence

### Automatic
- All changes automatically saved to AsyncStorage
- Survives app restart
- Works offline

### Check Storage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// View all saved data (debug)
const data = await AsyncStorage.getItem('cookbook-storage');
console.log(JSON.parse(data));
```

---

## 🎨 UI Components

### Recipe Import Modal
- Location: `app/modal.tsx`
- Features: URL input, preview, tags, notes
- Returns: Saves to cookbook automatically

### Cookbook Screen
- Location: `app/(tabs)/cookbook.tsx`
- Features: Tag filter, recipe list, favorites, metadata
- Shows: All saved recipes with search

---

## ⚙️ Configuration

### Customize Tags Styling
Edit `app/(tabs)/cookbook.tsx` → `styles.miniTag`:
```typescript
miniTag: {
  fontSize: 11,
  paddingVertical: 3,
  paddingHorizontal: 8,
  borderRadius: 8,
  backgroundColor: 'rgba(194, 65, 12, 0.2)',  // Tag color
  color: '#c2410c',                           // Text color
  fontWeight: '500',
},
```

### Customize Button Colors
Edit styles in modals:
- Import Modal: `app/modal.tsx`
- Cookbook: `app/(tabs)/cookbook.tsx`
- Change `#c2410c` (orange) to your brand color

---

## 🐛 Troubleshooting

### Recipe Not Saving
**Check:**
1. Confirm "Kaydet & Ekle" button was clicked
2. Look for green success message
3. Check AsyncStorage: `await AsyncStorage.getItem('cookbook-storage')`

### Import Preview Empty
**Try:**
1. Different website (some don't have schema.org)
2. Check browser console for JSON parse errors
3. Site might need custom parser

### Tags Not Showing
**Check:**
1. Tags must be comma-separated: `tag1, tag2, tag3`
2. Spaces are trimmed automatically
3. Empty tags are filtered out

### Favorites Not Persisting
**This is expected MVP behavior:**
- Favorites persist in storage
- But currently no UI to filter "favorites-only"
- Future: Add favorites filter in cookbook screen

---

## 📈 Analytics Integration

The system tracks:
```typescript
useUserStore().incrementImportedRecipes()
// Called automatically on successful save
// Used for paywall triggers
```

Monitor via:
```typescript
const { importedRecipesCount } = useUserStore();
console.log(`User imported ${importedRecipesCount} recipes`);
```

---

## 🎁 What's Next

### Short Term Enhancements
- [ ] Inline recipe editing
- [ ] Export to PDF
- [ ] Share recipes
- [ ] Recipe collections/folders

### Monetization
- Free: Limited imports (10-20)
- Premium: Unlimited imports
- Premium: Multi-device sync
- Premium: Cloud backup

---

## 📞 Need Help?

### Check These Files
- `store/cookbookStore.ts` - Store logic
- `app/modal.tsx` - Import UI
- `app/(tabs)/cookbook.tsx` - Cookbook UI
- `lib/recipeImport.ts` - Parsing logic
- `RECIPE_IMPORT_FEATURES.md` - Full documentation

### Common Questions

**Q: Can I import from Instagram?**
A: Not automatically (media-only site). But you can copy recipe to text and manually enter.

**Q: Does it work offline?**
A: Offline: Yes (view saved). Online: Yes (import from URLs).

**Q: How are recipes stored?**
A: AsyncStorage on device (local). No cloud sync in MVP.

**Q: Can I edit imported recipes?**
A: Currently view-only. Editing coming in next version.

**Q: How many recipes can I save?**
A: Unlimited (based on device storage, typically 50-100MB available).

---

## ✅ You're Ready!

The system is fully integrated and ready to use. Start importing recipes and enjoy! 🍳
