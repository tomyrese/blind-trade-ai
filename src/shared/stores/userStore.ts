import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../storage/mmkv';
import { UserProfile, MOCK_USER, VipType, AVAILABLE_TITLES } from '../../domain/models/User';

interface RegisteredUser {
  email: string;
  password?: string;
  profile: UserProfile;
}

interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  language: 'en' | 'vi';
  registeredUsers: RegisteredUser[];
  hasHydrated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  setLanguage: (lang: 'en' | 'vi') => void;
  
  updateProfile: (updates: Partial<UserProfile>) => void;
  addExp: (amount: number) => void;
  upgradeToVip: (type: VipType) => void;
  setAvatar: (avatarId: string) => void;
  updateBalance: (amount: number) => void;
  spend: (amount: number) => boolean;
  
  // Titles
  unlockTitle: (titleId: string) => void;
  equipTitle: (titleId: string) => void;
  checkTitleUnlocks: () => void;

  // Payment Methods
  addPaymentMethod: (pm: Omit<import('../../domain/models/User').PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;

  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  set2FA: (enabled: boolean) => void;

  _setHydrated: (val: boolean) => void;
}

const syncProfileInState = (state: UserState, newProfile: UserProfile) => {
  const index = state.registeredUsers.findIndex(u => u.email.toLowerCase() === newProfile.email.toLowerCase());
  if (index === -1) return state.registeredUsers;
  
  const newUsers = [...state.registeredUsers];
  newUsers[index] = { ...newUsers[index], profile: newProfile };
  return newUsers;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isAuthenticated: false,
      language: 'vi',
      registeredUsers: [],
      hasHydrated: false,

      _setHydrated: (val) => set({ hasHydrated: val }),

      login: async (email, password) => {
        const user = get().registeredUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (user) {
          set({ 
            profile: user.profile,
            isAuthenticated: true,
            language: user.profile.language || get().language
          });
          return true;
        }
        return false;
      },

      loginAsGuest: () => {
        const guestEmail = 'guest@blindtrade.ai';
        const existingGuest = get().registeredUsers.find(u => u.email === guestEmail);
        
        if (existingGuest) {
          set({ 
            profile: existingGuest.profile,
            isAuthenticated: true,
            language: existingGuest.profile.language || get().language
          });
        } else {
          const guestProfile = { ...MOCK_USER, email: guestEmail, name: 'Guest Trainer', language: get().language };
          set(state => ({ 
            profile: guestProfile,
            isAuthenticated: true,
            registeredUsers: [...state.registeredUsers, { email: guestEmail, profile: guestProfile }]
          }));
        }
      },

      register: async (name, email, password, phone) => {
        const { registeredUsers } = get();
        if (name && email && password.length >= 6 && phone) {
          const exists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
          if (exists) return false;

          const newProfile = { ...MOCK_USER, name, email, phoneNumber: phone, language: get().language };
          set(state => ({
            registeredUsers: [...state.registeredUsers, { email, password, profile: newProfile }]
          }));
          return true;
        }
        return false;
      },

      logout: () => {
        set({ profile: null, isAuthenticated: false });
      },

      setLanguage: (lang) => {
        set((state) => {
          const newProfile = state.profile ? { ...state.profile, language: lang } : null;
          return {
            language: lang,
            profile: newProfile,
            registeredUsers: newProfile ? syncProfileInState(state, newProfile) : state.registeredUsers
          };
        });
      },

      updateProfile: (updates) => {
        set((state) => {
          if (!state.profile) return state;
          const newProfile = { ...state.profile, ...updates };
          const newLanguage = updates.language || state.language;
          
          return {
            profile: newProfile,
            language: newLanguage as 'en' | 'vi',
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      addExp: (amount) => {
        set((state) => {
          if (!state.profile) return state;
          
          let { level, currentExp, nextLevelExp } = state.profile;
          currentExp += amount;

          if (currentExp >= nextLevelExp) {
            level += 1;
            currentExp -= nextLevelExp;
            nextLevelExp = Math.floor(nextLevelExp * 1.2);
          }

          const newProfile = { ...state.profile, level, currentExp, nextLevelExp };
          
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
        get().checkTitleUnlocks();
      },

      upgradeToVip: (type) => {
        set((state) => {
          if (!state.profile) return state;
          
          const now = new Date();
          let expiry = new Date();

          if (type === 'monthly') expiry.setMonth(now.getMonth() + 1);
          if (type === 'yearly') expiry.setFullYear(now.getFullYear() + 1);
          if (type === 'lifetime') expiry.setFullYear(now.getFullYear() + 99);

          const newProfile = {
            ...state.profile,
            isVip: true,
            vipType: type,
            vipExpiry: expiry.toISOString(),
          };

          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
        get().checkTitleUnlocks();
      },

      checkTitleUnlocks: () => {
        set((state) => {
          if (!state.profile) return state;
          
          const { level, collectionCount, isVip, unlockedTitles } = state.profile;
          const newUnlocked = [...unlockedTitles];
          let hasNew = false;

          if (level >= 50 && !newUnlocked.includes('elite')) { newUnlocked.push('elite'); hasNew = true; }
          if (level >= 90 && !newUnlocked.includes('champion')) { newUnlocked.push('champion'); hasNew = true; }
          if (collectionCount >= 50 && !newUnlocked.includes('collector')) { newUnlocked.push('collector'); hasNew = true; }
          if (isVip && !newUnlocked.includes('vip_member')) { newUnlocked.push('vip_member'); hasNew = true; }
          
          if (!newUnlocked.includes('rookie')) { newUnlocked.push('rookie'); hasNew = true; }

          if (!hasNew) return state;

          const newProfile = { ...state.profile, unlockedTitles: newUnlocked };

          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      unlockTitle: (titleId) => {
        set((state) => {
          if (!state.profile || state.profile.unlockedTitles.includes(titleId)) return state;
          const newProfile = {
            ...state.profile,
            unlockedTitles: [...state.profile.unlockedTitles, titleId],
          };
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      equipTitle: (titleId) => {
        set((state) => {
          if (!state.profile) return state;
          const title = AVAILABLE_TITLES.find(t => t.id === titleId);
          if (!title || !state.profile.unlockedTitles.includes(titleId)) return state;
          const newProfile = { ...state.profile, equippedTitle: title };
          
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      setAvatar: (avatarId) => {
        set((state) => {
          if (!state.profile) return state;
          const newProfile = { ...state.profile, avatar: avatarId };
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      updateBalance: (amount) => {
        set((state) => {
          if (!state.profile) return state;
          const newProfile = { ...state.profile, balance: (state.profile.balance || 0) + amount };
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },
      spend: (amount: number) => {
        const state = get();
        if (!state.profile || (state.profile.balance || 0) < amount) return false;
        
        const newProfile = { ...state.profile, balance: state.profile.balance - amount };
        set({
          profile: newProfile,
          registeredUsers: syncProfileInState(state, newProfile)
        });
        return true;
      },

      addPaymentMethod: (pm) => {
        set((state) => {
          if (!state.profile) return state;
          const newPm = { ...pm, id: `pm-${Date.now()}` };
          const paymentMethods = [...state.profile.paymentMethods];
          
          if (newPm.isDefault) {
            paymentMethods.forEach(p => p.isDefault = false);
          }
          
          paymentMethods.push(newPm);
          const newProfile = { ...state.profile, paymentMethods };
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      removePaymentMethod: (id) => {
        set((state) => {
          if (!state.profile) return state;
          const paymentMethods = state.profile.paymentMethods.filter(p => p.id !== id);
          const newProfile = { ...state.profile, paymentMethods };
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      setDefaultPaymentMethod: (id) => {
        set((state) => {
          if (!state.profile) return state;
          const paymentMethods = state.profile.paymentMethods.map(p => ({
            ...p,
            isDefault: p.id === id
          }));
          const newProfile = { ...state.profile, paymentMethods };
          return {
            profile: newProfile,
            registeredUsers: syncProfileInState(state, newProfile)
          };
        });
      },

      changePassword: async (oldPass, newPass) => {
        const { profile, registeredUsers } = get();
        if (!profile) return { success: false, message: 'Not logged in' };

        const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === profile.email.toLowerCase());
        if (userIndex === -1) return { success: false, message: 'User not found' };

        if (registeredUsers[userIndex].password !== oldPass) {
            return { success: false, message: 'invalid_old_password' };
        }

        const newUsers = [...registeredUsers];
        newUsers[userIndex] = { ...newUsers[userIndex], password: newPass };

        set({ registeredUsers: newUsers });
        return { success: true };
      },

      set2FA: (enabled) => {
        get().updateProfile({ twoFactorEnabled: enabled });
      },
    }),
    {
      name: 'user-auth-stable', // Final name attempt
      storage: createJSONStorage(() => createMMKVStorage()),
      partialize: (state) => ({
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
        registeredUsers: state.registeredUsers,
      }),
      onRehydrateStorage: () => (state) => {
        // Atomic update to signal hydration finished
        state?._setHydrated(true);
      },
    }
  )
);
