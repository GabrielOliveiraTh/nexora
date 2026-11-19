import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStableDebounce, useStableThrottle } from '@hooks/useStableDebounce';

describe('useStableDebounce', () => {
  it('debounces function calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { result } = renderHook(() => useStableDebounce(fn, 300));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('uses the latest callback reference', () => {
    vi.useFakeTimers();
    let value = 'first';
    const fn1 = vi.fn(() => value);
    const { result, rerender } = renderHook(
      ({ fn }) => useStableDebounce(fn, 200),
      { initialProps: { fn: fn1 } },
    );

    act(() => {
      result.current();
    });

    value = 'second';
    const fn2 = vi.fn(() => value);
    rerender({ fn: fn2 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn1).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('useStableThrottle', () => {
  it('throttles function calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { result } = renderHook(() => useStableThrottle(fn, 500));

    act(() => {
      result.current();
    });

    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      result.current();
      result.current();
    });

    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
