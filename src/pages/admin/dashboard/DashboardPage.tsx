import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import SessionSemesterDialog from "@/Components/SessionSemesterDialog";
import {
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Award,
  ArrowRight,
  Activity,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
}

const DashboardPage = () => {
  const api = new Api();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedSession, selectedSemester } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState<boolean>(false);

  // Get user's first name from auth context
  const userFirstName = useMemo(() => {
    if (!user) return "Admin";
    
    const fullName = user?.name?.trim();
    if (!fullName) return "Admin";
    
    // Handle names with titles (Mr, Mrs, Dr, etc.)
    const nameParts = fullName.split(" ");
    
    // Common titles to skip
    const titles = ["mr", "mrs", "ms", "dr", "prof", "professor"];
    
    // Find the first non-title word
    for (const part of nameParts) {
      const lowerPart = part.toLowerCase().replace(/[.,]/g, ""); // Remove punctuation
      if (!titles.includes(lowerPart) && part.length > 1) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      }
    }
    
    // If all parts are titles or single characters, use the last part
    const lastPart = nameParts[nameParts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
  }, [user]);

  // Calculate stats from actual data
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = students.length;
    
    // Calculate course levels distribution
    const courseLevels = courses.reduce((acc: any, course: any) => {
      const level = course.course_level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Calculate total units from courses
    const totalUnits = courses.reduce((sum: number, course: any) => {
      return sum + (parseInt(course.course_unit) || 0);
    }, 0);

    return {
      totalCourses,
      totalStudents,
      totalUnits,
      courseLevels,
    };
  }, [courses, students]);


  // Quick actions for easy navigation
  const quickActions: QuickAction[] = [
    {
      id: "my-courses",
      title: "My Courses",
      description: "View and manage your courses",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/admin/courses",
      color: "bg-blue-500",
    },
    {
      id: "view-results",
      title: "View Results",
      description: "Check student performance",
      icon: <BarChart3 className="h-5 w-5" />,
      path: "/admin/results",
      color: "bg-green-500",
    },
    {
      id: "discussions",
      title: "Discussions",
      description: "Manage course discussions",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/admin/discussions",
      color: "bg-purple-500",
    },
    {
      id: "quizzes",
      title: "Quiz Management",
      description: "Create and manage quizzes",
      icon: <Award className="h-5 w-5" />,
      path: "/admin/quiz",
      color: "bg-orange-500",
    },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedSession) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch courses
        const coursesResponse = await api.GetStaffCourses(selectedSession);
        const coursesData = coursesResponse?.data?.data ?? coursesResponse?.data ?? [];
        const coursesList = Array.isArray(coursesData) ? coursesData : [];
        setCourses(coursesList);

        // Fetch students (optional - only if you want to show total students)
        setIsStudentsLoading(true);
        try {
          const studentsResponse = await api.GetStudents();
          const studentsData = (studentsResponse as any)?.data?.data?.students ?? (studentsResponse as any)?.data?.data ?? (studentsResponse as any)?.data ?? [];
          const studentsList = Array.isArray(studentsData) ? studentsData : [];
          setStudents(studentsList);
        } catch (studentsError) {
          setStudents([]);
        } finally {
          setIsStudentsLoading(false);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedSession, selectedSemester]);

  const handleSessionChange = (_session: string, _semester: string) => {
    // This will trigger the useEffect above
  };

  const StatCard = ({
    title,
    value,
    icon,
    description,
    color = "text-blue-600",
    bgColor = "bg-blue-50",
    isLoading: cardLoading = false,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactElement;
    description?: string;
    color?: string;
    bgColor?: string;
    isLoading?: boolean;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">
              {isLoading || cardLoading ? "--" : value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg ${bgColor} flex items-center justify-center`}>
            <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userFirstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your courses today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SessionSemesterDialog
            onSelectionChange={handleSessionChange}
            isStaff={true}
          />
        </div>
      </div>

      {/* Session Info */}
      {selectedSession && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="flex items-center gap-4 text-sm">
                <span>
                  <strong>Session:</strong> {selectedSession}
                </span>
                {selectedSemester && (
                  <>
                    <span>•</span>
                    <span>
                      <strong>Semester:</strong> {selectedSemester}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="h-6 w-6" />}
          description={`for ${selectedSession || 'selected session'}`}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="h-6 w-6" />}
          description="registered in system"
          color="text-green-600"
          bgColor="bg-green-50"
          isLoading={isStudentsLoading}
        />
        <StatCard
          title="Total Course Units"
          value={stats.totalUnits}
          icon={<GraduationCap className="h-6 w-6" />}
          description="across all courses"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      <div className="flex">
        {/* Quick Actions */}
        <Card className="pt-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Course Level Distribution */}
        {Object.keys(stats.courseLevels).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Course Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.courseLevels).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Level {level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count as number} courses</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(((count as number) / stats.totalCourses) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Overview */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Courses
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/courses")}
              >
                View All Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <Card 
                  key={course.id} 
                  className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {course.course_code}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Level {course.course_level}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {course.semester} • {course.course_unit} units
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {course.session}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {course.course_type || 'Course'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {courses.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" onClick={() => navigate("/admin/courses")}>
                  View {courses.length - 6} more courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      
    </div>
  );
};

export default DashboardPage;