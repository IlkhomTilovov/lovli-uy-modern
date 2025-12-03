import { Skeleton } from "@/components/ui/skeleton";

export const HeroSkeleton = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <Skeleton className="h-10 sm:h-14 lg:h-16 w-full max-w-lg mx-auto lg:mx-0" />
            <Skeleton className="h-10 sm:h-14 lg:h-16 w-4/5 max-w-md mx-auto lg:mx-0" />
            <Skeleton className="h-10 sm:h-14 lg:h-16 w-3/5 max-w-sm mx-auto lg:mx-0" />
            
            <div className="space-y-2 pt-2">
              <Skeleton className="h-5 w-full max-w-xl mx-auto lg:mx-0" />
              <Skeleton className="h-5 w-4/5 max-w-lg mx-auto lg:mx-0" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
              <Skeleton className="h-12 w-full sm:w-40" />
              <Skeleton className="h-12 w-full sm:w-32" />
            </div>
          </div>

          {/* Image */}
          <div className="relative order-first lg:order-last">
            <Skeleton className="aspect-[4/3] rounded-2xl w-full" />
            <Skeleton className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-40 h-20 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
