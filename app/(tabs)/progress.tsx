import { StyleSheet, View, ScrollView } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { useGameificationStore } from '@/store/gamificationStore';
import { badges } from '@/lib/gamification/badges';
import { useEffect } from 'react';
import {
  scaleFontSize,
  moderateScale,
  getGridColumns,
  getResponsiveGap,
} from '@/lib/responsive';

export default function ProgressScreen() {
  const { stats, unlockedBadges, updateFromEvents } = useGameificationStore();

  useEffect(() => {
    updateFromEvents();
  }, []);

  const unlockedBadgeObjects = unlockedBadges
    .map((id) => badges[id])
    .filter(Boolean);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>İlerleme</Text>
        <Text style={styles.subtitle}>Haftalık Özet</Text>

        <GlassCard>
          <Text style={styles.cardTitle}>Kurtarılan Malzeme</Text>
          <Text style={styles.metric}>{stats.totalSavedIngredients}</Text>
          <Text style={styles.cardBody}>Bu hafta pişirerek tasarruf yaptınız</Text>
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Çalışma Serisi (Streak)</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <Text style={styles.streakMetric}>{stats.currentStreak}</Text>
              <Text style={styles.streakLabel}>gün (Bu serinin)</Text>
            </View>
            <View style={styles.streakSeparator} />
            <View style={styles.streakItem}>
              <Text style={styles.streakMetric}>{stats.longestStreak}</Text>
              <Text style={styles.streakLabel}>gün (En uzun)</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Aktivite Özeti</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalCookedCount}</Text>
              <Text style={styles.statLabel}>Pişirilen Tarif</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalPlansCreated}</Text>
              <Text style={styles.statLabel}>Plan Oluşturdu</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalImported}</Text>
              <Text style={styles.statLabel}>İthal Edilen</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Rozetler ({unlockedBadgeObjects.length})</Text>
          {unlockedBadgeObjects.length > 0 ? (
            <View style={styles.badgeGrid}>
              {unlockedBadgeObjects.map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.cardBody}>Henüz rozet kazanmadınız. Başlayın!</Text>
          )}
        </GlassCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFontSize(30),
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    marginBottom: moderateScale(4),
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
    marginBottom: moderateScale(20),
  },
  cardTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    marginBottom: moderateScale(12),
  },
  metric: {
    fontSize: scaleFontSize(36),
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    marginBottom: moderateScale(8),
  },
  cardBody: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakMetric: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    color: '#FF6B6B',
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  streakSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveGap(12),
    marginTop: moderateScale(12),
  },
  badgeItem: {
    alignItems: 'center',
    width: `${(100 / getGridColumns(3) - 2)}%`,
    minWidth: 100,
    padding: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: moderateScale(12),
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
});
