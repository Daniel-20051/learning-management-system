import Analytics from "@/Components/admin/Analytics";
import { dummyCourses } from "@/lib/adminData";

const AnalyticsPage = () => {
  return <Analytics courses={dummyCourses} />;
};

export default AnalyticsPage;
