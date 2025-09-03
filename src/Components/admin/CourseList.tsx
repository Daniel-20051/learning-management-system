import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SessionSemesterDialog from "@/Components/SessionSemesterDialog";
import { Api } from "@/api";

const CourseList = () => {
  const navigate = useNavigate();
  const api = new Api();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const handleViewCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleSessionSemesterChange = async (session: string) => {
    try {
      setIsLoading(true);
      const response = await api.GetStaffCourses(session);
      const data = response?.data?.data ?? response?.data ?? [];
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        setCourses([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            Manage your courses and their content
          </p>
        </div>
        <SessionSemesterDialog
          onSelectionChange={handleSessionSemesterChange}
          onLoadingChange={setIsSessionLoading}
          isStaff={true}
        />
      </div>

      {isLoading || isSessionLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className=" pt-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <div className="h-5 w-5 bg-muted-foreground/20 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                      <div className="h-4 bg-muted-foreground/10 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-muted-foreground/10 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted-foreground/20 rounded w-12"></div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-muted-foreground/10 rounded"></div>
                      <div className="h-4 bg-muted-foreground/10 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-muted-foreground/10 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No Courses Available</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            There are no courses available for the selected session. Please try
            selecting a different session.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className=" pt-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {course.course_code}
                        </CardTitle>
                        <div className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          {course.course_unit} units
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {course.title}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{course.semester}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Level {course.course_level}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewCourse(String(course.id))}
                    className="w-full hover:bg-primary hover:text-primary-foreground"
                    variant="outline"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
