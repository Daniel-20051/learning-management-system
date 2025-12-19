import { cn } from "@/lib/utils";

type CourseType = "allocated" | "marketplace";

interface CourseTypeFilterProps {
  activeType: CourseType;
  onTypeChange: (type: CourseType) => void;
  className?: string;
}

const CourseTypeFilter = ({
  activeType,
  onTypeChange,
  className,
}: CourseTypeFilterProps) => {
  const filters: { label: string; value: CourseType }[] = [
    { label: "Registered Courses", value: "allocated" },
    { label: "Marketplace", value: "marketplace" },
  ];

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

