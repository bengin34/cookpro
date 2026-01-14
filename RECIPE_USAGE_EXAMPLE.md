# Recipe Hooks Usage Examples

## Overview

Your CookPro app now has React Query fully integrated with pantry-based recipe scoring. Here's how to use the hooks in your screens.

## Basic Setup

### 1. React Query Provider (Already Done ✅)

The `QueryProvider` is already set up in [app/_layout.tsx](app/_layout.tsx:53):

```tsx
<QueryProvider>
  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    {/* Your app screens */}
  </ThemeProvider>
</QueryProvider>
```

## Available Hooks

### Core Hooks

#### `useRecipes()` - Fetch all recipes
```tsx
import { useRecipes } from '@/hooks/useRecipes';

const { data: recipes, isLoading, error } = useRecipes();
```

#### `useRecipe(id)` - Fetch a single recipe
```tsx
import { useRecipe } from '@/hooks/useRecipes';

const { data: recipe, isLoading } = useRecipe(recipeId);
```

### Pantry-Integrated Hooks (NEW!)

These hooks automatically calculate Pantry Fit Scores and suggest recipes based on what's in your pantry.

#### `usePantryRecipes()` - All recipes with Pantry Fit Scores
```tsx
import { usePantryRecipes } from '@/hooks/usePantryRecipes';
import type { UserPreferences } from '@/lib/scoring';

const preferences: UserPreferences = {
  allergies: ['peanut'],
  diets: ['vegetarian'],
  disliked: ['cilantro'],
};

const { scoredRecipes, isLoading, pantryItemCount } = usePantryRecipes(
  preferences,
  recentRecipeIds,
  'best-match' // or 'quickest' or 'cheapest'
);

// Each scoredRecipe contains:
// - recipe: Full recipe data from Supabase
// - scoreBreakdown: {
//     score: 85,           // Overall score (0-100)
//     matchScore: 60,      // How many ingredients you have
//     expiryBonus: 15,     // Bonus for using expiring ingredients
//     varietyBonus: 10,    // Bonus for variety
//     allergenPenalty: 0,  // Penalty for allergens
//     missingCount: 2,     // Number of missing ingredients
//     missing: ['salt', 'pepper'] // Names of missing ingredients
//   }
```

#### `useCompletePantryRecipes()` - Recipes you can make right now
```tsx
import { useCompletePantryRecipes } from '@/hooks/usePantryRecipes';

const { completeRecipes, isLoading } = useCompletePantryRecipes(preferences);

// Only returns recipes where missingCount === 0
```

#### `useAlmostCompleteRecipes()` - Recipes missing just a few ingredients
```tsx
import { useAlmostCompleteRecipes } from '@/hooks/usePantryRecipes';

const { almostCompleteRecipes, isLoading } = useAlmostCompleteRecipes(
  2, // max missing ingredients
  preferences
);

// Returns recipes missing 1-2 ingredients
```

#### `useExpiringIngredientRecipes()` - Use expiring ingredients
```tsx
import { useExpiringIngredientRecipes } from '@/hooks/usePantryRecipes';

const { expiringRecipes, isLoading } = useExpiringIngredientRecipes(preferences);

// Returns recipes that use ingredients expiring soon
// Sorted by expiry bonus (highest first)
```

## Complete Example: Discover Screen

```tsx
// app/(tabs)/discover.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { usePantryRecipes } from '@/hooks/usePantryRecipes';
import type { UserPreferences } from '@/lib/scoring';

type SortOption = 'best-match' | 'quickest' | 'cheapest';

export default function DiscoverScreen() {
  const [sortBy, setSortBy] = useState<SortOption>('best-match');

  // User preferences (could come from a settings store)
  const preferences: UserPreferences = {
    allergies: [],
    diets: [],
    disliked: [],
  };

  const { scoredRecipes, isLoading, error, pantryItemCount } = usePantryRecipes(
    preferences,
    undefined, // recentRecipeIds - could track in gamification store
    sortBy
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e25822" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading recipes</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with sort options */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          Recipes for You
        </Text>
        <Text style={{ color: '#666', marginBottom: 16 }}>
          {pantryItemCount} items in your pantry
        </Text>

        {/* Sort buttons */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSortBy('best-match')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: sortBy === 'best-match' ? '#e25822' : '#f0f0f0',
            }}
          >
            <Text style={{ color: sortBy === 'best-match' ? '#fff' : '#333' }}>
              Best Match
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('quickest')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: sortBy === 'quickest' ? '#e25822' : '#f0f0f0',
            }}
          >
            <Text style={{ color: sortBy === 'quickest' ? '#fff' : '#333' }}>
              Quickest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('cheapest')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: sortBy === 'cheapest' ? '#e25822' : '#f0f0f0',
            }}
          >
            <Text style={{ color: sortBy === 'cheapest' ? '#fff' : '#333' }}>
              Fewest Missing
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe list */}
      <FlatList
        data={scoredRecipes}
        keyExtractor={(item) => item.recipe.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/recipes/${item.recipe.id}`)}
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                  {item.recipe.title}
                </Text>

                {/* Pantry Fit Score */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View
                    style={{
                      backgroundColor:
                        item.scoreBreakdown.score >= 80 ? '#4CAF50' :
                        item.scoreBreakdown.score >= 60 ? '#FF9800' : '#9E9E9E',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                      {item.scoreBreakdown.score}% Match
                    </Text>
                  </View>

                  {item.scoreBreakdown.missingCount > 0 && (
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      Missing: {item.scoreBreakdown.missingCount} ingredients
                    </Text>
                  )}
                </View>

                {/* Missing ingredients */}
                {item.scoreBreakdown.missing.length > 0 && (
                  <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                    Need: {item.scoreBreakdown.missing.slice(0, 3).join(', ')}
                    {item.scoreBreakdown.missing.length > 3 && '...'}
                  </Text>
                )}

                {/* Recipe details */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {item.recipe.total_time_minutes && (
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      ⏱️ {item.recipe.total_time_minutes} min
                    </Text>
                  )}
                  {item.recipe.servings && (
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      👥 {item.recipe.servings} servings
                    </Text>
                  )}
                  {item.scoreBreakdown.expiryBonus > 0 && (
                    <Text style={{ fontSize: 12, color: '#FF5722' }}>
                      ⚠️ Uses expiring items
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

## Using in Other Screens

### Quick Meal Suggestions
```tsx
import { useCompletePantryRecipes } from '@/hooks/usePantryRecipes';

function QuickMealScreen() {
  const { completeRecipes, isLoading } = useCompletePantryRecipes();

  return (
    <View>
      <Text>Cook Right Now ({completeRecipes.length} recipes)</Text>
      {completeRecipes.slice(0, 5).map(({ recipe, scoreBreakdown }) => (
        <RecipeCard key={recipe.id} recipe={recipe} score={scoreBreakdown} />
      ))}
    </View>
  );
}
```

### Waste Prevention Screen
```tsx
import { useExpiringIngredientRecipes } from '@/hooks/usePantryRecipes';

function WastePreventionScreen() {
  const { expiringRecipes, isLoading } = useExpiringIngredientRecipes();

  return (
    <View>
      <Text>Save These Ingredients!</Text>
      {expiringRecipes.map(({ recipe, scoreBreakdown }) => (
        <View key={recipe.id}>
          <Text>{recipe.title}</Text>
          <Text>Expiry Bonus: {scoreBreakdown.expiryBonus} points</Text>
        </View>
      ))}
    </View>
  );
}
```

## Managing Pantry Items

The pantry is managed through Zustand store:

```tsx
import { usePantryStore } from '@/store/pantryStore';

function PantryScreen() {
  const items = usePantryStore((state) => state.items);
  const addItem = usePantryStore((state) => state.addItem);
  const removeItem = usePantryStore((state) => state.removeItem);

  const handleAddItem = () => {
    addItem('Tomatoes', '2026-01-20'); // name, expiresAt (optional)
  };

  return (
    <View>
      {items.map(item => (
        <View key={item.id}>
          <Text>{item.name}</Text>
          {item.expiresAt && <Text>Expires: {item.expiresAt}</Text>}
          <Button title="Remove" onPress={() => removeItem(item.id)} />
        </View>
      ))}
      <Button title="Add Item" onPress={handleAddItem} />
    </View>
  );
}
```

## Key Benefits

1. **Automatic Caching**: React Query caches recipe data, reducing API calls
2. **Real-time Scoring**: Scores update automatically when pantry items change
3. **Smart Suggestions**: Multiple sorting options and filtering strategies
4. **Waste Prevention**: Prioritizes recipes using expiring ingredients
5. **User Preferences**: Respects allergies, dietary restrictions, and dislikes
6. **Variety Tracking**: Avoids suggesting recently cooked recipes

## Next Steps

1. ✅ React Query Provider setup
2. ✅ Recipe hooks with Supabase integration
3. ✅ Pantry-based scoring hooks
4. 🔲 Implement Discover screen with these hooks
5. 🔲 Add user preferences to settings
6. 🔲 Track recently cooked recipes for variety bonus
7. 🔲 Create shopping list from missing ingredients
