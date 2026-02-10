// Orders Store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../storage/mmkv';

export interface Order {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  price: number;
  quantity: number;
  total: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

interface OrdersState {
  orders: Order[];
  pendingOrders: Order[];

  // Actions
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => void;
  clearOrders: () => void;
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      pendingOrders: [],

      addOrder: (orderData) => {
        const order: Order = {
          ...orderData,
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        set((state) => ({
          orders: [order, ...state.orders],
          pendingOrders:
            order.status === 'pending'
              ? [order, ...state.pendingOrders]
              : state.pendingOrders,
        }));
      },

      updateOrderStatus: (orderId, status) =>
        set((state) => {
          const updatedOrders = state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          );

          const pendingOrders = updatedOrders.filter((o) => o.status === 'pending');

          return { orders: updatedOrders, pendingOrders };
        }),

      cancelOrder: (orderId) =>
        set((state) => {
          const updatedOrders = state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' as const } : o
          );

          const pendingOrders = updatedOrders.filter((o) => o.status === 'pending');

          return { orders: updatedOrders, pendingOrders };
        }),

      clearOrders: () => set({ orders: [], pendingOrders: [] }),

      getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => createMMKVStorage()),
    }
  )
);

// Selectors
export const useAllOrders = () => useOrdersStore((state) => state.orders);
export const usePendingOrders = () => useOrdersStore((state) => state.pendingOrders);
export const useOrdersBySymbol = (symbol: string) =>
  useOrdersStore((state) => state.orders.filter((o) => o.symbol === symbol));
export const useRecentOrders = (limit: number = 10) =>
  useOrdersStore((state) => state.orders.slice(0, limit));
