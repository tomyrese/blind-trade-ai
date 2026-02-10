export type VipType = 'none' | 'monthly' | 'yearly' | 'lifetime';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL or ID of the avatar asset
  
  // Progress
  level: number;
  currentExp: number;
  nextLevelExp: number;
  
  // Stats
  collectionCount: number;
  pokedexProgress: number; // Percentage 0-100
  rank: string; // e.g., 'Rookie', 'Trainer', 'Gym Leader', 'Champion', 'Master'
  
  // VIP Status
  isVip: boolean;
  vipType: VipType;
  vipExpiry?: Date;
  
  // Settings
  notificationsEnabled: boolean;
  currency: 'VND' | 'USD';
}

export const MOCK_USER: UserProfile = {
  id: 'u1',
  name: 'Red Trainer',
  email: 'master.red@pallettown.vn',
  avatar: 'default_red',
  
  level: 42,
  currentExp: 3450,
  nextLevelExp: 5000,
  
  collectionCount: 128,
  pokedexProgress: 94,
  rank: 'Master',
  
  isVip: false,
  vipType: 'none',
  
  notificationsEnabled: true,
  currency: 'VND',
};
