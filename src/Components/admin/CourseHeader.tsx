import { BookOpen, ArrowLeft } from "lucide-react";

interface CourseHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

const CourseHeader = ({ title, subtitle, onBack }: CourseHeaderProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg sm:rounded-xl" />
      <div className="relative z-10 p-4 sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-md border-1 border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm cursor-pointer"
          aria-label="Back to Courses"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </button>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
