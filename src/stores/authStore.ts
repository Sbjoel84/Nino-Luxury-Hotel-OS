import { create } from 'zustand';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../repositories/mock/mockData';
import { isSupabaseConfigured, supabase } from '../services/supabase/client';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  setUser: (user: UserProfile | null) => void;
}

const STORAGE_KEY = 'nino_luxury_active_user';

function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Default to Super Administrator for full demonstration capability
  return INITIAL_USERS[0];
}

function getMockUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem('nino_luxury_users');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_USERS;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  isAuthenticated: Boolean(getStoredUser()),
  isLoading: false,

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured() && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || 'reception',
            department: data.user.user_metadata?.department || 'Operations',
            isActive: true,
            createdAt: data.user.created_at,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          set({ user: profile, isAuthenticated: true, isLoading: false });
          return true;
        }
      }

      // Mock user login by email or role match (includes staff added via Admin Panel)
      const matched = getMockUsers().find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.role === (email as UserRole)
      );

      if (matched && matched.isActive === false) {
        set({ isLoading: false });
        return false;
      }

      const targetUser = matched || {
        ...INITIAL_USERS[0],
        email,
        fullName: email.split('@')[0],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(targetUser));
      set({ user: targetUser, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      console.error('Login error:', err);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isAuthenticated: false });
  },

  switchRole: (role: UserRole) => {
    const matched = INITIAL_USERS.find((u) => u.role === role);
    if (matched) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matched));
      set({ user: matched, isAuthenticated: true });
    } else {
      const currentUser = get().user;
      if (currentUser) {
        const updated = { ...currentUser, role };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        set({ user: updated });
      }
    }
  },

  setUser: (user: UserProfile | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ user, isAuthenticated: Boolean(user) });
  },
}));
