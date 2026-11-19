import { useState, useCallback } from 'react';
import { useStableDebounce } from '@hooks/useStableDebounce';

interface UseOptionSearchResult<T> {
  options: T[];
  loading: boolean;
  searchValue: string;
  onSearch: (value: string) => void;
  reset: () => void;
}

export function useOptionSearch<T>(
  fetchFn: (search: string) => Promise<T[]>,
  debounceMs = 300,
): UseOptionSearchResult<T> {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const doSearch = useStableDebounce(async (value: string) => {
    if (!value.trim()) {
      setOptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await fetchFn(value);
      setOptions(results);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, debounceMs);

  const onSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      doSearch(value);
    },
    [doSearch],
  );

  const reset = useCallback(() => {
    setSearchValue('');
    setOptions([]);
  }, []);

  return { options, loading, searchValue, onSearch, reset };
}
