export type VipType = 'none' | 'monthly' | 'yearly' | 'lifetime';

export interface Title {
  id: string;
  name: string; // This will now be a translation key
  description: string; // Translation key
  condition: string; // Translation key
  color: string;
}

export const AVAILABLE_TITLES: Title[] = [
  { id: 'rookie', name: 'title_rookie', description: 'desc_rookie', condition: 'cond_rookie', color: '#e2e8f0' },
  { id: 'collector', name: 'title_collector', description: 'desc_collector', condition: 'cond_collector', color: '#3b82f6' },
  { id: 'pro_trader', name: 'title_pro_trader', description: 'desc_pro_trader', condition: 'cond_pro_trader', color: '#10b981' },
  { id: 'elite', name: 'title_elite', description: 'desc_elite', condition: 'cond_elite', color: '#8b5cf6' },
  { id: 'champion', name: 'title_champion', description: 'desc_champion', condition: 'cond_champion', color: '#f59e0b' },
  { id: 'vip_member', name: 'title_vip_member', description: 'desc_vip_member', condition: 'cond_vip_member', color: '#fcd34d' },
  { id: 'legendary', name: 'title_legendary', description: 'desc_legendary', condition: 'cond_legendary', color: '#ec4899' },
];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string; 
  
  level: number;
  currentExp: number;
  nextLevelExp: number;
  
  collectionCount: number;
  pokedexProgress: number; 
  rank: string; 
  
  unlockedTitles: string[];
  equippedTitle: Title | null;

  isVip: boolean;
  vipType: VipType;
  vipExpiry?: Date | string; // Handle MMKV serialization
  
  balance: number; // Current virtual balance
  
  notificationsEnabled: boolean;
  currency: 'VND' | 'USD';
  language: 'vi' | 'en';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
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
  
  unlockedTitles: ['rookie', 'collector'],
  equippedTitle: AVAILABLE_TITLES[0],

  isVip: false,
  vipType: 'none',
  
  balance: 1000000, // Initial 1M VND for demo
  
  notificationsEnabled: true,
  currency: 'VND',
  language: 'vi',
  soundEnabled: true,
  vibrationEnabled: true,
};
