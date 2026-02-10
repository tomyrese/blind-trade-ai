// Domain Layer - Repository Interface
import { Market, MarketTrend } from '../models/Market';

export interface MarketRepository {
  /**
   * Fetches a list of all available markets
   */
  getMarkets(): Promise<Market[]>;

  /**
   * Fetches a specific market by symbol
   * @param symbol - Market symbol (e.g., 'BTC/USD')
   */
  getMarketBySymbol(symbol: string): Promise<Market | null>;

  /**
   * Fetches market trend data for a specific period
   * @param symbol - Market symbol
   * @param period - Time period (e.g., '1h', '24h', '7d')
   */
  getMarketTrend(symbol: string, period: string): Promise<MarketTrend>;

  /**
   * Subscribes to real-time market updates
   * @param symbol - Market symbol
   * @param callback - Function to call when market data updates
   */
  subscribeToMarket(symbol: string, callback: (market: Market) => void): () => void;
}
