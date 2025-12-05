import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LazyLoadTriggerProps {
  observerRef: (node: HTMLDivElement | null) => void;
  hasMore: boolean;
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  onLoadMore?: () => void;
  className?: string;
}

export function LazyLoadTrigger({
  observerRef,
  hasMore,
  isLoading,
  loadedCount,
  totalCount,
  onLoadMore,
  className,
}: LazyLoadTriggerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-8", className)}>
      {/* Observer trigger element */}
      {hasMore && <div ref={observerRef} className="h-4 w-full" />}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Yuklanmoqda...</span>
        </div>
      )}

      {/* Progress info */}
      {totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {loadedCount} / {totalCount} ta ko'rsatilmoqda
        </p>
      )}

      {/* Load more button (fallback) */}
      {hasMore && !isLoading && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="text-sm text-primary hover:underline"
        >
          Yana yuklash
        </button>
      )}

      {/* All loaded message */}
      {!hasMore && totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Barcha mahsulotlar yuklandi
        </p>
      )}
    </div>
  );
}
