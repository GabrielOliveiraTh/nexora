import { useCallback, useRef } from 'react';

export function useStableDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number,
): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs],
  ) as unknown as T;
}

export function useStableThrottle<T extends (...args: never[]) => void>(
  fn: T,
  intervalMs: number,
): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const lastCallRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = intervalMs - (now - lastCallRef.current);

      if (remaining <= 0) {
        lastCallRef.current = now;
        fnRef.current(...args);
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timerRef.current = null;
          fnRef.current(...args);
        }, remaining);
      }
    },
    [intervalMs],
  ) as unknown as T;
}
