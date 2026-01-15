import { StyleSheet, View, ScrollView } from 'react-native';

import { GlassCard, SectionContainer } from '@/components/GlassCard';
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

        {/* Savings Section */}
        <SectionContainer title="Tasarruf" style={styles.savingsSection}>
          <GlassCard variant="elevated">
            <View style={styles.metricRow}>
              <View>
                <Text style={styles.metric}>{stats.totalSavedIngredients}</Text>
                <Text style={styles.metricLabel}>Kurtarılan Malzeme</Text>
              </View>
              <Text style={styles.savingsEmoji}>🥗</Text>
            </View>
            <Text style={styles.cardBody}>Bu hafta pişirerek tasarruf yaptınız</Text>
          </GlassCard>
        </SectionContainer>

        {/* Streak Section */}
        <SectionContainer title="Seri" style={styles.streakSection}>
          <GlassCard variant="elevated">
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
        </SectionContainer>

        {/* Activity Section */}
        <SectionContainer title="Aktivite" style={styles.activitySection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCookedCount}</Text>
              <Text style={styles.statLabel}>Pişirilen</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalPlansCreated}</Text>
              <Text style={styles.statLabel}>Plan</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalImported}</Text>
              <Text style={styles.statLabel}>Import</Text>
            </View>
          </View>
        </SectionContainer>

        {/* Badges Section */}
        <SectionContainer title={`Rozetler (${unlockedBadgeObjects.length})`} style={styles.badgesSection}>
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
            <GlassCard variant="subtle">
              <Text style={styles.cardBody}>Henüz rozet kazanmadınız. Başlayın!</Text>
            </GlassCard>
          )}
        </SectionContainer>
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
  savingsSection: {
    backgroundColor: 'rgba(74, 222, 128, 0.04)',
    borderColor: 'rgba(74, 222, 128, 0.1)',
  },
  streakSection: {
    backgroundColor: 'rgba(255, 107, 107, 0.04)',
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
  activitySection: {
    backgroundColor: 'rgba(0, 122, 255, 0.03)',
    borderColor: 'rgba(0, 122, 255, 0.08)',
  },
  badgesSection: {
    backgroundColor: 'rgba(167, 139, 250, 0.04)',
    borderColor: 'rgba(167, 139, 250, 0.1)',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metric: {
    fontSize: scaleFontSize(42),
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    color: '#22c55e',
  },
  metricLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    opacity: 0.7,
  },
  savingsEmoji: {
    fontSize: 48,
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
    fontSize: 36,
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
    height: 50,
    backgroundColor: 'rgba(255,107,107,0.2)',
    marginHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: getResponsiveGap(12),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: moderateScale(16),
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(8),
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.15)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveGap(12),
  },
  badgeItem: {
    alignItems: 'center',
    width: `${(100 / getGridColumns(3) - 2)}%`,
    minWidth: 100,
    padding: moderateScale(12),
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  badgeIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
});
