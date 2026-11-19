import { useState, useCallback, useRef } from 'react';
import { useAsyncCache } from '@context/AsyncCacheContext/AsyncCacheContext';
import type { AsyncStatus } from '@appTypes/Utils.type';

interface UseAsyncOptions {
  cacheKey?: string;
  cacheTtlMs?: number;
}

interface UseAsyncResult<T> {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  options: UseAsyncOptions = {},
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cache = useAsyncCache();

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      if (options.cacheKey) {
        const cached = cache.get<T>(options.cacheKey);
        if (cached) {
          setData(cached);
          setStatus('succeeded');
          return cached;
        }
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setStatus('loading');
      setError(null);

      try {
        const result = await asyncFn(...args);
        setData(result);
        setStatus('succeeded');

        if (options.cacheKey) {
          cache.set(options.cacheKey, result, options.cacheTtlMs);
        }

        return result;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return null;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('failed');
        return null;
      }
    },
    [asyncFn, cache, options.cacheKey, options.cacheTtlMs],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setData(null);
    setStatus('idle');
    setError(null);
  }, []);

  return { data, status, error, execute, reset };
}
