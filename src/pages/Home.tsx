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
    <div className="flex flex-col max-h-screen ">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-8 px-7 md:px-12 lg:px-15 xl:px-20 flex flex-col gap-8 overflow-y-auto pb-10">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-br py-6 from-slate-900 via-slate-800 to-slate-700 text-white border-0">
          <CardContent className="px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-lg text-white/80">
                  Welcome back, {userFirstName}
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  Keep up the excellent work!
                </h1>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="py-2">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  this semester
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3 text-blue-700 ml-3">
                {totalCourses}
              </p>
            </CardContent>
          </Card>
          <Card className="py-2">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <p className="text-2xl font-bold mt-3 text-green-700 ml-3">
                {completedCourses}
              </p>
            </CardContent>
          </Card>
          <Card className="py-2">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-amber-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <p className="text-2xl font-bold mt-3 text-amber-700 ml-3">
                {inProgressCourses}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses Header + Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <div className="hidden md:block h-5 w-px bg-border" />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Session</span>
                <span className="text-foreground">
                  {selectedSession || "-"}
                </span>
                <span className="mx-1">/</span>
                <span>Semester</span>
                <span className="text-foreground">
                  {selectedSemester || "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SessionSemesterDialog
                onSelectionChange={handleSessionSemesterChange}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
