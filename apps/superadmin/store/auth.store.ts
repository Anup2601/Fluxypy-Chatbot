import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Org {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: User | null;
  org: Org | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, org: Org, token: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  org: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, org, token) => {
    Cookies.set('sa_accessToken', token, { expires: 1 });
    set({ user, org, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    Cookies.remove('sa_accessToken');
    Cookies.remove('sa_refreshToken');
    set({ user: null, org: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));