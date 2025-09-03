import Navbar from "../Components/navbar";
import CourseCards from "../Components/courseCards";
import CourseCardSkeleton from "../Components/CourseCardSkeleton";
import EmptyCoursesState from "../Components/EmptyCoursesState";
import SessionSemesterDialog from "../Components/SessionSemesterDialog";
import { Api } from "../api/index";
import { useEffect, useState } from "react";

const Home = () => {
  const api = new Api();

  // Set default values to match SessionSemesterDialog defaults
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
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
