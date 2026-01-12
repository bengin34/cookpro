import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

export type IngredientItem = {
  id: string;
  name: string;
  emoji?: string;
};

type IngredientsSelectorProps = {
  ingredients: IngredientItem[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
};

export function IngredientsSelector({
  ingredients,
  selectedIds,
  onSelect,
  onDeselect,
}: IngredientsSelectorProps) {
  const textColor = Colors.light.text;

  const toggleIngredient = (id: string) => {
    if (selectedIds.has(id)) {
      onDeselect(id);
    } else {
      onSelect(id);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      scrollEventThrottle={16}>
      {ingredients.map((ingredient) => {
        const isSelected = selectedIds.has(ingredient.id);
        return (
          <Pressable
            key={ingredient.id}
            style={[
              styles.ingredientItem,
              isSelected && styles.ingredientItemSelected,
            ]}
            onPress={() => toggleIngredient(ingredient.id)}>
            {ingredient.emoji && (
              <View style={styles.ingredientEmojiContainer}>
                <Text style={styles.ingredientEmoji}>{ingredient.emoji}</Text>
              </View>
            )}
            <View style={styles.ingredientContent}>
              <Text
                style={[
                  styles.ingredientName,
                  isSelected && styles.ingredientNameSelected,
                ]}
                numberOfLines={2}>
                {ingredient.name}
              </Text>
              {isSelected && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  ingredientItem: {
    width: 120,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  ingredientItemSelected: {
    backgroundColor: 'rgba(194,65,12,0.25)',
    borderColor: '#c2410c',
    borderWidth: 2,
  },
  ingredientEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientEmoji: {
    fontSize: 32,
  },
  ingredientContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  ingredientNameSelected: {
    fontWeight: '700',
    color: '#c2410c',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c2410c',
  },
});
