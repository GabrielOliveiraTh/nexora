import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';

interface ResizableVirtualElementProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  index: number;
  children: ReactNode;
}

export function ResizableVirtualElement({
  virtualizer,
  index,
  children,
}: ResizableVirtualElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const heightCache = useRef<number>(0);
  const invalidationToken = useRef(0);

  const measureElement = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const height = element.getBoundingClientRect().height;
    if (height !== heightCache.current) {
      heightCache.current = height;
      invalidationToken.current++;
      virtualizer.measureElement(element);
    }
  }, [virtualizer]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new ResizeObserver(() => {
      measureElement();
    });

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [measureElement]);

  return (
    <div ref={elementRef} data-index={index}>
      {children}
    </div>
  );
}
