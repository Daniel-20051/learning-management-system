import Navbar from "@/Components/navbar";
import { Api } from "@/api/index";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { BookOpen, Search, GraduationCap, Filter } from "lucide-react";
import { Skeleton } from "@/Components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";

interface Course {
  id: number;
  title: string;
  course_code: string;
  course_unit: number;
  course_type: string;
  course_level: number;
  semester: string;
  price: number;
  exam_fee: number | null;
  staff_id: number;
  owner_type: string;
  is_marketplace: boolean;
  marketplace_status: string | null;
  requires_purchase: boolean;
}

const AllCoursesPage = () => {
  const api = new Api();
  const navigate = useNavigate();
  const { selectedSession, selectedSemester } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [facultyFilter, setFacultyFilter] = useState<string>("");

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase().trim();
    return courses.filter((course) => {
      const courseCode = course.course_code.toLowerCase();
      const courseTitle = course.title.toLowerCase();
      const courseLevel = String(course.course_level);

      return (
        courseCode.includes(query) ||
        courseTitle.includes(query) ||
        courseLevel.includes(query)
      );
    });
  }, [courses, searchQuery]);

  // Group courses by level
  const coursesByLevel = useMemo(() => {
    const grouped: { [key: number]: Course[] } = {};
    filteredCourses.forEach((course) => {
      if (!grouped[course.course_level]) {
        grouped[course.course_level] = [];
      }
      grouped[course.course_level].push(course);
    });
    return grouped;
  }, [filteredCourses]);

  const sortedLevels = useMemo(() => {
    return Object.keys(coursesByLevel)
      .map(Number)
      .sort((a, b) => a - b);
  }, [coursesByLevel]);

  const isWSPCourse = (course: Course) => {
    return course.owner_type === "wsp";
  };

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params: { level?: string; program_id?: string; faculty_id?: string } = {};
      if (levelFilter && levelFilter !== "all") params.level = levelFilter;
      if (programFilter && programFilter !== "all") params.program_id = programFilter;
      if (facultyFilter && facultyFilter !== "all") params.faculty_id = facultyFilter;

      const response = await api.GetAvailableCourses(Object.keys(params).length > 0 ? params : undefined);
      if (response.data && response.data.data) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching available courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [levelFilter, programFilter, facultyFilter]);

  const handleRegister = async (course: Course) => {
    if (!selectedSession || !selectedSemester) {
      toast.error("Please select a session and semester first");
      return;
    }

    setIsRegistering(course.id);
    try {
      const response = await api.RegisterCourse({
        course_id: course.id,
        academic_year: selectedSession,
        semester: selectedSemester,
        level: String(course.course_level),
      });

      if (response.data && response.data.status) {
        toast.success(
          response.data.message || "Course registered successfully!"
        );
        
        // Refresh the course list
        await fetchCourses();
        
        // Redirect to course page after a short delay
        setTimeout(() => {
          navigate(`/unit/${course.id}`);
        }, 1500);
      } else {
        toast.error(
          response.data?.message || "Failed to register for course"
        );
      }
    } catch (error: any) {
      console.error("Error registering for course:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while registering for the course";
      toast.error(errorMessage);
    } finally {
      setIsRegistering(null);
    }
  };

  const handlePurchase = (courseId: number) => {
    // TODO: Implement course purchase logic
    toast.info("Purchase functionality coming soon");
    console.log("Purchasing course:", courseId);
  };

  // Get unique levels from all courses for filter dropdown
  const availableLevels = useMemo(() => {
    const levels = Array.from(new Set(courses.map(c => c.course_level))).sort((a, b) => a - b);
    return levels;
  }, [courses]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-4 md:pt-8 px-4 md:px-7 lg:px-12 xl:px-20 flex flex-col gap-4 md:gap-8 overflow-y-auto pb-6 md:pb-10">
        {/* Header */}
        <Card className="bg-gradient-to-br py-4 md:py-6 from-blue-900 via-blue-800 to-blue-700 text-white border-0">
          <CardContent className="px-4 md:px-6 lg:px-8">
            <div className="flex flex-col gap-2 md:gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                    All Available Courses
                  </h1>
                  <p className="text-sm md:text-base text-white/80">
                    Browse all courses offered by the institution
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

       

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={levelFilter || "all"} onValueChange={(value) => setLevelFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {availableLevels.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={programFilter || "all"} onValueChange={(value) => setProgramFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="1">Computer Science</SelectItem>
                <SelectItem value="2">Information Technology</SelectItem>
                <SelectItem value="3">Software Engineering</SelectItem>
                <SelectItem value="4">Data Science</SelectItem>
                <SelectItem value="5">Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
            {(levelFilter || programFilter || facultyFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLevelFilter("");
                  setProgramFilter("");
                  setFacultyFilter("");
                }}
                className="h-9"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by course code, title, or level"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Course Listing */}
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-64 w-full" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="space-y-6 md:space-y-8">
            {sortedLevels.map((level) => (
              <div key={level} className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Level {level}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {coursesByLevel[level].length} course
                    {coursesByLevel[level].length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Course Code</TableHead>
                            <TableHead>Course Title</TableHead>
                            <TableHead className="w-[80px] text-center">Units</TableHead>
                            <TableHead className="w-[100px] text-center">Semester</TableHead>
                            <TableHead className="w-[80px] text-center">Type</TableHead>
                            <TableHead className="w-[100px] text-center">Status</TableHead>
                            <TableHead className="w-[120px] text-right">Price</TableHead>
                            <TableHead className="w-[100px] text-right">Exam Fee</TableHead>
                            <TableHead className="w-[120px] text-center">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {coursesByLevel[level].map((course) => (
                            <TableRow key={course.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {course.course_code}
                              </TableCell>
                              <TableCell className="font-medium">{course.title}</TableCell>
                              <TableCell className="text-center">
                                {course.course_unit}
                              </TableCell>
                              <TableCell className="text-center">
                                {course.semester}
                              </TableCell>
                              <TableCell className="text-center">
                                {course.course_type === "C"
                                  ? "Core"
                                  : course.course_type === "E"
                                  ? "Elective"
                                  : course.course_type}
                              </TableCell>
                              <TableCell className="text-center">
                                {isWSPCourse(course) ? (
                                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                    FREE
                                  </Badge>
                                ) : course.is_marketplace ? (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    Marketplace
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Standard</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {isWSPCourse(course) ? (
                                  <span className="text-green-600">Free</span>
                                ) : (
                                  <span className="text-blue-700">
                                    ₦{course.price.toLocaleString()}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {course.exam_fee
                                  ? `₦${course.exam_fee.toLocaleString()}`
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {isWSPCourse(course) ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleRegister(course)}
                                    disabled={isRegistering === course.id || !selectedSession || !selectedSemester}
                                  >
                                    {isRegistering === course.id ? "Registering..." : "Register"}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handlePurchase(course.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Purchase
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses available
            </h3>
            <p className="text-sm text-muted-foreground">
              There are no courses available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCoursesPage;

