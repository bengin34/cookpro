import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { Text } from '@/components/Themed';
import { Recipe } from '@/lib/types';
import { RecipeCardSmall } from './RecipeCardSmall';

type RecipesCarouselProps = {
  title: string;
  recipes: Array<{
    recipe: Recipe;
    score: number;
    missingCount: number;
  }>;
};

const CARD_WIDTH = 180;

export function RecipesCarousel({ title, recipes }: RecipesCarouselProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {recipes.map(({ recipe, score, missingCount }) => (
          <RecipeCardSmall
            key={recipe.id}
            recipe={recipe}
            score={score}
            missingCount={missingCount}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 0,
  },
  scrollContent: {
    paddingHorizontal: 0,
    gap: 12,
  },
});
