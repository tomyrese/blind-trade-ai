import { Market, Listing, PriceHistoryItem } from '../../domain/models/Market';
import { Asset } from '../../domain/models/Asset';
import { mockCards } from '../utils/cardData';

const generateListings = (currentPrice: number): Listing[] => {
  return [
    { 
      id: `l1-${Math.random()}`, 
      sellerId: 's1', 
      sellerName: 'Satoshi', 
      price: Math.floor(currentPrice * 0.98), 
      condition: 'M', 
      timestamp: new Date().toISOString() 
    },
    { 
      id: `l2-${Math.random()}`, 
      sellerId: 's2', 
      sellerName: 'Kasumi', 
      price: Math.floor(currentPrice * 1.02), 
      condition: 'NM', 
      timestamp: new Date().toISOString() 
    },
  ];
};

export const marketsApi = {
  fetchMarkets: async (): Promise<Market[]> => {
    // Artificial delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
    
    // Map mockCards to Market objects
    return mockCards.map(card => ({
      id: card.id,
      name: card.name,
      symbol: card.symbol || `PKM-${card.id}`, // Use existing symbol or generate
      currentPrice: card.value,
      priceChange24h: Math.random() * 10 - 5, // Random change between -5% and +5%
      priceChangePercentage24h: Math.random() * 10 - 5, 
      tcgPlayerPrice: card.tcgPlayerPrice,
      cardMarketPrice: card.cardMarketPrice,
      rarity: card.rarity,
      rarityLabel: card.rarityLabel || card.rarity.replace('_', ' ').toUpperCase(),
      marketCap: card.value * (Math.floor(Math.random() * 5000) + 100),
      volume24h: card.value * (Math.floor(Math.random() * 500) + 10),
      supply: Math.floor(Math.random() * 5000) + 100,
      image: card.image, // Pass the image!
      listings: generateListings(card.value),
      recentSales: [
        { id: `t1-${card.id}`, price: card.value, condition: 'M', type: 'buy', timestamp: new Date().toISOString(), buyerName: 'Red' },
      ],
      valuation: {
        score: Math.floor(Math.random() * 20) + 80,
        rating: 'Great',
        liquidity: 'Medium',
        aiAnalysis: `${card.name} is showing strong market performance.`,
      },
      listedAt: new Date().toISOString(),
      isTrending: card.isTrending, // Pass through isTrending
    }));
  },

  searchMarkets: async (query: string): Promise<Market[]> => {
    const all = await marketsApi.fetchMarkets();
    return all.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) || 
      m.symbol.toLowerCase().includes(query.toLowerCase())
    );
  },

  fetchMarket: async (symbol: string): Promise<Market | null> => {
    const all = await marketsApi.fetchMarkets();
    // Support finding by ID or Symbol
    const found = all.find(m => m.symbol === symbol || m.id === symbol);
    return found || null;
  },

  fetchPrice: async (symbol: string): Promise<number> => {
    const market = await marketsApi.fetchMarket(symbol);
    return market ? market.currentPrice : 0;
  }
};

export const assetsApi = {
  fetchAssets: async (): Promise<Asset[]> => {
    // Mock owned assets - linking to real items from mockCards[0] and [1]
    const card1 = mockCards[0];
    const card2 = mockCards[10]; // Pick another one
    
    return [
      { 
        id: card1.id, 
        name: card1.name, 
        amount: 1, 
        value: card1.value, 
        purchasePrice: Math.floor(card1.value * 0.9), 
        rarity: card1.rarity, 
        rarityLabel: card1.rarityLabel, 
        symbol: card1.symbol || `PKM-${card1.id}`,
        image: card1.image 
      },
      { 
        id: card2.id, 
        name: card2.name, 
        amount: 2, 
        value: card2.value, 
        purchasePrice: Math.floor(card2.value * 1.1), 
        rarity: card2.rarity, 
        rarityLabel: card2.rarityLabel, 
        symbol: card2.symbol || `PKM-${card2.id}`,
        image: card2.image
      },
    ];
  },
  
  addAsset: async (asset: Asset): Promise<void> => {
    // Mock implementation
    return Promise.resolve();
  },

  updateAsset: async (symbol: string, updates: Partial<Asset>): Promise<void> => {
    // Mock implementation
    return Promise.resolve();
  }
};

export const trendingApi = {
  fetchTrending: async (): Promise<Market[]> => {
    const all = await marketsApi.fetchMarkets();
    return all.filter(m => m.isTrending);
  }
};
