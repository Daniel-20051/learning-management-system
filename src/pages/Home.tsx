import Navbar from "../Components/navbar";
import CourseCards from "../Components/courseCards";
import CourseCardSkeleton from "../Components/CourseCardSkeleton";
import EmptyCoursesState from "../Components/EmptyCoursesState";
import SessionSemesterDialog from "../Components/SessionSemesterDialog";
import { Api } from "../api/index";
import { useEffect, useState } from "react";

const Home = () => {
  const api = new Api();
  // Get current academic year for default selection
  const getCurrentAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const academicYear = currentMonth >= 9 ? currentYear : currentYear - 1;
    return `${academicYear}/${academicYear + 1}`;
  };

  // Set default values to match SessionSemesterDialog defaults
  const [selectedSession, setSelectedSession] = useState<string>(
    getCurrentAcademicYear()
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("1ST");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          // Add a small delay to ensure token is available
          await new Promise((resolve) => setTimeout(resolve, 100));

          const response = await api.GetCourses(
            selectedSession,
            selectedSemester
          );
          if (response.data) {
            console.log("Courses loaded:", response.data);
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
      <div className="flex-1 pt-10 px-7 md:px-12 lg:px-15 xl:px-20 flex flex-col gap-10  overflow-y-auto pb-10">
        <div className="md:flex justify-between items-center">
          <p className="text-2xl mb-5 font-bold">Available Courses</p>
          <SessionSemesterDialog
            onSelectionChange={handleSessionSemesterChange}
          />
        </div>

        {/* Session and Semester Selection */}

        {isLoading ? (
          // Show skeleton loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          // Show actual courses
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <CourseCards
                key={course.id || index}
                courseCode={course.course_code}
                courseTitle={course.title}
              />
            ))}
          </div>
        ) : (
          // Show empty state
          <EmptyCoursesState />
        )}
      </div>
    </div>
  );
};

export default Home;
