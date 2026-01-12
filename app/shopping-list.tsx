import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { usePlanStore } from '@/store/planStore';

export default function ShoppingListScreen() {
  const shoppingList = usePlanStore((state) => state.shoppingList);

  return (
    <Screen>
      <Text style={styles.title}>Shopping List</Text>
      <Text style={styles.subtitle}>Plan -> eksik malzemeler</Text>

      {shoppingList.length === 0 ? (
        <GlassCard>
          <Text style={styles.cardBody}>Eksik malzeme yok veya plan olusmadi.</Text>
        </GlassCard>
      ) : (
        shoppingList.map((group) => (
          <GlassCard key={group.title}>
            <Text style={styles.cardTitle}>{group.title}</Text>
            {group.items.map((item) => (
              <Text key={item.name} style={styles.cardBody}>
                {item.name}
                {item.quantity ? ` • ${item.quantity}` : ''}
                {item.unit ? ` ${item.unit}` : ''}
                {item.count > 1 ? ` x${item.count}` : ''}
              </Text>
            ))}
          </GlassCard>
        ))
      )}

      <Link href="/planner">
        <Text style={styles.link}>Planner'a don</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    opacity: 0.8,
  },
  link: {
    fontWeight: '600',
    color: '#c2410c',
  },
});
