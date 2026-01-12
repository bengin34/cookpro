import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';

export default function OnboardingScreen() {
  return (
    <Screen contentStyle={styles.container}>
      <Text style={styles.eyebrow}>CookPro</Text>
      <Text style={styles.title}>Evdeki malzeme ile hizli plan</Text>
      <Text style={styles.body}>
        Diyet/alerjen, kisi sayisi ve hedefini sec. Sonra Pantry'yi dolduralim.
      </Text>

      <GlassCard>
        <Text style={styles.cardTitle}>Hedef</Text>
        <Text style={styles.cardBody}>Waste Saver / Budget / Balanced</Text>
      </GlassCard>

      <Link href="/">
        <Text style={styles.cta}>Pantry'yi dolduralim</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  body: {
    fontSize: 16,
    opacity: 0.8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    opacity: 0.8,
  },
  cta: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c2410c',
    fontFamily: 'SpaceMono',
  },
});
