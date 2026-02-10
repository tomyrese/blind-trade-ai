import { create } from 'zustand';
import { UserProfile, MOCK_USER, VipType } from '../../domain/models/User';

interface UserState {
  profile: UserProfile;
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  addExp: (amount: number) => void;
  upgradeToVip: (type: VipType) => void;
  setAvatar: (avatarId: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: MOCK_USER,

  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
    }));
  },

  addExp: (amount) => {
    set((state) => {
      let { level, currentExp, nextLevelExp } = state.profile;
      currentExp += amount;

      // Level Up Logic
      if (currentExp >= nextLevelExp) {
        level += 1;
        currentExp -= nextLevelExp;
        nextLevelExp = Math.floor(nextLevelExp * 1.2); // Increase required EXP by 20%
      }

      return {
        profile: {
          ...state.profile,
          level,
          currentExp,
          nextLevelExp,
        },
      };
    });
  },

  upgradeToVip: (type) => {
    set((state) => {
      const now = new Date();
      let expiry = new Date();

      if (type === 'monthly') expiry.setMonth(now.getMonth() + 1);
      if (type === 'yearly') expiry.setFullYear(now.getFullYear() + 1);
      if (type === 'lifetime') expiry.setFullYear(now.getFullYear() + 99);

      return {
        profile: {
          ...state.profile,
          isVip: true,
          vipType: type,
          vipExpiry: expiry,
          rank: state.profile.rank, // Keep existing rank, don't add "VIP" prefix
        },
      };
    });
  },

  setAvatar: (avatarId) => {
    set((state) => ({
      profile: { ...state.profile, avatar: avatarId },
    }));
  },
}));
