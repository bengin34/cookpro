import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { GlassCard } from '@/components/GlassCard';
import { pricing } from '@/lib/paywall/limits';

type PaywallProps = {
  onUpgrade: () => void;
  onDismiss: () => void;
  showDismissButton?: boolean;
};

export function Paywall({ onUpgrade, onDismiss, showDismissButton = true }: PaywallProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Premium'a Yükselt</Text>
      <Text style={styles.subtitle}>Tüm özelliklere erişin</Text>

      <GlassCard>
        <Text style={styles.cardTitle}>Premium Faydaları</Text>
        {pricing.premium.benefits.map((benefit, idx) => (
          <View key={idx} style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </GlassCard>

      <GlassCard>
        <Text style={styles.priceLabel}>Aylık Fiyat</Text>
        <Text style={styles.price}>${pricing.premium.monthlyPrice}/ay</Text>
        <Text style={styles.priceSubtext}>ya da {pricing.premium.yearlyPrice}/yıl</Text>
      </GlassCard>

      <Pressable style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeButtonText}>Premium'a Yükselt</Text>
      </Pressable>

      {showDismissButton && (
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>Daha sonra</Text>
        </Pressable>
      )}

      <Text style={styles.legal}>Aboneliğiniz her ay otomatik olarak yenilenir.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: '700',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#c2410c',
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  upgradeButton: {
    backgroundColor: '#c2410c',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dismissButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c2410c',
  },
  legal: {
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 12,
  },
});
