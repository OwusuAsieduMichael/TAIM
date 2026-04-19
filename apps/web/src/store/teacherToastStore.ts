import { create } from 'zustand';

export type TeacherToastTone = 'success' | 'error' | 'info';

export type TeacherToast = {
  id: string;
  tone: TeacherToastTone;
  title: string;
  detail?: string;
};

type State = {
  toasts: TeacherToast[];
  push: (t: { title: string; tone: TeacherToastTone; detail?: string }) => void;
  dismiss: (id: string) => void;
};

let seq = 0;

export const useTeacherToastStore = create<State>((set, get) => ({
  toasts: [],
  push: ({ title, tone, detail }) => {
    const id = `toast-${++seq}`;
    set((s) => ({ toasts: [...s.toasts, { id, title, tone, detail }] }));
    window.setTimeout(() => {
      if (get().toasts.some((t) => t.id === id)) {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }
    }, 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
