import { BookOpen } from "lucide-react";

const EmptyCoursesState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-5 px-4 text-center">
      <div className="mb-6">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
      </div>

      <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>

      <p className="text-muted-foreground mb-6 max-w-md">
        There are no courses available for the selected session and semester.
        Please try selecting a different session or semester.
      </p>
    </div>
  );
};

export default EmptyCoursesState;
