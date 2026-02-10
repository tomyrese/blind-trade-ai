import { create } from 'zustand';
import { UserProfile, MOCK_USER, VipType, AVAILABLE_TITLES } from '../../domain/models/User';

interface UserState {
  profile: UserProfile;
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  addExp: (amount: number) => void;
  upgradeToVip: (type: VipType) => void;
  setAvatar: (avatarId: string) => void;
  
  // Titles
  unlockTitle: (titleId: string) => void;
  equipTitle: (titleId: string) => void;
  checkTitleUnlocks: () => void;
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
    get().checkTitleUnlocks();
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
    get().checkTitleUnlocks();
  },

  checkTitleUnlocks: () => {
    set((state) => {
      const { level, collectionCount, isVip, unlockedTitles } = state.profile;
      const newUnlocked = [...unlockedTitles];
      let hasNew = false;

      // Check conditions
      if (level >= 50 && !newUnlocked.includes('elite')) { newUnlocked.push('elite'); hasNew = true; }
      if (level >= 90 && !newUnlocked.includes('champion')) { newUnlocked.push('champion'); hasNew = true; }
      if (collectionCount >= 50 && !newUnlocked.includes('collector')) { newUnlocked.push('collector'); hasNew = true; }
      if (isVip && !newUnlocked.includes('vip_member')) { newUnlocked.push('vip_member'); hasNew = true; }
      
      // Default
      if (!newUnlocked.includes('rookie')) { newUnlocked.push('rookie'); hasNew = true; }

      if (!hasNew) return {};

      return {
        profile: {
          ...state.profile,
          unlockedTitles: newUnlocked,
        }
      };
    });
  },

  unlockTitle: (titleId) => {
    set((state) => {
      if (state.profile.unlockedTitles.includes(titleId)) return {};
      return {
        profile: {
          ...state.profile,
          unlockedTitles: [...state.profile.unlockedTitles, titleId],
        }
      };
    });
  },

  equipTitle: (titleId) => {
    set((state) => {
      const title = AVAILABLE_TITLES.find(t => t.id === titleId);
      if (!title || !state.profile.unlockedTitles.includes(titleId)) return {};
      return {
        profile: {
          ...state.profile,
          equippedTitle: title,
        }
      };
    });
  },

  setAvatar: (avatarId) => {
    set((state) => ({
      profile: { ...state.profile, avatar: avatarId },
    }));
  },
}));
