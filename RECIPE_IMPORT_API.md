# Recipe Import & Cookbook API Reference

## Quick Reference

### Import a Recipe from URL

```typescript
import { parseRecipeFromUrl } from '@/lib/recipeImport';

const result = await parseRecipeFromUrl('https://www.yemek.com/recipe/...');
// result: { status: 'success' | 'needs_manual' | 'error', message: string, recipe?: Recipe }
```

### Save to Cookbook

```typescript
import { useCookbookStore } from '@/store/cookbookStore';

const { addRecipe } = useCookbookStore();

addRecipe(
  parsedRecipe,
  ['quick', 'vegetarian'],
  'Optional note here'
);
```

---

## Cookbook Store API

### Initialize Store

```typescript
import { useCookbookStore } from '@/store/cookbookStore';

const {
  savedRecipes,
  toggleFavorite,
  removeRecipe,
  updateRecipeTags,
  updateRecipeNotes,
  getRecipeById,
  getRecipesByTag,
  getAllTags,
  searchRecipes,
  addRecipe,
} = useCookbookStore();
```

### Methods

#### `addRecipe(recipe, tags, notes?)`
Save a new recipe to cookbook.

```typescript
addRecipe(recipe, ['quick', 'dinner'], 'Added extra spices');
```

#### `toggleFavorite(recipeId)`
Mark recipe as favorite or remove from favorites.

```typescript
toggleFavorite('recipe-123');
```

#### `removeRecipe(recipeId)`
Delete recipe from cookbook.

```typescript
removeRecipe('recipe-123');
```

#### `updateRecipeTags(recipeId, tags)`
Change recipe tags.

```typescript
updateRecipeTags('recipe-123', ['easy', 'breakfast', 'vegetarian']);
```

#### `updateRecipeNotes(recipeId, notes)`
Update personal notes for recipe.

```typescript
updateRecipeNotes('recipe-123', 'Kids loved this!');
```

#### `getRecipeById(recipeId)`
Get single recipe by ID.

```typescript
const recipe = getRecipeById('recipe-123');
```

#### `getRecipesByTag(tag)`
Get all recipes with specific tag.

```typescript
const quickRecipes = getRecipesByTag('quick');
```

#### `getAllTags()`
Get list of all unique tags in cookbook.

```typescript
const tags = getAllTags(); // ['quick', 'easy', 'vegetarian', ...]
```

#### `searchRecipes(query)`
Full-text search across title, tags, notes.

```typescript
const results = searchRecipes('tomato');
// Searches:
// - Recipe title
// - Tags
// - Notes
```

### State

#### `savedRecipes`
Array of all saved recipes.

```typescript
const allRecipes = useCookbookStore().savedRecipes;
console.log(allRecipes.length); // Number of saved recipes
```

#### `favorites`
Array of recipe IDs marked as favorite. (Internal, use toggleFavorite instead)

---

## Recipe Import API

### parseRecipeFromUrl(url)

```typescript
import { parseRecipeFromUrl } from '@/lib/recipeImport';

const result = await parseRecipeFromUrl(url);
```

**Parameters:**
- `url: string` - Recipe URL

**Returns:**
```typescript
{
  status: 'success' | 'needs_manual' | 'error',
  message: string,
  recipe?: Recipe
}
```

**Status Values:**
- `success` - Recipe fully parsed, ready to use
- `needs_manual` - Partial parse, may need manual editing
- `error` - Failed to fetch or parse

**Example:**
```typescript
const result = await parseRecipeFromUrl('https://www.yemek.com/recipe/kizarmis-tavuk');

if (result.status === 'success' || result.status === 'needs_manual') {
  const { recipe } = result;
  console.log(`Recipe: ${recipe.title}`);
  console.log(`Ingredients: ${recipe.ingredients.length}`);
  console.log(`Steps: ${recipe.instructions.length}`);
}
```

---

## Types

### Recipe
```typescript
type Recipe = {
  id: string;
  title: string;
  totalTimeMinutes?: number;
  servings?: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags?: string[];
  allergens?: string[];
  cuisine?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  sourceUrl?: string;
}
```

### SavedRecipe
```typescript
type SavedRecipe = Recipe & {
  savedAt: string;        // ISO timestamp
  isFavorite: boolean;    // Favorite status
  tags: string[];         // Always an array
  notes?: string;         // Personal notes
  sourceUrl?: string;     // Original URL
}
```

### RecipeIngredient
```typescript
type RecipeIngredient = {
  name: string;
  quantity?: string;
  unit?: string;          // 'g', 'ml', 'cup', 'tbsp', etc.
  optional?: boolean;
}
```

### RecipeImportResult
```typescript
type RecipeImportResult = {
  status: RecipeImportStatus;
  message?: string;
  recipe?: Recipe;
}
```

---

## Integration Examples

### Example 1: Import and Save

```typescript
import { parseRecipeFromUrl } from '@/lib/recipeImport';
import { useCookbookStore } from '@/store/cookbookStore';

async function importAndSaveRecipe(url: string) {
  try {
    // Parse recipe
    const result = await parseRecipeFromUrl(url);

    if (result.recipe) {
      // Save to cookbook
      const { addRecipe } = useCookbookStore();
      addRecipe(
        result.recipe,
        ['imported'],
        `Imported from: ${url}`
      );

      console.log('Recipe saved!');
    }
  } catch (error) {
    console.error('Failed to import:', error);
  }
}
```

### Example 2: Filter by Tag

```typescript
import { useCookbookStore } from '@/store/cookbookStore';

function getQuickRecipes() {
  const { getRecipesByTag } = useCookbookStore();
  return getRecipesByTag('quick');
}

function getCheapRecipes() {
  const { getRecipesByTag } = useCookbookStore();
  return getRecipesByTag('budget-friendly');
}
```

### Example 3: Search and Filter

```typescript
import { useCookbookStore } from '@/store/cookbookStore';

function searchRecipes(query: string) {
  const { searchRecipes, getRecipesByTag } = useCookbookStore();

  // Search by text
  const byText = searchRecipes(query);

  // Could also combine with tags
  const quick = getRecipesByTag('quick');
  const combined = byText.filter(r => r.tags.includes('quick'));

  return { byText, combined };
}
```

### Example 4: Manage Favorites

```typescript
import { useCookbookStore } from '@/store/cookbookStore';

function toggleFavoriteRecipe(recipeId: string) {
  const { toggleFavorite, getRecipeById } = useCookbookStore();

  toggleFavorite(recipeId);

  // Check new state
  const recipe = getRecipeById(recipeId);
  console.log(`Favorite: ${recipe?.isFavorite}`);
}

function getFavorites() {
  const { savedRecipes } = useCookbookStore();
  return savedRecipes.filter(r => r.isFavorite);
}
```

### Example 5: React Component Usage

```typescript
import { useCookbookStore } from '@/store/cookbookStore';
import { View, Text, FlatList } from 'react-native';

export function RecipeList() {
  const { savedRecipes, getRecipesByTag, toggleFavorite } = useCookbookStore();

  return (
    <View>
      <Text>{savedRecipes.length} recipes saved</Text>

      <FlatList
        data={savedRecipes}
        keyExtractor={(r) => r.id}
        renderItem={({ item: recipe }) => (
          <View>
            <Text>{recipe.title}</Text>
            <Text>{recipe.ingredients.length} ingredients</Text>
            <Button
              title={recipe.isFavorite ? '♥' : '♡'}
              onPress={() => toggleFavorite(recipe.id)}
            />
          </View>
        )}
      />
    </View>
  );
}
```

---

## Error Handling

### Import Errors

```typescript
const result = await parseRecipeFromUrl(url);

if (result.status === 'error') {
  console.error('Import failed:', result.message);
  // Handle error - show toast, alert, etc.
}

if (result.status === 'needs_manual') {
  console.warn('Partial import:', result.message);
  // Show manual edit dialog
}

if (result.status === 'success') {
  // Recipe is ready
}
```

### Validation

```typescript
// URL validation
try {
  const url = new URL(userInput);
  const result = await parseRecipeFromUrl(url.toString());
} catch (error) {
  console.error('Invalid URL');
}

// Tags validation
const tags = tagInput
  .split(',')
  .map(t => t.trim())
  .filter(t => t.length > 0);
```

---

## Performance Tips

### Memoization
```typescript
import { useMemo } from 'react';
import { useCookbookStore } from '@/store/cookbookStore';

export function RecipeSelector() {
  const { getRecipesByTag } = useCookbookStore();

  const quickRecipes = useMemo(
    () => getRecipesByTag('quick'),
    [getRecipesByTag] // Updates when store changes
  );

  return <RecipeList recipes={quickRecipes} />;
}
```

### Lazy Loading
```typescript
import { FlatList } from 'react-native';
import { useCookbookStore } from '@/store/cookbookStore';

export function RecipeList() {
  const { savedRecipes } = useCookbookStore();

  return (
    <FlatList
      data={savedRecipes}
      renderItem={({ item }) => <RecipeCard recipe={item} />}
      initialNumToRender={10}  // Load 10 at a time
      maxToRenderPerBatch={5}  // Render 5 at a time
    />
  );
}
```

---

## Debugging

### Check Store State
```typescript
import { useCookbookStore } from '@/store/cookbookStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// View state
const state = useCookbookStore.getState();
console.log('Recipes:', state.savedRecipes);
console.log('Tags:', state.getAllTags());

// View raw storage
const raw = await AsyncStorage.getItem('cookbook-storage');
console.log('Storage:', JSON.parse(raw));
```

### Enable Import Logging
Look for `[Recipe Import]` logs in console:
```
[Recipe Import] yemek.com recipe found: {...}
[Recipe Import] nefisyemekleri.com recipe found: {...}
[Recipe Import] Generic recipe found: {...}
[Recipe Import] JSON parse error: ...
```

---

## FAQ

**Q: Can I use the cookbook store in non-React components?**
A: Yes, use `useCookbookStore.getState()` for non-React code.

**Q: How do I clear all recipes?**
A: Delete them one by one with `removeRecipe()` or clear AsyncStorage.

**Q: Do imported recipes auto-sync to the server?**
A: No, MVP is local-only. Cloud sync is a premium feature.

**Q: Can I export recipes?**
A: Not yet, but the data is accessible via AsyncStorage.

**Q: How do I handle network errors?**
A: parseRecipeFromUrl returns error status, show user-friendly message.

---

## Links

- [Full Feature Docs](./RECIPE_IMPORT_FEATURES.md)
- [Quick Start Guide](./RECIPE_IMPORT_QUICK_START.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
