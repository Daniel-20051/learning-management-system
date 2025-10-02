import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Api } from "@/api";
import SessionSemesterDialog from "@/Components/SessionSemesterDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import { BarChart3, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseData {
  id: string;
  course_code: string;
  title: string;
  course_level: string;
  semester: string;
  session: string;
  enrolled_students?: number;
  total_modules?: number;
  total_units?: number;
  created_at?: string;
  status?: string;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const api = new Api();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase().trim();
    return courses.filter((course) => {
      const courseCode = String(course.course_code || "").toLowerCase();
      const courseTitle = String(course.title || "").toLowerCase();
      const courseLevel = String(course.course_level || "").toLowerCase();

      return (
        courseCode.includes(query) ||
        courseTitle.includes(query) ||
        courseLevel.includes(query)
      );
    });
  }, [courses, searchQuery]);

  const handleSessionChange = async (session: string) => {
    setError("");
    setIsSessionLoading(true);
    setIsLoading(true);
    setHasLoaded(false);

    try {
      const response = await api.GetStaffCourses(session);
      const data = response?.data?.data ?? response?.data ?? [];
      setCourses(Array.isArray(data) ? data : []);
      setHasLoaded(true);
    } catch (err: any) {
      setError(err?.message || "Failed to load courses. Please try again.");
      console.error("Error fetching courses:", err);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
      setIsSessionLoading(false);
    }
  };

  const handleViewQuizzes = (courseId: string) => {
    navigate(`/admin/results/${courseId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Results Overview
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            View all your courses and their performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <SessionSemesterDialog
            onSelectionChange={handleSessionChange}
            isStaff={true}
          />
        </div>
      </div>

      {/* Search and Table */}
      <Card className="pt-3">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Course Results</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 text-center py-4">{error}</div>
          )}

          {isLoading || isSessionLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin"></div>
              <span className="ml-2 text-muted-foreground">
                {isSessionLoading ? "Loading session..." : "Loading courses..."}
              </span>
            </div>
          ) : !hasLoaded ? (
            <div className="text-center py-8 text-muted-foreground">
              Please select a session to view courses.
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No courses found matching your search."
                : "No courses available for the selected session."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Students</TableHead>

                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.course_code || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={course.title}>
                          {course.title || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {course.course_level || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {course.enrolled_students || 0}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Button onClick={() => handleViewQuizzes(course.id)}>
                          View Quizzes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;
