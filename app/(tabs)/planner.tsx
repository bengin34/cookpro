import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassCard, SectionContainer } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { PlanMode } from '@/lib/planner';
import { fetchRecipes } from '@/lib/recipesApi';
import { scoreRecipe } from '@/lib/scoring';
import { useGameificationStore } from '@/store/gamificationStore';
import { usePantryStore } from '@/store/pantryStore';
import { usePlanStore } from '@/store/planStore';
import {
  scaleFontSize,
  moderateScale,
  shouldStackVertically,
  getResponsiveGap,
} from '@/lib/responsive';

export default function PlannerScreen() {
  const [lastGeneratedMode, setLastGeneratedMode] = useState<PlanMode | null>(null);
  const pantryItems = usePantryStore((state) => state.items);
  const mode = usePlanStore((state) => state.mode);
  const planRecipes = usePlanStore((state) => state.planRecipes);
  const lockedIds = usePlanStore((state) => state.lockedIds);
  const generatePlan = usePlanStore((state) => state.generatePlan);
  const setMode = usePlanStore((state) => state.setMode);
  const toggleLock = usePlanStore((state) => state.toggleLock);
  const swapRecipe = usePlanStore((state) => state.swapRecipe);
  const logEvent = useGameificationStore((state) => state.logEvent);
  const { data: recipes = [], isLoading, isError } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  useEffect(() => {
    generatePlan(pantryItems, recipes);
    // Log plan_created event only when mode changes and plan is generated
    if (mode !== lastGeneratedMode && planRecipes.length > 0) {
      logEvent({
        type: 'plan_created',
        mode: mode,
      });
      setLastGeneratedMode(mode);
    }
  }, [generatePlan, pantryItems, mode, recipes, planRecipes.length]);

  return (
    <Screen>
      <Text style={styles.title}>Planner</Text>
      <Text style={styles.subtitle}>Meal / Day / Week</Text>

      {/* Mode Selection Section */}
      <SectionContainer title="Plan Modu" style={styles.modeSection}>
        <View style={styles.segment}>
          {(['meal', 'day', 'week'] as PlanMode[]).map((value) => {
            const isActive = value === mode;
            return (
              <Pressable
                key={value}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setMode(value)}>
                <Text style={isActive ? styles.pillTextActive : styles.pillText}>
                  {value.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <GlassCard variant="subtle" style={styles.infoCard}>
          <Text style={styles.cardBody}>
            Pantry once gelir, son kullanma yakinsa puan artar. Tarifleri kilitle veya degistir.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => generatePlan(pantryItems, recipes)}>
            <Text style={styles.primaryButtonText}>Plani yenile</Text>
          </Pressable>
        </GlassCard>
      </SectionContainer>

      {/* Plan Results Section */}
      <SectionContainer title="Önerilen Tarifler" style={styles.planSection}>
        {isLoading ? (
          <GlassCard variant="subtle">
            <Text style={styles.cardBody}>Plan icin tarifler yukleniyor...</Text>
          </GlassCard>
        ) : null}

        {isError ? (
          <GlassCard variant="subtle">
            <Text style={styles.cardBody}>Tarifler yuklenemedi.</Text>
          </GlassCard>
        ) : null}

        {!isLoading && !isError && planRecipes.length === 0 ? (
          <GlassCard variant="subtle">
            <Text style={styles.cardBody}>Plan olusmadi. Plani yenileyin.</Text>
          </GlassCard>
        ) : null}

        {!isLoading && !isError
          ? planRecipes.map((recipe, index) => {
              const scoreInfo = scoreRecipe(pantryItems, recipe);
              const isLocked = lockedIds.includes(recipe.id);

              return (
                <GlassCard key={recipe.id} variant="elevated">
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{recipe.title}</Text>
                    <Text style={styles.scoreInline}>{scoreInfo.score}%</Text>
                  </View>
                  <Text style={styles.cardBody}>
                    Eksik: {scoreInfo.missingCount} malzeme • {recipe.totalTimeMinutes ?? '--'} dk
                  </Text>
                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.ghostButton, isLocked && styles.lockedButton]}
                      onPress={() => toggleLock(recipe.id)}>
                      <Text style={isLocked ? styles.lockedButtonText : styles.ghostButtonText}>
                        {isLocked ? 'Kilitli' : 'Kilitle'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.ghostButton, isLocked && styles.ghostButtonDisabled]}
                      onPress={() => swapRecipe(index, pantryItems, recipes)}
                      disabled={isLocked}>
                      <Text style={styles.ghostButtonText}>Degistir</Text>
                    </Pressable>
                    <Link href={`/recipes/${recipe.id}`}>
                      <Text style={styles.link}>Tarif</Text>
                    </Link>
                  </View>
                </GlassCard>
              );
            })
          : null}
      </SectionContainer>

      {/* Shopping List Link */}
      <SectionContainer style={styles.shoppingSection}>
        <Link href="/shopping-list">
          <View style={styles.shoppingLink}>
            <Text style={styles.shoppingLinkText}>🛒 Shopping List görüntüle</Text>
          </View>
        </Link>
      </SectionContainer>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFontSize(30),
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
    marginBottom: moderateScale(16),
  },
  modeSection: {
    backgroundColor: 'rgba(194, 65, 12, 0.04)',
    borderColor: 'rgba(194, 65, 12, 0.1)',
  },
  planSection: {
    backgroundColor: 'rgba(74, 222, 128, 0.04)',
    borderColor: 'rgba(74, 222, 128, 0.1)',
  },
  shoppingSection: {
    backgroundColor: 'rgba(0, 122, 255, 0.04)',
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  infoCard: {
    marginTop: moderateScale(12),
    marginBottom: 0,
  },
  segment: {
    flexDirection: 'row',
    gap: getResponsiveGap(8),
  },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  pillActive: {
    borderColor: '#c2410c',
    backgroundColor: 'rgba(194,65,12,0.12)',
  },
  pillText: {
    fontWeight: '600',
    opacity: 0.7,
    fontFamily: 'SpaceMono',
  },
  pillTextActive: {
    fontWeight: '700',
    color: '#c2410c',
    fontFamily: 'SpaceMono',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardBody: {
    opacity: 0.8,
  },
  scoreInline: {
    color: '#c2410c',
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  actionRow: {
    flexDirection: shouldStackVertically(360) ? 'column' : 'row',
    alignItems: shouldStackVertically(360) ? 'stretch' : 'center',
    gap: getResponsiveGap(10),
  },
  primaryButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#c2410c',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: 'rgba(194,65,12,0.4)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ghostButtonDisabled: {
    opacity: 0.5,
  },
  ghostButtonText: {
    color: '#c2410c',
    fontWeight: '600',
  },
  lockedButton: {
    borderColor: 'rgba(60,60,60,0.4)',
  },
  lockedButtonText: {
    color: '#4b4b4b',
    fontWeight: '600',
  },
  link: {
    fontWeight: '600',
    color: '#c2410c',
  },
  shoppingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(12),
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
  },
  shoppingLinkText: {
    fontWeight: '600',
    color: '#007AFF',
    fontSize: scaleFontSize(15),
  },
});
