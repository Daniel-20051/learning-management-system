import Navbar from "../Components/navbar";
import CourseCards from "../Components/courseCards";
import CourseCardSkeleton from "../Components/CourseCardSkeleton";
import EmptyCoursesState from "../Components/EmptyCoursesState";
import SessionSemesterDialog from "../Components/SessionSemesterDialog";
import { Api } from "../api/index";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";

const Home = () => {
  const api = new Api();

  // Set default values to match SessionSemesterDialog defaults
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Derive first name from authenticated user
  const userFirstName = useMemo(() => {
    const fullName = user?.name?.trim() || "";
    if (!fullName) return "Student";
    return fullName.split(" ")[0];
  }, [user?.name]);

  // Basic stat placeholders to match the dashboard vibe
  const totalCourses = courses.length || 0;
  const completedCourses = 0;
  const inProgressCourses = Math.max(totalCourses - completedCourses, 0);

  const handleSessionSemesterChange = (session: string, semester: string) => {
    setSelectedSession(session);
    setSelectedSemester(semester);
  };

  // Fetch courses when session/semester changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (selectedSession && selectedSemester) {
        setIsLoading(true);
        try {
          const response = await api.GetCourses(
            selectedSession,
            selectedSemester
          );
          if (response.data) {
            setCourses(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCourses();
  }, [selectedSession, selectedSemester]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-4 md:pt-8 px-4 md:px-7 lg:px-12 xl:px-20 flex flex-col gap-4 md:gap-8 overflow-y-auto pb-6 md:pb-10">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-br py-4 md:py-6 from-slate-900 via-slate-800 to-slate-700 text-white border-0">
          <CardContent className="px-4 md:px-6 lg:px-8">
            <div className="flex flex-col gap-2 md:gap-4">
              <div>
                <p className="text-sm md:text-lg text-white/80">
                  Welcome back, {userFirstName}
                </p>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                  Keep up the excellent work!
                </h1>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card className="py-2 md:py-3">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-md bg-blue-50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Courses
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs w-fit">
                  this semester
                </Badge>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3 text-blue-700 ml-0 md:ml-3">
                {totalCourses}
              </p>
            </CardContent>
          </Card>
          <Card className="py-2 md:py-3">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-md bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Completed
                </p>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3 text-green-700 ml-0 md:ml-3">
                {completedCourses}
              </p>
            </CardContent>
          </Card>
          <Card className="py-2 md:py-3 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-md bg-amber-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  In Progress
                </p>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3 text-amber-700 ml-0 md:ml-3">
                {inProgressCourses}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses Header + Filters */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">My Courses</h2>
              <SessionSemesterDialog
                onSelectionChange={handleSessionSemesterChange}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Session:</span>
                <span className="text-foreground font-medium">
                  {selectedSession || "-"}
                </span>
              </div>
              <span className="hidden sm:inline text-muted-foreground">/</span>
              <div className="flex items-center gap-2">
                <span>Semester:</span>
                <span className="text-foreground font-medium">
                  {selectedSemester || "-"}
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {courses.map((course: any, index: number) => (
                <CourseCards
                  key={course.id || index}
                  courseCode={course.course_code}
                  courseTitle={course.title}
                  courseLevel={course.course_level}
                  courseUnit={course.course_unit}
                  academicYear={course.registration?.academic_year}
                  courseType={course.course_type}
                  examFee={course.exam_fee}
                  courseId={course.id}
                />
              ))}
            </div>
          ) : (
            <EmptyCoursesState />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
