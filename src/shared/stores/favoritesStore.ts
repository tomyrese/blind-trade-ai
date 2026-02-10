// Favorites Store using Zustand
import { create } from 'zustand';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (cardId: string) => void;
  isFavorite: (cardId: string) => boolean;
  getFavoritesCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],

  toggleFavorite: (cardId: string) => {
    set((state) => {
      const isFav = state.favoriteIds.includes(cardId);
      if (isFav) {
        return { favoriteIds: state.favoriteIds.filter((id) => id !== cardId) };
      }
      return { favoriteIds: [...state.favoriteIds, cardId] };
    });
  },

  isFavorite: (cardId: string) => {
    return get().favoriteIds.includes(cardId);
  },

  getFavoritesCount: () => {
    return get().favoriteIds.length;
  },
}));
