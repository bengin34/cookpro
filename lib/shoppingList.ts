import { PantryItem, Recipe } from '@/lib/types';

export type ShoppingListItem = {
  name: string;
  quantity?: string;
  unit?: string;
  count: number;
  category: string;
};

export type ShoppingListGroup = {
  title: string;
  items: ShoppingListItem[];
};

const categoryMap: Record<string, string> = {
  tomato: 'Produce',
  onion: 'Produce',
  garlic: 'Produce',
  lettuce: 'Produce',
  lemon: 'Produce',
  egg: 'Dairy',
  milk: 'Dairy',
  cheese: 'Dairy',
  chicken: 'Protein',
  pasta: 'Pantry',
  'olive oil': 'Pantry',
};

const normalize = (value: string) => value.trim().toLowerCase();

const getCategory = (name: string) => categoryMap[normalize(name)] ?? 'Pantry';

export const buildShoppingList = (pantryItems: PantryItem[], recipes: Recipe[]) => {
  const pantrySet = new Set(pantryItems.map((item) => normalize(item.name)));
  const itemsByName = new Map<string, ShoppingListItem>();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      if (ingredient.optional) {
        return;
      }

      const key = normalize(ingredient.name);
      if (pantrySet.has(key)) {
        return;
      }

      const existing = itemsByName.get(key);
      if (existing) {
        existing.count += 1;
        itemsByName.set(key, existing);
        return;
      }

      itemsByName.set(key, {
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        count: 1,
        category: getCategory(ingredient.name),
      });
    });
  });

  const grouped = new Map<string, ShoppingListItem[]>();
  itemsByName.forEach((item) => {
    const group = grouped.get(item.category) ?? [];
    group.push(item);
    grouped.set(item.category, group);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([title, items]) => ({
      title,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
};
