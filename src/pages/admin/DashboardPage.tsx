import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/Components/admin/Dashboard";
import { dummyCourses } from "@/lib/adminData";

const DashboardPage = () => {
  const { user } = useAuth();

  return <Dashboard user={user} courses={dummyCourses} />;
};

export default DashboardPage;
