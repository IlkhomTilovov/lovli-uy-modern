import { useState, useCallback, useMemo, useRef, useEffect } from "react";

interface UseLazyLoadOptions {
  initialBatch?: number;
  batchSize?: number;
  threshold?: number;
}

interface UseLazyLoadResult<T> {
  visibleItems: T[];
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  reset: () => void;
  loadedCount: number;
  totalCount: number;
  observerRef: (node: HTMLDivElement | null) => void;
}

export function useLazyLoad<T>(
  items: T[],
  options: UseLazyLoadOptions = {}
): UseLazyLoadResult<T> {
  const { initialBatch = 12, batchSize = 12, threshold = 0.1 } = options;
  
  const [loadedCount, setLoadedCount] = useState(initialBatch);
  const [isLoading, setIsLoading] = useState(false);
  const observerElement = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const totalCount = items.length;
  const hasMore = loadedCount < totalCount;

  const visibleItems = useMemo(() => {
    return items.slice(0, loadedCount);
  }, [items, loadedCount]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate small delay for smoother UX
    setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + batchSize, totalCount));
      setIsLoading(false);
    }, 100);
  }, [isLoading, hasMore, batchSize, totalCount]);

  const reset = useCallback(() => {
    setLoadedCount(initialBatch);
  }, [initialBatch]);

  // Reset when items change significantly
  useEffect(() => {
    if (loadedCount > totalCount) {
      setLoadedCount(Math.min(initialBatch, totalCount));
    }
  }, [totalCount, loadedCount, initialBatch]);

  // Intersection Observer for infinite scroll
  const observerCallback = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold }
    );

    observerRef.current.observe(node);
    observerElement.current = node;
  }, [hasMore, isLoading, loadMore, threshold]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    visibleItems,
    loadMore,
    hasMore,
    isLoading,
    reset,
    loadedCount,
    totalCount,
    observerRef: observerCallback,
  };
}
