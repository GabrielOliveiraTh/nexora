import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface AsyncCacheContextValue {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttlMs?: number) => void;
  invalidate: (key: string) => void;
  invalidatePattern: (pattern: RegExp) => void;
  clear: () => void;
}

const DEFAULT_TTL = 5 * 60 * 1000;

const AsyncCacheContext = createContext<AsyncCacheContextValue | null>(null);

export function AsyncCacheProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<Map<string, CacheEntry<unknown>>>(new Map());

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cacheRef.current.delete(key);
      return null;
    }
    return entry.data as T;
  }, []);

  const set = useCallback(<T,>(key: string, data: T, ttlMs = DEFAULT_TTL): void => {
    cacheRef.current.set(key, { data, expiresAt: Date.now() + ttlMs });
  }, []);

  const invalidate = useCallback((key: string): void => {
    cacheRef.current.delete(key);
  }, []);

  const invalidatePattern = useCallback((pattern: RegExp): void => {
    for (const key of cacheRef.current.keys()) {
      if (pattern.test(key)) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  return (
    <AsyncCacheContext.Provider value={{ get, set, invalidate, invalidatePattern, clear }}>
      {children}
    </AsyncCacheContext.Provider>
  );
}

export function useAsyncCache(): AsyncCacheContextValue {
  const context = useContext(AsyncCacheContext);
  if (!context) throw new Error('useAsyncCache must be used within AsyncCacheProvider');
  return context;
}
