import { useCallback, useRef } from 'react';

type Options = { duration?: number; onLongPress: () => void };

export function useLongPress({ duration = 520, onLongPress }: Options) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    fired.current = false;
    clear();
    timer.current = setTimeout(() => {
      fired.current = true;
      onLongPress();
    }, duration);
  }, [clear, duration, onLongPress]);

  const end = useCallback(() => {
    clear();
  }, [clear]);

  return {
    onPointerDown: start,
    onPointerUp: end,
    onPointerLeave: end,
    onPointerCancel: end,
  };
}
