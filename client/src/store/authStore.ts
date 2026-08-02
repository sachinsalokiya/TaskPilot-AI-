import { create } from "zustand";
import { login as loginApi, register as registerApi, getMe } from "../services/api";
import { TOKEN_KEY } from "../utils/constants";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: true,

  login: async (email, password) => {
    const { token, user } = await loginApi(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  register: async (name, email, password) => {
    const { token, user } = await registerApi(name, email, password);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  restoreSession: async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      set({ isLoading: false, token: null, user: null });
      return;
    }

    try {
      const { user } = await getMe();
      set({ token, user, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
