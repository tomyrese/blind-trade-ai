// Data Layer - Repository Implementation
import { Market, MarketTrend } from '../../domain/models/Market';
import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { MockMarketDataSource } from '../datasources/mock/MockMarketDataSource';

export class MarketRepositoryImpl implements MarketRepository {
  constructor(private dataSource: MockMarketDataSource) {}

  async getMarkets(): Promise<Market[]> {
    return await this.dataSource.getMarkets();
  }

  async getMarketBySymbol(symbol: string): Promise<Market | null> {
    return await this.dataSource.getMarketBySymbol(symbol);
  }

  async getMarketTrend(symbol: string, period: string): Promise<MarketTrend> {
    return await this.dataSource.getMarketTrend(symbol, period);
  }

  subscribeToMarket(symbol: string, callback: (market: Market) => void): () => void {
    // Mock implementation - in production, this would use WebSocket
    const interval = setInterval(async () => {
      const market = await this.dataSource.getMarketBySymbol(symbol);
      if (market) {
        callback(market);
      }
    }, 5000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}
