import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('pharmagen_user') || 'null'),
  accessToken: localStorage.getItem('pharmagen_access_token'),
  refreshToken: localStorage.getItem('pharmagen_refresh_token'),
  isAuthenticated: !!localStorage.getItem('pharmagen_access_token'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('pharmagen_user', JSON.stringify(user));
    localStorage.setItem('pharmagen_access_token', accessToken);
    localStorage.setItem('pharmagen_refresh_token', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('pharmagen_user');
    localStorage.removeItem('pharmagen_access_token');
    localStorage.removeItem('pharmagen_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
