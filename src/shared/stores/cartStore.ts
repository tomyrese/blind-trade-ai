// Shopping Cart Store using Zustand
import { create } from 'zustand';
import { Card } from '../utils/cardData';

interface CartItem {
  card: Card;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (card: Card) => void;
  removeFromCart: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  clearCart: () => void;
  purchase: () => Promise<boolean>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addToCart: (card: Card) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.card.id === card.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.card.id === card.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { card, quantity: 1 }] };
    });
  },

  removeFromCart: (cardId: string) => {
    const item = get().items.find((item) => item.card.id === cardId);
    set((state) => ({
      items: state.items.filter((item) => item.card.id !== cardId),
    }));
    return item; // Return removed item for notification
  },

  clearCart: () => set({ items: [] }),

  updateQuantity: (cardId: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.card.id === cardId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },

  purchase: async () => {
    const items = get().items;
    const total = get().totalPrice();
    
    if (items.length === 0) {
      return false;
    }

    // Simulate API call
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
    
    // Clear cart after successful purchase
    set({ items: [] });
    return true;
  },

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  totalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.card.value * item.quantity, 0);
  },
}));
