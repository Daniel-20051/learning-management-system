import Navbar from "../Components/navbar";
import CourseCards from "../Components/courseCards";
import Alerts from "../Components/Alerts";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/Components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col max-h-screen ">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-10 px-7 md:px-12 lg:px-15 xl:px-20 flex flex-col gap-10  overflow-y-auto pb-10">
        <Alerts />
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold">Available Courses</p>
          {isAdmin && (
            <Button
              onClick={() => navigate("/admin")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </Button>
          )}
        </div>
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
