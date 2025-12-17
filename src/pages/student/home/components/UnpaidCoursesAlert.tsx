import { AlertCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface UnpaidCoursesAlertProps {
  count: number;
  onDismiss: () => void;
  onCompleteRegistration: () => void;
  className?: string;
}

const UnpaidCoursesAlert = ({
  count,
  onDismiss,
  onCompleteRegistration,
  className,
}: UnpaidCoursesAlertProps) => {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border-2 border-amber-500/50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20 shadow-lg shadow-amber-500/20",
        className
      )}
      role="alert"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-orange-400/10 to-red-400/10 animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10 w-full px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left side: Icon and text */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon with glow effect */}
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 md:p-3 rounded-full shadow-lg">
                <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse flex-shrink-0" />
                <h3 className="text-base md:text-lg font-bold text-amber-900 dark:text-amber-100 leading-tight">
                  You have {count} unregistered course{count !== 1 ? "s" : ""}
                </h3>
              </div>
              <p className="text-sm md:text-base text-amber-800 dark:text-amber-200 leading-relaxed">
                Please complete your course registration to access your courses.
              </p>
            </div>
          </div>

          {/* Right side: Buttons */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white border-amber-600 hover:border-amber-700 shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
              onClick={onCompleteRegistration}
            >
              Complete Registration
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-full flex-shrink-0"
              onClick={onDismiss}
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnpaidCoursesAlert;

