import { Market, Listing, PriceHistoryItem } from '../../domain/models/Market';
import { Asset } from '../../domain/models/Asset';

const MOCK_LISTINGS: Record<string, Listing[]> = {
  '1': [
    { id: 'l1', sellerId: 's1', sellerName: 'Satoshi', price: 2500000, condition: 'M', timestamp: '2024-02-09T10:00:00Z' },
    { id: 'l2', sellerId: 's2', sellerName: 'Kasumi', price: 2450000, condition: 'NM', timestamp: '2024-02-09T11:00:00Z' },
  ],
  // Add more mock listings as needed
};

export const marketsApi = {
  fetchMarkets: async (): Promise<Market[]> => {
    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      // --- SECRET RARE (Rose Border) ---
      {
        id: '1',
        name: 'Pikachu VMAX (Rainbow)',
        symbol: 'PKU-VMAX-RB',
        currentPrice: 5500000,
        priceChange24h: 12.5,
        tcgPlayerPrice: 5600000,
        cardMarketPrice: 5400000,
        rarity: 'secret_rare',
        rarityLabel: 'Secret Rare',
        marketCap: 550000000,
        volume24h: 12000000,
        supply: 100,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-10T09:00:00Z',
      },
      // --- SHINY RARE (Cyan Border) ---
      {
        id: '2',
        name: 'Charizard GX (Shiny)',
        symbol: 'CRZ-GX-SH',
        currentPrice: 8500000,
        priceChange24h: 5.2,
        tcgPlayerPrice: 8800000,
        cardMarketPrice: 8200000,
        rarity: 'secret_rare',
        rarityLabel: 'Shiny Rare',
        marketCap: 850000000,
        volume24h: 15000000,
        supply: 80,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-09T15:30:00Z',
      },
      // --- LEGENDARY (Gold Border) ---
      {
        id: '3',
        name: 'Lugia V (Alt Art)',
        symbol: 'LU-V-ALT',
        currentPrice: 4200000,
        priceChange24h: 8.4,
        tcgPlayerPrice: 4350000,
        cardMarketPrice: 4100000,
        rarity: 'special_illustration_rare',
        rarityLabel: 'Alt Art',
        marketCap: 420000000,
        volume24h: 9000000,
        supply: 150,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-08T10:15:00Z',
      },
      {
        id: '4',
        name: 'Moonbreon (Umbreon VMAX)',
        symbol: 'UMB-VMAX-ALT',
        currentPrice: 12500000,
        priceChange24h: 15.3,
        tcgPlayerPrice: 13000000,
        cardMarketPrice: 12000000,
        rarity: 'special_illustration_rare',
        rarityLabel: 'Secret Rare',
        marketCap: 1250000000,
        volume24h: 25000000,
        supply: 50,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-10T08:00:00Z', // Newest
      },
      {
        id: '5',
        name: 'Giratina V (Lost Origin)',
        symbol: 'GIR-V-ALT',
        currentPrice: 6800000,
        priceChange24h: -2.1,
        tcgPlayerPrice: 7000000,
        cardMarketPrice: 6600000,
        rarity: 'special_illustration_rare',
        rarityLabel: 'Alt Art',
        marketCap: 680000000,
        volume24h: 11000000,
        supply: 90,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-05T14:20:00Z',
      },

      // --- HYPER RARE (Rainbow/Pink Border) ---
      {
        id: '6',
        name: 'Mewtwo VSTAR (Rainbow)',
        symbol: 'MEW-VSTAR-RB',
        currentPrice: 2800000,
        priceChange24h: 3.2,
        tcgPlayerPrice: 2900000,
        cardMarketPrice: 2750000,
        rarity: 'secret_rare',
        rarityLabel: 'Hyper Rare',
        marketCap: 280000000,
        volume24h: 5000000,
        supply: 300,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-07T11:45:00Z',
      },
      // --- ILLUSTRATION RARE (Orange Border) ---
      {
        id: '7',
        name: 'Koraidon ex (Art)',
        symbol: 'KOR-EX-ART',
        currentPrice: 1200000,
        priceChange24h: 4.5,
        tcgPlayerPrice: 1300000,
        cardMarketPrice: 1100000,
        rarity: 'illustration_rare',
        rarityLabel: 'Illustration Rare',
        marketCap: 120000000,
        volume24h: 6000000,
        supply: 250,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-06T09:30:00Z',
      },
      // --- SPECIAL ILLUSTRATION RARE (Violet Border) ---
      {
        id: '8',
        name: 'Iono (Trainer)',
        symbol: 'ION-SIR',
        currentPrice: 3500000,
        priceChange24h: 15.5,
        tcgPlayerPrice: 3600000,
        cardMarketPrice: 3450000,
        rarity: 'special_illustration_rare',
        rarityLabel: 'Special Illustration Rare',
        marketCap: 350000000,
        volume24h: 8000000,
        supply: 150,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-02-10T08:30:00Z',
      },
      // --- CLASSIC COLLECTION (Indigo Border) ---
      {
        id: '9',
        name: 'Charizard (Classic)',
        symbol: 'CRZ-CLS',
        currentPrice: 4500000,
        priceChange24h: 1.8,
        tcgPlayerPrice: 4600000,
        cardMarketPrice: 4400000,
        rarity: 'illustration_rare',
        rarityLabel: 'Classic Collection',
        marketCap: 450000000,
        volume24h: 4500000,
        supply: 200,
        listings: MOCK_LISTINGS['1'],
        listedAt: '2024-01-20T16:00:00Z', // Oldest
      },
      // --- EPIC TIER (Purple Border) ---
      {
        id: '10',
        name: 'Lucario VSTAR',
        symbol: 'LUC-VSTAR',
        currentPrice: 1200000,
        priceChange24h: 6.7,
        tcgPlayerPrice: 1300000,
        cardMarketPrice: 1150000,
        rarity: 'ultra_rare',
        rarityLabel: 'VSTAR Rare',
        marketCap: 120000000,
        volume24h: 3500000,
        supply: 500,
        listings: MOCK_LISTINGS['1'],
      },

      // --- RARE TIER (Blue Border) ---
      {
        id: '11',
        name: 'Gyarados (Holo)',
        symbol: 'GYR-HOLO',
        currentPrice: 850000,
        priceChange24h: 2.1,
        tcgPlayerPrice: 900000,
        cardMarketPrice: 820000,
        rarity: 'rare',
        rarityLabel: 'Holo Rare',
        marketCap: 85000000,
        volume24h: 2000000,
        supply: 1000,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '12',
        name: 'Dragonite (Holo)',
        symbol: 'DRA-HOLO',
        currentPrice: 920000,
        priceChange24h: 1.5,
        tcgPlayerPrice: 950000,
        cardMarketPrice: 900000,
        rarity: 'rare',
        rarityLabel: 'Holo Rare',
        marketCap: 92000000,
        volume24h: 2200000,
        supply: 900,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '13',
        name: 'Snorlax (Reverse Holo)',
        symbol: 'SNO-REV',
        currentPrice: 450000,
        priceChange24h: -0.5,
        tcgPlayerPrice: 480000,
        cardMarketPrice: 430000,
        rarity: 'rare',
        rarityLabel: 'Reverse Holo',
        marketCap: 45000000,
        volume24h: 1500000,
        supply: 2000,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '14',
        name: 'Eevee (Promo)',
        symbol: 'EEV-PRO',
        currentPrice: 650000,
        priceChange24h: 4.2,
        tcgPlayerPrice: 700000,
        cardMarketPrice: 620000,
        rarity: 'rare',
        rarityLabel: 'Black Star Promo',
        marketCap: 65000000,
        volume24h: 1800000,
        supply: 1500,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '15',
        name: 'Mimikyu (Rare)',
        symbol: 'MIM-RARE',
        currentPrice: 550000,
        priceChange24h: 3.1,
        tcgPlayerPrice: 580000,
        cardMarketPrice: 530000,
        rarity: 'rare',
        rarityLabel: 'Rare',
        marketCap: 55000000,
        volume24h: 1600000,
        supply: 1800,
        listings: MOCK_LISTINGS['1'],
      },

      // --- COMMON TIER (Grey Border) ---
      {
        id: '16',
        name: 'Pikachu (Common)',
        symbol: 'PIK-COM',
        currentPrice: 150000,
        priceChange24h: 1.1,
        tcgPlayerPrice: 160000,
        cardMarketPrice: 145000,
        rarity: 'common',
        rarityLabel: 'Common',
        marketCap: 15000000,
        volume24h: 800000,
        supply: 5000,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '17',
        name: 'Charmander',
        symbol: 'CHA-COM',
        currentPrice: 120000,
        priceChange24h: 0.5,
        tcgPlayerPrice: 130000,
        cardMarketPrice: 115000,
        rarity: 'common',
        rarityLabel: 'Common',
        marketCap: 12000000,
        volume24h: 750000,
        supply: 5500,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '18',
        name: 'Squirtle',
        symbol: 'SQU-COM',
        currentPrice: 115000,
        priceChange24h: 0.8,
        tcgPlayerPrice: 125000,
        cardMarketPrice: 110000,
        rarity: 'common',
        rarityLabel: 'Common',
        marketCap: 11500000,
        volume24h: 700000,
        supply: 5600,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '19',
        name: 'Bulbasaur',
        symbol: 'BUL-COM',
        currentPrice: 110000,
        priceChange24h: 0.6,
        tcgPlayerPrice: 120000,
        cardMarketPrice: 105000,
        rarity: 'common',
        rarityLabel: 'Common',
        marketCap: 11000000,
        volume24h: 680000,
        supply: 5700,
        listings: MOCK_LISTINGS['1'],
      },
      {
        id: '20',
        name: 'Magikarp',
        symbol: 'MAG-COM',
        currentPrice: 50000,
        priceChange24h: 10.5, // Meme potential
        tcgPlayerPrice: 55000,
        cardMarketPrice: 48000,
        rarity: 'common',
        rarityLabel: 'Common',
        marketCap: 5000000,
        volume24h: 1000000,
        supply: 10000,
        listings: MOCK_LISTINGS['1'],
      },
    ];
  },

  searchMarkets: async (query: string): Promise<Market[]> => {
    const all = await marketsApi.fetchMarkets();
    return all.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) || 
      m.symbol.toLowerCase().includes(query.toLowerCase())
    );
  },

  fetchMarket: async (symbol: string): Promise<Market> => {
    const all = await marketsApi.fetchMarkets();
    const found = all.find(m => m.symbol === symbol);
    if (!found) throw new Error('Market not found');
    return found;
  }
};

export const assetsApi = {
  fetchAssets: async (): Promise<Asset[]> => {
    return [
      { id: '1', name: 'Pikachu VMAX (Rainbow)', amount: 1, value: 5500000, rarity: 'secret', rarityLabel: 'Secret Rare', symbol: 'PKU-VMAX-RB' },
      { id: '11', name: 'Gyarados (Holo)', amount: 2, value: 1700000, rarity: 'rare', rarityLabel: 'Holo Rare', symbol: 'GYR-HOLO' },
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
