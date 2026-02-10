export type VipType = 'none' | 'monthly' | 'yearly' | 'lifetime';

export interface Title {
  id: string;
  name: string;
  description: string;
  condition: string;
  color: string;
}

export const AVAILABLE_TITLES: Title[] = [
  { id: 'rookie', name: 'Tân Binh', description: 'Chào mừng đến với thế giới Pokémon!', condition: 'Mặc định', color: '#e2e8f0' },
  { id: 'collector', name: 'Nhà Sưu Tập', description: 'Sở hữu 50 thẻ bài khác nhau', condition: 'Sở hữu 50 thẻ', color: '#3b82f6' },
  { id: 'pro_trader', name: 'Thương Gia', description: 'Thực hiện thành công 10 giao dịch', condition: '10 Giao dịch', color: '#10b981' },
  { id: 'elite', name: 'Tinh Anh', description: 'Đạt cấp độ 50', condition: 'Level 50', color: '#8b5cf6' },
  { id: 'champion', name: 'Nhà Vô Địch', description: 'Đạt cấp độ 90', condition: 'Level 90', color: '#f59e0b' },
  { id: 'vip_member', name: 'Thành Viên VIP', description: 'Dành riêng cho người dùng VIP', condition: 'Là VIP', color: '#fcd34d' },
  { id: 'legendary', name: 'Huyền Thoại', description: 'Sở hữu thẻ bài cấp Legendary', condition: 'Sở hữu thẻ Legendary', color: '#ec4899' },
];

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
  
  // Titles
  unlockedTitles: string[];
  equippedTitle: Title | null;

  // VIP Status
  isVip: boolean;
  vipType: VipType;
  vipExpiry?: Date;
  
  // Settings
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
  
  notificationsEnabled: true,
  currency: 'VND',
  language: 'vi',
  soundEnabled: true,
  vibrationEnabled: true,
};
