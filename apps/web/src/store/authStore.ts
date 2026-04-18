import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  role: string | null;
  schoolSlug: string | null;
  setAuth: (token: string, role: string, schoolSlug?: string | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      schoolSlug: null,
      setAuth: (token, role, schoolSlug = null) => set({ token, role, schoolSlug }),
      clear: () => set({ token: null, role: null, schoolSlug: null }),
    }),
    { name: 'taim-auth' },
  ),
);
