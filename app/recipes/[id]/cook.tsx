import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { fetchRecipeById } from '@/lib/recipesApi';
import { useGameificationStore } from '@/store/gamificationStore';
import { usePantryStore } from '@/store/pantryStore';

export default function CookingModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cooked, setCooked] = useState(false);
  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ['recipes', id],
    queryFn: () => fetchRecipeById(String(id)),
    enabled: Boolean(id),
  });
  const logEvent = useGameificationStore((state) => state.logEvent);
  const pantryItems = usePantryStore((state) => state.items);

  const handleMarkAsCooked = () => {
    if (!recipe?.id) return;

    // Log the cooked event
    logEvent({
      type: 'cooked',
      recipeId: recipe.id,
    });

    // Calculate saved ingredients count
    const pantrySet = new Set(pantryItems.map((item) => item.name.toLowerCase().trim()));
    const savedCount = recipe.ingredients.filter((ing) => pantrySet.has(ing.name.toLowerCase().trim())).length;

    // Update saved ingredients stat
    if (savedCount > 0) {
      logEvent({
        type: 'pantry_saved',
        ingredientCount: savedCount,
      });
    }

    setCooked(true);
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  if (isLoading) {
    return (
      <Screen>
        <Text style={styles.title}>Tarif yukleniyor...</Text>
      </Screen>
    );
  }

  if (isError || !recipe) {
    return (
      <Screen>
        <Text style={styles.title}>Tarif bulunamadi</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Pişirme Modu</Text>
      <Text style={styles.subtitle}>{recipe.title}</Text>

      <GlassCard>
        <Text style={styles.sectionTitle}>Adımlar</Text>
        {recipe.instructions && recipe.instructions.length > 0 ? (
          recipe.instructions.map((step, index) => (
            <Text key={`${index}-${step}`} style={styles.step}>
              {index + 1}. {step}
            </Text>
          ))
        ) : (
          <Text style={styles.step}>Bu tarif için henüz adım bilgisi eklenmemiş.</Text>
        )}
      </GlassCard>

      <GlassCard>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Süre</Text>
            <Text style={styles.infoValue}>{recipe.totalTimeMinutes ?? '--'} dk</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Porsiyon</Text>
            <Text style={styles.infoValue}>x{recipe.servings ?? 1}</Text>
          </View>
        </View>
      </GlassCard>

      {!cooked ? (
        <Pressable style={styles.cookedButton} onPress={handleMarkAsCooked}>
          <Text style={styles.cookedButtonText}>✓ Bu Tarifi Pişirdim</Text>
        </Pressable>
      ) : (
        <GlassCard>
          <Text style={styles.successText}>🎉 Başarısı kaydedildi!</Text>
        </GlassCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  step: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  cookedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  cookedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
});
