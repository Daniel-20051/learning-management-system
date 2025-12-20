import { cn } from "@/lib/utils";

type CourseType = "allocated" | "marketplace" | "degree_programs" | "my_courses" | "certificate_courses";

interface CourseTypeFilterProps {
  activeType: CourseType;
  onTypeChange: (type: CourseType) => void;
  className?: string;
  showRegisteredCourses?: boolean;
  isPendingUser?: boolean;
  hasProgramId?: boolean;
}

const CourseTypeFilter = ({
  activeType,
  onTypeChange,
  className,
  showRegisteredCourses = true,
  isPendingUser = false,
  hasProgramId = false,
}: CourseTypeFilterProps) => {
  // For pending users, show different filters
  const pendingFilters: { label: string; value: CourseType }[] = [
    { label: "Degree Programs", value: "degree_programs" },
    { label: "My Courses", value: "my_courses" },
    { label: "Certificate Courses", value: "certificate_courses" },
  ];

  // For regular users, show standard filters
  const allFilters: { label: string; value: CourseType }[] = [
    { label: "Registered Courses", value: "allocated" },
    { label: "Marketplace Courses", value: "marketplace" },
  ];
  
  const filters = isPendingUser 
    ? pendingFilters.filter((filter) => {
        // Hide "Degree Programs" if user already has a program_id
        if (filter.value === "degree_programs" && hasProgramId) {
          return false;
        }
        return true;
      })
    : allFilters.filter((filter) => {
        // Hide "Registered Courses" if showRegisteredCourses is false
        if (filter.value === "allocated" && !showRegisteredCourses) {
          return false;
        }
        return true;
      });

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-1 bg-muted rounded-full w-fit",
        className
      )}
      role="tablist"
    >
      {filters.map((filter) => {
        const isActive = activeType === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => onTypeChange(filter.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${filter.value}-panel`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default CourseTypeFilter;

