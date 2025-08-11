import CourseList from "@/Components/admin/CourseList";
import { dummyCourses } from "@/lib/adminData";

const CoursesPage = () => {
  return <CourseList courses={dummyCourses} />;
};

export default CoursesPage;
