import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const CategoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-border">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </div>
    </Card>
  );
};

export const CategoryGridSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
};
