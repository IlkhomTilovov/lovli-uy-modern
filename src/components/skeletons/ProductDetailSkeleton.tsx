import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <Skeleton className="h-10 w-40 mb-6" />

      <div className="grid lg:grid-cols-2 gap-12 mb-20">
        {/* Product Image Skeleton */}
        <div>
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-baseline gap-4 mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          {/* Feature boxes skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-12 w-full" />

          {/* Description skeleton */}
          <div className="border-t border-border pt-6">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Features skeleton */}
          <div className="border-t border-border pt-6">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-2/3" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
