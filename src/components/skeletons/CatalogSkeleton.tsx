import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export const FilterSidebarSkeleton = () => {
  return (
    <Card className="p-6 border-border">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Search skeleton */}
      <div className="mb-6">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Categories skeleton */}
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </Card>
  );
};

export const CatalogGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
