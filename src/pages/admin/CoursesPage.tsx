import CourseList from "@/Components/admin/CourseList";
import { Card, CardContent } from "@/Components/ui/card";
import SessionSemesterDialog from "@/Components/SessionSemesterDialog";
import { BookOpen, Users } from "lucide-react";
import { useState } from "react";
import { Api } from "@/api";

const CoursesPage = () => {
  const api = new Api();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Courses
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your courses and their content
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <SessionSemesterDialog
            onSelectionChange={async (session: string) => {
              setIsLoading(true);
              try {
                const response = await api.GetStaffCourses(session);
                const data = response?.data?.data ?? response?.data ?? [];
                setCourses(Array.isArray(data) ? data : []);
              } finally {
                setIsLoading(false);
              }
            }}
            onLoadingChange={setIsLoading}
            isStaff={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Courses
              </p>
              <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-blue-50 flex items-center justify-center">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {isLoading ? "--" : courses.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Active Students
              </p>
              <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-green-50 flex items-center justify-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {isLoading
                ? "--"
                : courses.reduce(
                    (sum: number, c: any) => sum + (c?.students_count ?? 0),
                    0
                  )}
            </p>
          </CardContent>
        </Card>
      </div>

      <CourseList courses={courses} isLoadingExternal={isLoading} />
    </div>
  );
};

export default CoursesPage;
