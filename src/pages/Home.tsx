import Navbar from "../Components/navbar";
import CourseCards from "../Components/courseCards";
import Alerts from "../Components/Alerts";

const Home = () => {
  return (
    <div className="flex flex-col max-h-screen ">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-10 px-7 md:px-12 lg:px-15 xl:px-20 flex flex-col gap-10  overflow-y-auto pb-10">
        <Alerts />
        <p className="text-2xl font-bold">Available Courses</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <CourseCards />
          <CourseCards />
          <CourseCards />
          <CourseCards />
          <CourseCards />
          <CourseCards />
        </div>
      </div>
    </div>
  );
};

export default Home;
