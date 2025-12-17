import Navbar from "../../../Components/navbar";
import CourseCards from "./components/courseCards";
import CourseCardSkeleton from "./components/CourseCardSkeleton";
import EmptyCoursesState from "./components/EmptyCoursesState";
import SessionSemesterDialog from "../../../Components/SessionSemesterDialog";
import NoticeSlider from "./components/NoticeSlider";
import NoticeDetailsDialog from "./components/NoticeDetailsDialog";
import UnpaidCoursesAlert from "./components/UnpaidCoursesAlert";
import { Api } from "../../../api/index";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { BookOpen, CheckCircle2, Clock, Search } from "lucide-react";
import type { Notice } from "@/api/notices";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const api = new Api();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedSession, selectedSemester, setSessionAndSemester } =
    useSession();

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [showUnpaidAlert, setShowUnpaidAlert] = useState(true);

  // Derive first name from authenticated user
  const userFirstName = useMemo(() => {
    const fullName = user?.name?.trim() || "";
    if (!fullName) return "Student";
    return fullName.split(" ")[0];
  }, [user?.name]);

  // Separate paid and unpaid courses
  // Only show courses where paid === true (strict check)
  const { paidCourses, unpaidCourses } = useMemo(() => {
    const paid: any[] = [];
    const unpaid: any[] = [];
    
    courses.forEach((course) => {
      // Strict check: only true (boolean or string "true") is considered paid
      const paidValue = course.paid;
      const isPaid = paidValue === true || paidValue === "true" || String(paidValue).toLowerCase() === "true";
      
      if (isPaid) {
        paid.push(course);
      } else {
        unpaid.push(course);
      }
    });
    
    return { paidCourses: paid, unpaidCourses: unpaid };
  }, [courses]);

  // Filter paid courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return paidCourses;

    const query = searchQuery.toLowerCase().trim();
    return paidCourses.filter((course) => {
      const courseCode =
        typeof course.course_code === "string"
          ? course.course_code.toLowerCase()
          : "";
      const courseTitle =
        typeof course.title === "string" ? course.title.toLowerCase() : "";
      const courseLevel =
        typeof course.course_level === "string"
          ? course.course_level.toLowerCase()
          : String(course.course_level || "").toLowerCase();

      return (
        courseCode.includes(query) ||
        courseTitle.includes(query) ||
        courseLevel.includes(query)
      );
    });
  }, [paidCourses, searchQuery]);

  // Basic stat placeholders to match the dashboard vibe
  const totalCourses = paidCourses.length || 0;
  const completedCourses = 0;
  const inProgressCourses = Math.max(totalCourses - completedCourses, 0);

  const handleSessionSemesterChange = (session: string, semester: string) => {
    setSessionAndSemester(session, semester);
  };

  // Fetch notices on component mount
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await api.GetNotices();
        if (response.data && Array.isArray(response.data)) {
          // Filter for active notices only
          const activeNotices = response.data.filter(
            (notice) => notice.status && String(notice.status).toLowerCase() === "active"
          );
          setNotices(activeNotices);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };

    fetchNotices();
  }, []);

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
            const coursesData = response.data.data || response.data;
            // Ensure we have an array
            if (Array.isArray(coursesData)) {
              setCourses(coursesData);
            } else {
              setCourses([]);
            }
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

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsNoticeDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-4 md:pt-8 px-4 md:px-7 lg:px-12 xl:px-20 flex flex-col gap-4 md:gap-8 overflow-y-auto pb-6 md:pb-10">
        {/* Notices Slider */}
        {notices.length > 0 ? (
          <NoticeSlider notices={notices} onNoticeClick={handleNoticeClick} />
        ) : (
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
        )}

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

        {/* Unpaid Courses Alert */}
        {unpaidCourses.length > 0 && showUnpaidAlert && (
          <UnpaidCoursesAlert
            count={unpaidCourses.length}
            onDismiss={() => setShowUnpaidAlert(false)}
            onCompleteRegistration={() => navigate('/allocated-courses')}
          />
        )}

        {/* My Courses Header + Filters */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">My Courses</h2>
              <SessionSemesterDialog
                onSelectionChange={handleSessionSemesterChange}
              />
            </div>

            {/* Search Bar */}
            <div className="relative place-self-end max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCourses.map((course: any, index: number) => (
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
                  registrationId={course.registration?.id}
                  instructor={course.instructor}
                  onUnregister={() => {
                    // Remove the course from the list after unregistering
                    setCourses((prev) => prev.filter((c) => c.id !== course.id));
                  }}
                />
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No courses found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                No courses match your search for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <EmptyCoursesState />
          )}
        </div>
      </div>

      {/* Notice Details Dialog */}
      <NoticeDetailsDialog
        notice={selectedNotice}
        open={isNoticeDialogOpen}
        onOpenChange={setIsNoticeDialogOpen}
      />
    </div>
  );
};

export default Home;
