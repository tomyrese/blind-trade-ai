// Mock Order Data for Pokemon Theme
import { formatVND } from './formatters';

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export const generateMockOrderBook = (basePrice: number): OrderBook => {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  for (let i = 0; i < 10; i++) {
    const price = basePrice - (i + 1) * 1000;
    const quantity = Math.floor(Math.random() * 5) + 1;
    bids.push({
      price,
      quantity,
      total: price * quantity,
    });
  }

  for (let i = 0; i < 10; i++) {
    const price = basePrice + (i + 1) * 1000;
    const quantity = Math.floor(Math.random() * 5) + 1;
    asks.push({
      price,
      quantity,
      total: price * quantity,
    });
  }

  return { bids, asks };
};

export interface MarketOrder {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  price: number;
  quantity: number;
  total: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
}

export const mockMarketOrders: MarketOrder[] = [
  {
    id: '1',
    type: 'buy',
    symbol: 'PKM-025',
    price: 50000,
    quantity: 1,
    total: 50000,
    status: 'filled',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    type: 'sell',
    symbol: 'PKM-006',
    price: 15000000,
    quantity: 1,
    total: 15000000,
    status: 'filled',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    type: 'buy',
    symbol: 'PKM-150',
    price: 5000000,
    quantity: 1,
    total: 5000000,
    status: 'pending',
    timestamp: new Date(Date.now() - 1800000),
  },
];
