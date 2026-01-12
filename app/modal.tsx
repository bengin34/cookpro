import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, ScrollView } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { parseRecipeFromUrl } from '@/lib/recipeImport';
import { useCookbookStore } from '@/store/cookbookStore';
import { useUserStore } from '@/store/userStore';

export default function RecipeImportScreen() {
  const [url, setUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const { addRecipe, toggleFavorite } = useCookbookStore();
  const { incrementImportedRecipes } = useUserStore();

  const mutation = useMutation({
    mutationFn: parseRecipeFromUrl,
  });
  const result = mutation.data;

  const handleSaveRecipe = () => {
    if (!result?.recipe) return;

    const tags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    addRecipe(result.recipe, tags, notesInput || undefined);
    incrementImportedRecipes();

    setSavedMessage(`"${result.recipe.title}" kaydedildi!`);
    setTimeout(() => setSavedMessage(''), 3000);

    setUrl('');
    setTagInput('');
    setNotesInput('');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Recipe Import</Text>
        <Text style={styles.subtitle}>URL yapistir</Text>

        <GlassCard>
          <Text style={styles.cardTitle}>Kaynak URL</Text>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://"
            placeholderTextColor="#9a8f83"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Pressable
            style={[styles.primaryButton, !url && styles.primaryButtonDisabled]}
            onPress={() => mutation.mutate(url)}
            disabled={!url || mutation.isPending}>
            <Text style={styles.primaryButtonText}>
              {mutation.isPending ? 'Parse ediliyor...' : 'Tarifi getir'}
            </Text>
          </Pressable>
          <Text style={styles.cardBody}>Schema.org yoksa hizli manual duzeltme.</Text>
        </GlassCard>

        {result?.message ? (
          <GlassCard>
            <Text style={styles.cardTitle}>Durum</Text>
            <Text style={styles.cardBody}>{result.message}</Text>
          </GlassCard>
        ) : null}

        {savedMessage ? (
          <GlassCard>
            <Text style={[styles.cardBody, { color: '#059669', fontWeight: '600' }]}>
              ✓ {savedMessage}
            </Text>
          </GlassCard>
        ) : null}

        {result?.recipe ? (
          <GlassCard>
            <Text style={styles.cardTitle}>Tarif Onizleme</Text>
            <Text style={styles.cardBody}>{result.recipe.title}</Text>
            <Text style={styles.cardBody}>
              Porsiyon {result.recipe.servings ?? '--'} • {result.recipe.totalTimeMinutes ?? '--'} dk
            </Text>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Malzemeler</Text>
              {result.recipe.ingredients.map((ingredient) => (
                <Text key={ingredient.name} style={styles.cardBody}>
                  {ingredient.name}
                  {ingredient.quantity ? ` • ${ingredient.quantity}` : ''}
                  {ingredient.unit ? ` ${ingredient.unit}` : ''}
                </Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adimlar</Text>
              {result.recipe.instructions.map((step, index) => (
                <Text key={step} style={styles.cardBody}>
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
            {result.status === 'needs_manual' ? (
              <Text style={styles.cardBody}>Manuel duzenleme gerekli (placeholder).</Text>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Etiketler (virgule separe)</Text>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="orneg: kolay, hizli, vegetaryen"
                placeholderTextColor="#9a8f83"
                style={styles.input}
                multiline
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notlar</Text>
              <TextInput
                value={notesInput}
                onChangeText={setNotesInput}
                placeholder="Bu tarif hakkinda notlariniz..."
                placeholderTextColor="#9a8f83"
                style={[styles.input, styles.multilineInput]}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.primaryButton, styles.saveButton]}
                onPress={handleSaveRecipe}>
                <Text style={styles.primaryButtonText}>Kaydet & Ekle</Text>
              </Pressable>
            </View>
          </GlassCard>
        ) : null}
      </ScrollView>
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
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#2c221a',
    backgroundColor: 'rgba(255,255,255,0.6)',
    fontFamily: 'SpaceMono',
    marginVertical: 6,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#c2410c',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  saveButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  section: {
    gap: 6,
    marginVertical: 10,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  buttonGroup: {
    marginTop: 12,
  },
});
