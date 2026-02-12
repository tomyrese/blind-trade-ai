import { Card, CardRarity, RARITY_RANKS } from './cardData';
import { generateReward } from './cardData';

export interface FusionResult {
  reward: Card;
  highestSelectedRarity: CardRarity;
}

export const executeFusion = (selectedCards: Card[]): FusionResult | null => {
  if (!selectedCards || selectedCards.length === 0) return null;

  const reward = generateReward(selectedCards);

  const highestRank = Math.max(
    ...selectedCards.map(c => RARITY_RANKS[c.rarity] || 0)
  );

  const highestSelectedRarity =
    (Object.keys(RARITY_RANKS) as CardRarity[]).find(
      r => RARITY_RANKS[r] === highestRank
    ) || 'common';

  return {
    reward,
    highestSelectedRarity,
  };
};
