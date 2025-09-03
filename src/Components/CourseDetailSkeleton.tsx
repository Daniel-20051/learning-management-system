import { Skeleton } from "@/Components/ui/skeleton";

const CourseDetailSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl" />
        <div className="relative p-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="p-3 w-14 h-14 rounded-xl" />
                  <div>
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-6 w-64" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-xl">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="p-6 border rounded-xl">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-80" />
          </div>
          <Skeleton className="h-12 w-32" />
        </div>

        {/* Module skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetailSkeleton;
