import { CardRarity, Listing, Card, RarityConfigItem } from './cardTypes';
import { allCards } from './allCards';

export type { CardRarity, Listing, Card, RarityConfigItem };

export const RARITY_COLORS: Record<CardRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  rare_holo: '#8B5CF6',
  rare_holo_ex: '#6366F1',
  rare_holo_gx: '#EC4899',
  rare_holo_v: '#F43F5E',
  rare_holo_vmax: '#A855F7',
  rare_holo_vstar: '#EAB308',
  rare_rainbow: '#D946EF',
  rare_secret: '#EAB308',
  promo: '#06B6D4',
};

export const RARITY_RANKS: Record<CardRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  rare_holo: 4,
  rare_holo_ex: 5,
  rare_holo_gx: 6,
  rare_holo_v: 7,
  rare_holo_vmax: 8,
  rare_holo_vstar: 8,
  rare_rainbow: 9,
  rare_secret: 10,
  promo: 0,
};

export const RARITY_CONFIGS: Record<CardRarity, RarityConfigItem> = {
  common: {
    label: 'Common',
    symbol: 'C',
    shape: 'circle',
    color: '#9CA3AF',
    borderColor: '#D1D5DB',
    glowColor: 'rgba(156, 163, 175, 0.1)',
  },
  uncommon: {
    label: 'Uncommon',
    symbol: 'U',
    shape: 'diamond',
    color: '#10B981',
    borderColor: '#34D399',
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  rare: {
    label: 'Rare',
    symbol: 'R',
    shape: 'star',
    starCount: 1,
    color: '#3B82F6',
    borderColor: '#60A5FA',
    glowColor: 'rgba(59, 130, 246, 0.2)',
  },
  rare_holo: {
    label: 'Rare Holo',
    symbol: 'H',
    shape: 'sparkles',
    color: '#8B5CF6',
    borderColor: '#A78BFA',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    isHolo: true,
  },
  rare_holo_ex: {
    label: 'Rare Holo EX',
    symbol: 'EX',
    shape: 'star',
    starCount: 2,
    color: '#6366F1',
    borderColor: '#818CF8',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    isHolo: true,
  },
  rare_holo_gx: {
    label: 'Rare Holo GX',
    symbol: 'GX',
    shape: 'star',
    starCount: 2,
    color: '#EC4899',
    borderColor: '#F472B6',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    isHolo: true,
  },
  rare_holo_v: {
    label: 'Rare Holo V',
    symbol: 'V',
    shape: 'star',
    starCount: 2,
    color: '#F43F5E',
    borderColor: '#FB7185',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    isHolo: true,
  },
  rare_holo_vmax: {
    label: 'Rare Holo VMAX',
    symbol: 'VMAX',
    shape: 'star',
    starCount: 3,
    color: '#A855F7',
    borderColor: '#C084FC',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    isHolo: true,
    isFullArt: true,
  },
  rare_holo_vstar: {
    label: 'Rare Holo VSTAR',
    symbol: 'VSTAR',
    shape: 'star',
    starCount: 3,
    color: '#EAB308',
    borderColor: '#FACC15',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    isHolo: true,
    isFullArt: true,
  },
  rare_rainbow: {
    label: 'Rare Rainbow',
    symbol: 'RB',
    shape: 'star',
    starCount: 3,
    color: '#D946EF',
    borderColor: '#E879F9',
    borderGradient: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'], // Rainbow Gradient
    glowColor: 'rgba(217, 70, 239, 0.35)',
    isHolo: true,
    isFullArt: true,
  },
  rare_secret: {
    label: 'Secret Rare',
    symbol: 'SR',
    shape: 'gem',
    color: '#EAB308',
    borderColor: '#FACC15',
    borderGradient: ['#fcd34d', '#f59e0b', '#b45309', '#f59e0b', '#fcd34d'], // Gold Gradient
    glowColor: 'rgba(234, 179, 8, 0.4)',
    isHolo: true,
    isFullArt: true,
  },
  promo: {
    label: 'Promo',
    symbol: 'P',
    shape: 'crown',
    color: '#06B6D4',
    borderColor: '#22D3EE',
    glowColor: 'rgba(6, 182, 212, 0.25)',
  },
};

// Helper to get image or fallback
const getCardImage = (rarity: string, name: string) => {
    return null;
};

export const mockCards: Card[] = allCards;
export interface fusionOdds {
  upgrade: number;
  same: number;
  downgrade: number;
}

export const getFusionProbabilities = (cards: Card[]): fusionOdds => {
  if (cards.length === 0) return { upgrade: 0, same: 0, downgrade: 0 };

  const highestRank = Math.max(...cards.map(c => RARITY_RANKS[mapRarity(c.rarity, c.name)] || 0));

  if (highestRank <= 2) { // Common, Uncommon
    return { upgrade: 0.40, same: 0.45, downgrade: 0.15 };
  } else if (highestRank <= 4) { // Rare, Holo
    return { upgrade: 0.25, same: 0.50, downgrade: 0.25 };
  } else if (highestRank <= 7) { // EX, GX, V
    return { upgrade: 0.10, same: 0.50, downgrade: 0.40 };
  } else { // Rainbow, Secret
    return { upgrade: 0.02, same: 0.38, downgrade: 0.60 };
  }
};

export const generateReward = (selectedCards: Card[]): Card => {
  const totalValue = selectedCards.reduce((sum, c) => sum + c.value, 0);
  const odds = getFusionProbabilities(selectedCards);
  const roll = Math.random();

  const ranks = Object.keys(RARITY_RANKS) as CardRarity[];
  const highestRank = Math.max(...selectedCards.map(c => RARITY_RANKS[mapRarity(c.rarity, c.name)] || 0));

  let targetRarity: CardRarity = 'common';
  let multiplier = 1.0;

  if (roll <= odds.upgrade) {
    const targetRank = Math.min(9, highestRank + (Math.random() > 0.8 ? 2 : 1));
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'rare';
    multiplier = 1.5 + (Math.random() * 1.5);
  } else if (roll <= odds.upgrade + odds.same) {
    targetRarity = ranks.find(r => RARITY_RANKS[r] === highestRank) || 'common';
    multiplier = 0.9 + (Math.random() * 0.4);
  } else {
    const targetRank = Math.max(1, highestRank - 1);
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'common';
    multiplier = 0.4 + (Math.random() * 0.4);
  }

  const rewardValue = Math.floor(totalValue * multiplier);

  // Find all matching cards for the target rarity
  const matchingCards = normalizedCards.filter(c => c.rarity === targetRarity);

  // Pick one specific source card to base the reward on
  const sourceCard = matchingCards.length > 0
    ? matchingCards[Math.floor(Math.random() * matchingCards.length)]
    : normalizedCards[0]; // Fallback

  const name = sourceCard.name;
  const image = sourceCard.image;

  return {
    id: `fusion-${sourceCard.id}-${targetRarity}`,
    name: `${name} (Fusion)`,
    rarity: targetRarity,
    value: rewardValue,
    tcgPlayerPrice: Math.floor(rewardValue * 1.1),
    cardMarketPrice: Math.floor(rewardValue * 0.95),
    image: image,
    symbol: sourceCard.symbol || `PKM-${sourceCard.id}`,
  };
};

const LEGENDARY_NAMES = [
  'Arceus', 'Kyogre', 'Groudon', 'Rayquaza', 'Dialga', 'Palkia', 'Giratina',
  'Entei', 'Raikou', 'Suicune', 'Lugia', 'Ho-oh', 'Celebi', 'Mewtwo', 'Mew',
  'Articuno', 'Zapdos', 'Moltres', 'Latias', 'Latios', 'Deoxys', 'Jirachi',
  'Regirock', 'Regice', 'Registeel', 'Regigigas', 'Darkrai', 'Cresselia',
  'Manaphy', 'Phione', 'Shaymin', 'Victini', 'Cobalion', 'Terrakion', 'Virizion',
  'Keldeo', 'Reshiram', 'Zekrom', 'Kyurem', 'Xerneas', 'Yveltal', 'Zygarde',
  'Diancie', 'Hoopa', 'Volcanion', 'Tapu Koko', 'Tapu Lele', 'Tapu Bulu', 'Tapu Fini',
  'Solgaleo', 'Lunala', 'Nihilego', 'Buzzwole', 'Pheromosa', 'Xurkitree', 'Celesteela',
  'Kartana', 'Guzzlord', 'Necrozma', 'Magearna', 'Marshadow', 'Zeraora', 'Meltan', 'Melmetal',
  'Zacian', 'Zamazenta', 'Eternatus', 'Kubfu', 'Urshifu', 'Zarude', 'Regieleki', 'Regidrago',
  'Glastrier', 'Spectrier', 'Calyrex', 'Enamorus', 'Koraidon', 'Miraidon'
];

export const mapRarity = (rarity: string | undefined, name?: string): CardRarity => {
  const r = (rarity || 'common').toLowerCase();
  const n = (name || '').toLowerCase();

  // Helper for word-boundary matching
  const has = (keyword: string) => new RegExp(`\\b${keyword}\\b`, 'i').test(n);

  // 1. Extreme Rarities / Special Keywords (Highest Priority)
  if (n.includes('rainbow') || n.includes('hyper') || has('rainbow') || has('hyper')) return 'rare_rainbow';
  if (n.includes('secret') || has('secret') || n.includes('(gold)') || n.includes('shiny')) return 'rare_secret';
  
  // 2. Modern Ultra Rares
  if (has('vmax')) return 'rare_holo_vmax';
  if (has('vstar')) return 'rare_holo_vstar';
  if (has('v') && !has('vmax') && !has('vstar')) return 'rare_holo_v';
  
  // 3. Iconic Legacy Ultra Rares
  if (has('gx')) return 'rare_holo_gx';
  if (has('ex') || has('mega') || has('primal') || n.includes('-ex')) {
     return 'rare_holo_ex';
  }
  
  if (has('break')) return 'rare_holo_ex';
  if (n.includes('tag team')) return 'rare_holo_gx';

  // 4. Legendary Check - Legendaries are at least rare_holo
  if (LEGENDARY_NAMES.some(legend => n.includes(legend.toLowerCase()))) {
    return 'rare_holo';
  }

  // 5. Modern TCG terminology (Illustration Rares, etc.)
  if (n.includes('illustration rare') || n.includes('special illustration') || n.includes('trainer gallery')) {
    return 'rare_holo_ex'; // Usually high value / holo
  }
  if (has('radiant')) return 'rare_holo';
  if (has('ultra') && has('rare')) return 'rare_holo_ex';
  if (has('double') && has('rare')) return 'rare_holo_ex';

  // 6. Other types
  if (has('promo') || n.includes('(promo)')) return 'promo';
  if (has('holo')) return 'rare_holo';
  
  // 7. Explicit check for 'rare' in name or data
  if (has('rare') || r.includes('rare')) {
    if (r.includes('holo')) return 'rare_holo';
    return 'rare';
  }

  // 8. Base Rarity Validation
  const validRarities: CardRarity[] = [
    'common', 'uncommon', 'rare', 'rare_holo',
    'rare_holo_ex', 'rare_holo_gx',
    'rare_holo_v', 'rare_holo_vmax', 'rare_holo_vstar',
    'rare_rainbow', 'rare_secret', 'promo'
  ];

  if (validRarities.includes(r as CardRarity)) {
    return r as CardRarity;
  }

  if (r.includes('uncommon')) return 'uncommon';

  return 'common';
};

// Pre-normalized cards for consistent use across the app
export const normalizedCards: Card[] = allCards.map(c => ({
  ...c,
  rarity: mapRarity(c.rarity, c.name)
}));

