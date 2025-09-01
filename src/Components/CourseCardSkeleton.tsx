import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";

const CourseCardSkeleton = () => {
  return (
    <div>
      <Card className="overflow-hidden">
        {/* Gradient background skeleton */}
        <div className="w-full h-25 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
          {/* Course code skeleton - centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-8 w-16 bg-white/50" />
          </div>

          {/* Abstract elements skeleton */}
          <div className="absolute inset-0 opacity-20">
            {/* Dots */}
            <Skeleton className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full" />
            <Skeleton className="absolute top-1/2 left-8 w-2 h-2 bg-white/30 rounded-full" />
            <Skeleton className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full" />
            <Skeleton className="absolute bottom-8 left-6 w-2 h-2 bg-white/30 rounded-full" />
            <Skeleton className="absolute bottom-4 right-8 w-2 h-2 bg-white/30 rounded-full" />

            {/* Star */}
            <Skeleton className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full" />

            {/* Shapes */}
            <Skeleton className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full" />
            <Skeleton className="absolute bottom-8 left-8 w-4 h-4 bg-white/20" />
          </div>
        </div>

        <CardHeader>
          {/* Title skeleton */}
          <Skeleton className="h-6 w-32" />
        </CardHeader>

        <CardContent>
          {/* Content skeleton - 3 lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>

        <CardFooter className="place-self-end">
          {/* Button skeleton */}
          <Skeleton className="h-10 w-16" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default CourseCardSkeleton;
