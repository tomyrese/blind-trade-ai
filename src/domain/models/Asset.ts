export interface Asset {
  id: string;
  name: string;
  symbol: string; // e.g., "PKM-025"
  rarity: string;
  rarityLabel?: string;
  amount: number;
  value: number; // Current market value in VND
  purchasePrice: number; // Price at which it was acquired
  image?: any;
}
