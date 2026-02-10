// Domain Layer - Use Case
import { Market } from '../../models/Market';
import { MarketRepository } from '../../repositories/MarketRepository';

export class GetMarketsUseCase {
  constructor(private marketRepository: MarketRepository) {}

  async execute(): Promise<Market[]> {
    try {
      const markets = await this.marketRepository.getMarkets();
      
      // Business logic: Sort by market cap (highest first)
      return markets.sort((a, b) => b.marketCap - a.marketCap);
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw new Error('Failed to fetch markets');
    }
  }
}

export class GetMarketBySymbolUseCase {
  constructor(private marketRepository: MarketRepository) {}

  async execute(symbol: string): Promise<Market | null> {
    if (!symbol || symbol.trim() === '') {
      throw new Error('Symbol is required');
    }

    return await this.marketRepository.getMarketBySymbol(symbol.toUpperCase());
  }
}
