import { useState, useMemo, useCallback } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { initialPage = 1, itemsPerPage = 12 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset page if it exceeds total pages
  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  if (safePage !== currentPage && totalPages > 0) {
    setCurrentPage(safePage);
  }

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safePage, itemsPerPage]);

  const startIndex = (safePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(safePage * itemsPerPage, totalItems);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), Math.max(1, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    startIndex,
    endIndex,
    totalItems,
  };
}
