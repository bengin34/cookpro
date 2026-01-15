import { Link } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/Themed';
import { usePantryStore } from '@/store/pantryStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import Colors from '@/constants/Colors';
import { PantryItem } from '@/lib/types';
import {
  scaleFontSize,
  moderateScale,
  getSafeHorizontalPadding,
  getModalMaxHeight,
  shouldStackVertically,
  getResponsiveGap,
} from '@/lib/responsive';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = {
  dairy: { label: 'Dairy & Eggs', emoji: '🥛', color: '#60a5fa' },
  produce: { label: 'Produce', emoji: '🥬', color: '#4ade80' },
  protein: { label: 'Protein', emoji: '🍗', color: '#f87171' },
  grains: { label: 'Grains & Pasta', emoji: '🍚', color: '#fbbf24' },
  pantry: { label: 'Pantry Staples', emoji: '🫒', color: '#a78bfa' },
  other: { label: 'Other', emoji: '🥫', color: '#94a3b8' },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

const pantryEmojis: Record<string, { emoji: string; category: CategoryKey }> = {
  milk: { emoji: '🥛', category: 'dairy' },
  egg: { emoji: '🥚', category: 'dairy' },
  eggs: { emoji: '🥚', category: 'dairy' },
  cheese: { emoji: '🧀', category: 'dairy' },
  butter: { emoji: '🧈', category: 'dairy' },
  yogurt: { emoji: '🥛', category: 'dairy' },
  cream: { emoji: '🥛', category: 'dairy' },
  tomato: { emoji: '🍅', category: 'produce' },
  garlic: { emoji: '🧄', category: 'produce' },
  onion: { emoji: '🧅', category: 'produce' },
  potato: { emoji: '🥔', category: 'produce' },
  carrot: { emoji: '🥕', category: 'produce' },
  lettuce: { emoji: '🥬', category: 'produce' },
  cucumber: { emoji: '🥒', category: 'produce' },
  pepper: { emoji: '🌶️', category: 'produce' },
  lemon: { emoji: '🍋', category: 'produce' },
  apple: { emoji: '🍎', category: 'produce' },
  banana: { emoji: '🍌', category: 'produce' },
  chicken: { emoji: '🍗', category: 'protein' },
  beef: { emoji: '🥩', category: 'protein' },
  fish: { emoji: '🐟', category: 'protein' },
  salmon: { emoji: '🍣', category: 'protein' },
  shrimp: { emoji: '🦐', category: 'protein' },
  rice: { emoji: '🍚', category: 'grains' },
  pasta: { emoji: '🍝', category: 'grains' },
  bread: { emoji: '🍞', category: 'grains' },
  flour: { emoji: '🌾', category: 'grains' },
  oats: { emoji: '🥣', category: 'grains' },
  'olive oil': { emoji: '🫒', category: 'pantry' },
  oil: { emoji: '🫒', category: 'pantry' },
  salt: { emoji: '🧂', category: 'pantry' },
  sugar: { emoji: '🍬', category: 'pantry' },
  honey: { emoji: '🍯', category: 'pantry' },
  soy: { emoji: '🥫', category: 'pantry' },
};

const getPantryInfo = (name: string): { emoji: string; category: CategoryKey } => {
  const key = name.trim().toLowerCase();
  return pantryEmojis[key] ?? { emoji: '🥫', category: 'other' };
};

const allergenOptions = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Sesame', 'Peanuts'];
const dietOptions = ['Vegetarian', 'Vegan', 'Keto', 'Paleo'];

const quickAddSuggestions = [
  // Dairy & Eggs
  { id: 'milk', name: 'Milk', emoji: '🥛' },
  { id: 'eggs', name: 'Eggs', emoji: '🥚' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀' },
  { id: 'butter', name: 'Butter', emoji: '🧈' },
  { id: 'yogurt', name: 'Yogurt', emoji: '🥛' },
  { id: 'cream', name: 'Cream', emoji: '🍶' },
  // Vegetables
  { id: 'tomato', name: 'Tomato', emoji: '🍅' },
  { id: 'onion', name: 'Onion', emoji: '🧅' },
  { id: 'garlic', name: 'Garlic', emoji: '🧄' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕' },
  { id: 'potato', name: 'Potato', emoji: '🥔' },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬' },
  { id: 'cucumber', name: 'Cucumber', emoji: '🥒' },
  { id: 'pepper', name: 'Pepper', emoji: '🌶️' },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦' },
  { id: 'spinach', name: 'Spinach', emoji: '🥬' },
  { id: 'zucchini', name: 'Zucchini', emoji: '🥒' },
  { id: 'eggplant', name: 'Eggplant', emoji: '🍆' },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄' },
  // Proteins
  { id: 'chicken', name: 'Chicken', emoji: '🍗' },
  { id: 'beef', name: 'Beef', emoji: '🥩' },
  { id: 'pork', name: 'Pork', emoji: '🐷' },
  { id: 'fish', name: 'Fish', emoji: '🐟' },
  { id: 'salmon', name: 'Salmon', emoji: '🍣' },
  { id: 'shrimp', name: 'Shrimp', emoji: '🦐' },
  { id: 'tofu', name: 'Tofu', emoji: '🥡' },
  { id: 'beans', name: 'Beans', emoji: '🫘' },
  { id: 'lentils', name: 'Lentils', emoji: '🫘' },
  // Fruits
  { id: 'apple', name: 'Apple', emoji: '🍎' },
  { id: 'banana', name: 'Banana', emoji: '🍌' },
  { id: 'orange', name: 'Orange', emoji: '🍊' },
  { id: 'lemon', name: 'Lemon', emoji: '🍋' },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓' },
  { id: 'blueberry', name: 'Blueberry', emoji: '🫐' },
  { id: 'grape', name: 'Grape', emoji: '🍇' },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉' },
  { id: 'avocado', name: 'Avocado', emoji: '🥑' },
  // Grains
  { id: 'rice', name: 'Rice', emoji: '🍚' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'bread', name: 'Bread', emoji: '🍞' },
  { id: 'flour', name: 'Flour', emoji: '🌾' },
  { id: 'oats', name: 'Oats', emoji: '🥣' },
  { id: 'quinoa', name: 'Quinoa', emoji: '🌾' },
  { id: 'cereal', name: 'Cereal', emoji: '🥣' },
  // Pantry Staples
  { id: 'olive oil', name: 'Olive Oil', emoji: '🫒' },
  { id: 'salt', name: 'Salt', emoji: '🧂' },
  { id: 'sugar', name: 'Sugar', emoji: '🍬' },
  { id: 'honey', name: 'Honey', emoji: '🍯' },
  { id: 'soy sauce', name: 'Soy Sauce', emoji: '🥫' },
  { id: 'vinegar', name: 'Vinegar', emoji: '🫙' },
  { id: 'spices', name: 'Spices', emoji: '🌶️' },
  { id: 'nuts', name: 'Nuts', emoji: '🥜' },
];

const getDaysUntilExpiry = (expiresAt?: string): number | null => {
  if (!expiresAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (days: number | null): 'expired' | 'urgent' | 'soon' | 'ok' | 'none' => {
  if (days === null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 2) return 'urgent';
  if (days <= 5) return 'soon';
  return 'ok';
};

export default function PantryScreen() {
  const colors = Colors['light'];
  const insets = useSafeAreaInsets();

  const items = usePantryStore((state) => state.items);
  const addItem = usePantryStore((state) => state.addItem);
  const removeItem = usePantryStore((state) => state.removeItem);
  const preferences = usePreferencesStore((state) => state.preferences);
  const setAllergies = usePreferencesStore((state) => state.setAllergies);
  const setDiets = usePreferencesStore((state) => state.setDiets);

  const [nameInput, setNameInput] = useState('');
  const [prefsModalVisible, setPrefsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<CategoryKey | null>(null);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<CategoryKey, PantryItem[]> = {
      dairy: [],
      produce: [],
      protein: [],
      grains: [],
      pantry: [],
      other: [],
    };

    items.forEach((item) => {
      const { category } = getPantryInfo(item.name);
      groups[category].push(item);
    });

    // Sort each category by expiry date
    Object.keys(groups).forEach((key) => {
      groups[key as CategoryKey].sort((a, b) => {
        const daysA = getDaysUntilExpiry(a.expiresAt);
        const daysB = getDaysUntilExpiry(b.expiresAt);
        if (daysA === null && daysB === null) return 0;
        if (daysA === null) return 1;
        if (daysB === null) return -1;
        return daysA - daysB;
      });
    });

    return groups;
  }, [items]);

  // Items expiring soon
  const expiringItems = useMemo(() => {
    return items
      .filter((item) => {
        const days = getDaysUntilExpiry(item.expiresAt);
        return days !== null && days <= 3;
      })
      .sort((a, b) => {
        const daysA = getDaysUntilExpiry(a.expiresAt) ?? 999;
        const daysB = getDaysUntilExpiry(b.expiresAt) ?? 999;
        return daysA - daysB;
      });
  }, [items]);

  const handleQuickAdd = useCallback(
    (name: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addItem(name);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    [addItem]
  );

  const handleAddCustom = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(trimmed);
    setNameInput('');
    setAddModalVisible(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleRemove = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      removeItem(id);
    },
    [removeItem]
  );

  const toggleCategory = (category: CategoryKey) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const toggleAllergen = (allergen: string) => {
    Haptics.selectionAsync();
    const lower = allergen.toLowerCase();
    const newAllergies = preferences.allergies.includes(lower)
      ? preferences.allergies.filter((a) => a !== lower)
      : [...preferences.allergies, lower];
    setAllergies(newAllergies);
  };

  const toggleDiet = (diet: string) => {
    Haptics.selectionAsync();
    const lower = diet.toLowerCase();
    const newDiets = preferences.diets.includes(lower)
      ? preferences.diets.filter((d) => d !== lower)
      : [...preferences.diets, lower];
    setDiets(newDiets);
  };

  const renderPantryItem = (item: PantryItem) => {
    const { emoji } = getPantryInfo(item.name);
    const days = getDaysUntilExpiry(item.expiresAt);
    const status = getExpiryStatus(days);

    return (
      <View key={item.id} style={styles.itemRow}>
        <View style={styles.itemLeft}>
          <View style={styles.itemEmoji}>
            <Text style={styles.itemEmojiText}>{emoji}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            {item.quantity && (
              <Text style={[styles.itemQuantity, { color: colors.secondaryText }]}>
                {typeof item.quantity === 'number' ? `${item.quantity} ${item.unit || ''}` : item.quantity}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.itemRight}>
          {status !== 'none' && (
            <View
              style={[
                styles.expiryBadge,
                status === 'expired' && styles.expiryExpired,
                status === 'urgent' && styles.expiryUrgent,
                status === 'soon' && styles.expirySoon,
                status === 'ok' && styles.expiryOk,
              ]}>
              <Text
                style={[
                  styles.expiryText,
                  (status === 'expired' || status === 'urgent') && styles.expiryTextLight,
                ]}>
                {status === 'expired'
                  ? 'Expired'
                  : days === 0
                    ? 'Today'
                    : days === 1
                      ? '1 day'
                      : `${days} days`}
              </Text>
            </View>
          )}
          <Pressable
            onPress={() => handleRemove(item.id)}
            style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
            hitSlop={8}>
            <Text style={styles.removeIcon}>×</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const nonEmptyCategories = (Object.keys(CATEGORIES) as CategoryKey[]).filter(
    (key) => groupedItems[key].length > 0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.secondaryText }]}>Your Kitchen</Text>
          <Text style={[styles.title, { color: colors.text }]}>Pantry</Text>
        </View>
        <Pressable
          onPress={() => setPrefsModalVisible(true)}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.settingsButtonPressed,
          ]}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.tint }]}>{items.length}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: expiringItems.length > 0 ? '#f59e0b' : colors.tint }]}>
            {expiringItems.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Expiring Soon</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.tint }]}>{nonEmptyCategories.length}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Categories</Text>
        </View>
      </View>

      {/* Quick Add Section */}
      <View style={styles.quickAddSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Add</Text>
          <Pressable
            onPress={() => setAddModalVisible(true)}
            style={({ pressed }) => [styles.customAddButton, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.customAddText, { color: colors.tint }]}>+ Custom</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAddScroll}
          keyboardShouldPersistTaps="handled">
          {quickAddSuggestions.map((suggestion) => {
            const isInPantry = items.some(
              (item) => item.name.toLowerCase() === suggestion.id.toLowerCase()
            );
            return (
              <Pressable
                key={suggestion.id}
                onPress={() => {
                  if (!isInPantry) {
                    handleQuickAdd(suggestion.name);
                  }
                }}
                disabled={isInPantry}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.quickAddChip,
                  isInPantry && styles.quickAddChipAdded,
                  pressed && !isInPantry && styles.quickAddChipPressed,
                ]}>
                <Text style={styles.quickAddEmoji}>{suggestion.emoji}</Text>
                <Text
                  style={[
                    styles.quickAddName,
                    { color: isInPantry ? colors.secondaryText : colors.text },
                  ]}
                  numberOfLines={1}>
                  {suggestion.name}
                </Text>
                {isInPantry && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content - Category List */}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍳</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your pantry is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
              Add 5-10 ingredients to get personalized recipe suggestions
            </Text>
          </View>
        ) : (
          <View style={styles.categoriesContainer}>
            {nonEmptyCategories.map((categoryKey) => {
              const category = CATEGORIES[categoryKey];
              const categoryItems = groupedItems[categoryKey];
              const isExpanded = expandedCategory === categoryKey;

              return (
                <View key={categoryKey} style={styles.categorySection}>
                  <Pressable
                    onPress={() => toggleCategory(categoryKey)}
                    style={({ pressed }) => [
                      styles.categoryHeader,
                      pressed && styles.categoryHeaderPressed,
                    ]}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      </View>
                      <Text style={[styles.categoryName, { color: colors.text }]}>{category.label}</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <View style={[styles.countBadge, { backgroundColor: `${category.color}30` }]}>
                        <Text style={[styles.countText, { color: category.color }]}>
                          {categoryItems.length}
                        </Text>
                      </View>
                      <Text style={[styles.chevron, { color: colors.secondaryText }]}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.categoryItems}>
                      {categoryItems.map(renderPantryItem)}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
        <Link href="/discover" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.discoverButton,
              pressed && styles.discoverButtonPressed,
            ]}>
            <Text style={styles.discoverButtonText}>Find Recipes →</Text>
          </Pressable>
        </Link>
      </View>

      {/* Add Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={() => setAddModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Ingredient</Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter ingredient name..."
                placeholderTextColor={colors.secondaryText}
                style={[styles.modalInput, { color: colors.text, backgroundColor: '#fff' }]}
                autoFocus
                onSubmitEditing={handleAddCustom}
                returnKeyType="done"
              />
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setAddModalVisible(false)}
                  style={({ pressed }) => [styles.modalCancelButton, pressed && { opacity: 0.7 }]}>
                  <Text style={[styles.modalCancelText, { color: colors.secondaryText }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddCustom}
                  disabled={!nameInput.trim()}
                  style={({ pressed }) => [
                    styles.modalAddButton,
                    pressed && styles.modalAddButtonPressed,
                    !nameInput.trim() && styles.modalAddButtonDisabled,
                  ]}>
                  <Text style={styles.modalAddText}>Add to Pantry</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Preferences Modal */}
      <Modal
        visible={prefsModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent>
        <Pressable style={styles.modalOverlay} onPress={() => setPrefsModalVisible(false)}>
          <Pressable style={[styles.modalContent, styles.modalContentLarge]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Preferences</Text>
              <Pressable onPress={() => setPrefsModalVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.tint }]}>Done</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.prefsSection}>
                <Text style={[styles.prefsSectionTitle, { color: colors.text }]}>Allergens</Text>
                <Text style={[styles.prefsSectionSubtitle, { color: colors.secondaryText }]}>
                  We'll exclude recipes with these ingredients
                </Text>
                <View style={styles.prefsChipContainer}>
                  {allergenOptions.map((allergen) => {
                    const isSelected = preferences.allergies.includes(allergen.toLowerCase());
                    return (
                      <Pressable
                        key={allergen}
                        style={[
                          styles.prefsChip,
                          isSelected && styles.prefsChipSelected,
                        ]}
                        onPress={() => toggleAllergen(allergen)}>
                        <Text
                          style={[
                            styles.prefsChipText,
                            { color: isSelected ? '#fff' : colors.text },
                          ]}>
                          {allergen}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.prefsSection}>
                <Text style={[styles.prefsSectionTitle, { color: colors.text }]}>Diet</Text>
                <Text style={[styles.prefsSectionSubtitle, { color: colors.secondaryText }]}>
                  Show recipes matching your dietary preferences
                </Text>
                <View style={styles.prefsChipContainer}>
                  {dietOptions.map((diet) => {
                    const isSelected = preferences.diets.includes(diet.toLowerCase());
                    return (
                      <Pressable
                        key={diet}
                        style={[
                          styles.prefsChip,
                          isSelected && styles.prefsChipSelected,
                        ]}
                        onPress={() => toggleDiet(diet)}>
                        <Text
                          style={[
                            styles.prefsChipText,
                            { color: isSelected ? '#fff' : colors.text },
                          ]}>
                          {diet}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    display: 'none',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: getSafeHorizontalPadding(),
    paddingBottom: moderateScale(12),
  },
  greeting: {
    fontSize: scaleFontSize(12),
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonPressed: {
    opacity: 0.7,
  },
  settingsIcon: {
    fontSize: 20,
  },

  // Stats
  statsRow: {
    flexDirection: shouldStackVertically(300) ? 'column' : 'row',
    paddingHorizontal: getSafeHorizontalPadding(),
    gap: getResponsiveGap(8),
    marginBottom: moderateScale(12),
  },
  statCard: {
    flex: 1,
    minWidth: shouldStackVertically(300) ? '100%' : undefined,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: moderateScale(10),
    padding: moderateScale(8),
    alignItems: 'center',
  },
  statNumber: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: scaleFontSize(9),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Quick Add
  quickAddSection: {
    paddingHorizontal: getSafeHorizontalPadding(),
    marginBottom: moderateScale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
  },
  customAddButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  customAddText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickAddScroll: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  quickAddChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickAddChipAdded: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  quickAddChipPressed: {
    backgroundColor: 'rgba(226, 88, 34, 0.15)',
  },
  quickAddEmoji: {
    fontSize: 16,
  },
  quickAddName: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '700',
  },

  // Main Content
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    paddingHorizontal: getSafeHorizontalPadding(),
    paddingBottom: moderateScale(16),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Categories
  categoriesContainer: {
    gap: 8,
  },
  categorySection: {
    marginBottom: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  categoryHeaderPressed: {
    opacity: 0.8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 10,
  },
  categoryItems: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemEmoji: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmojiText: {
    fontSize: 18,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  itemQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expiryExpired: {
    backgroundColor: '#ef4444',
  },
  expiryUrgent: {
    backgroundColor: '#f97316',
  },
  expirySoon: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  expiryOk: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  expiryTextLight: {
    color: '#fff',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  removeIcon: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '300',
    marginTop: -2,
  },

  // Bottom CTA
  bottomCta: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  discoverButton: {
    backgroundColor: '#e25822',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  discoverButtonPressed: {
    backgroundColor: '#c2410c',
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalContentLarge: {
    maxHeight: getModalMaxHeight(),
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalAddButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#e25822',
  },
  modalAddButtonPressed: {
    backgroundColor: '#c2410c',
  },
  modalAddButtonDisabled: {
    opacity: 0.5,
  },
  modalAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Preferences
  prefsSection: {
    marginBottom: 24,
  },
  prefsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  prefsSectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  prefsChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prefsChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  prefsChipSelected: {
    backgroundColor: '#e25822',
    borderColor: '#e25822',
  },
  prefsChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
