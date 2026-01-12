import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultPantryItems } from '@/data/pantry';
import { PantryItem } from '@/lib/types';

type PantryState = {
  items: PantryItem[];
  addQuickItem: (name: string) => void;
  addItem: (name: string, expiresAt?: string) => void;
  updateItem: (id: string, updates: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  setItems: (items: PantryItem[]) => void;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      items: defaultPantryItems,
      addQuickItem: (name) =>
        set((state) => ({
          items: [
            {
              id: createId(),
              name,
            },
            ...state.items,
          ],
        })),
      addItem: (name, expiresAt) =>
        set((state) => ({
          items: [
            {
              id: createId(),
              name,
              expiresAt,
            },
            ...state.items,
          ],
        })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      setItems: (items) => set({ items }),
    }),
    {
      name: 'pantry-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
