import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StudentDensity = 'comfortable' | 'compact';

type StudentPrefsState = {
  density: StudentDensity;
  hapticFeedback: boolean;
  weeklyGoalPct: number | null;
  setDensity: (d: StudentDensity) => void;
  setHapticFeedback: (v: boolean) => void;
  setWeeklyGoalPct: (n: number | null) => void;
};

export const useStudentPrefsStore = create<StudentPrefsState>()(
  persist(
    (set) => ({
      density: 'comfortable',
      hapticFeedback: true,
      weeklyGoalPct: 75,
      setDensity: (density) => set({ density }),
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
      setWeeklyGoalPct: (weeklyGoalPct) => set({ weeklyGoalPct }),
    }),
    {
      name: 'taim-student-prefs',
      partialize: (s) => ({
        density: s.density,
        hapticFeedback: s.hapticFeedback,
        weeklyGoalPct: s.weeklyGoalPct,
      }),
    },
  ),
);

export function triggerStudentHaptic(pattern: 'light' | 'medium' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const prefs = useStudentPrefsStore.getState();
  if (!prefs.hapticFeedback) return;
  if (pattern === 'light') navigator.vibrate(12);
  else navigator.vibrate([15, 40, 15]);
}
