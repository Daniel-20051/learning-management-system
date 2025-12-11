import Navbar from "@/Components/navbar";
import { Api } from "@/api/index";
import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { BookOpen, Search, Filter, Loader2 } from "lucide-react";
import { Skeleton } from "@/Components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import RegisterCourseDialog from "./components/RegisterCourseDialog";
import PurchaseCourseDialog from "./components/PurchaseCourseDialog";
import MultipleCourseRegistrationDialog from "./components/MultipleCourseRegistrationDialog";

interface Course {
  id: number;
  title: string;
  course_code: string;
  course_unit: number;
  course_type: string;
  course_level: number;
  semester: string;
  price: number;
  currency?: string;
  exam_fee: number | null;
  staff_id: number;
  owner_type: string;
  is_marketplace: boolean;
  marketplace_status: string | null;
  requires_purchase: boolean;
  purchase_endpoint?: string;
}

const AllCoursesPage = () => {
  const api = new Api();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [facultyFilter, setFacultyFilter] = useState<string>("");
  
  // Dialog state
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [multipleRegisterDialogOpen, setMultipleRegisterDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [currency, setCurrency] = useState<string>("NGN");

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

  const isFreeCourse = (course: Course) => {
    // Use requires_purchase flag if available, otherwise fall back to price check
    if (course.hasOwnProperty('requires_purchase')) {
      return !course.requires_purchase;
    }
    return course.owner_type === "wsp" || course.price === 0 || Number(course.price) === 0;
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
    fetchCurrency();
  }, [levelFilter, programFilter, facultyFilter]);

  // Fetch currency from user profile
  const fetchCurrency = async () => {
    try {
      const response = await api.getUserProfile();
      const profileData = response as any;
      if (profileData?.data?.success || profileData?.data?.status) {
        const userData = profileData?.data?.data?.user;
        if (userData?.currency) {
          setCurrency(userData.currency || "NGN");
        }
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
    }
  };

  // Get selected courses
  const selectedCourses = useMemo(() => {
    return courses.filter((c) => selectedCourseIds.includes(c.id));
  }, [courses, selectedCourseIds]);

  // Calculate total for selected courses
  const selectedTotal = useMemo(() => {
    return selectedCourses.reduce((sum, course) => {
      return sum + (parseFloat(String(course.price)) || 0);
    }, 0);
  }, [selectedCourses]);

  // Toggle course selection
  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourseIds((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Handle multiple course registration success
  const handleMultipleRegistrationSuccess = async () => {
    setSelectedCourseIds([]);
    await fetchCourses();
    await fetchWalletBalance();
  };

  // Open the registration dialog
  const openRegisterDialog = (course: Course) => {
    setSelectedCourse(course);
    setRegisterDialogOpen(true);
  };

  // Handle actual registration from dialog
  const handleRegister = async (
    courseId: number,
    session: string,
    semester: string,
    level: string
  ) => {
    setIsRegistering(courseId);
    try {
      const response = await api.RegisterCourse({
        course_id: courseId,
        academic_year: session,
        semester: semester,
        level: level,
      });

      if (response.data && response.data.status) {
        toast.success(
          response.data.message || "Course registered successfully!"
        );
        
        // Refresh the course list
        await fetchCourses();
        
        // Redirect to course page after a short delay
        setTimeout(() => {
          navigate(`/unit/${courseId}`);
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
      
      // Check if this is a marketplace course error
      if (errorMessage.toLowerCase().includes("marketplace") || 
          errorMessage.toLowerCase().includes("purchase")) {
        // Close registration dialog and open purchase dialog
        setRegisterDialogOpen(false);
        const course = courses.find(c => c.id === courseId);
        if (course) {
          setSelectedCourse(course);
          setPurchaseDialogOpen(true);
          toast.info("This course requires purchase. Opening purchase dialog...");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
      throw error; // Re-throw to let dialog handle it
    } finally {
      setIsRegistering(null);
    }
  };

  const handlePurchase = (course: Course) => {
    setSelectedCourse(course);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseSuccess = async () => {
    // Refresh the course list after successful purchase
    await fetchCourses();
    setPurchaseDialogOpen(false);
  };

  // Get unique levels from all courses for filter dropdown
  const availableLevels = useMemo(() => {
    const levels = Array.from(new Set(courses.map(c => c.course_level))).sort((a, b) => a - b);
    return levels;
  }, [courses]);

  

  // Course Card Component
  const CourseCard = ({ course }: { course: Course }) => {
    const isFree = isFreeCourse(course);
    const requiresPurchase = course.requires_purchase || false;
    const isCurrentlyRegistering = isRegistering === course.id;
    const isMarketplace = course.is_marketplace && course.marketplace_status === "published";
    const isSelected = selectedCourseIds.includes(course.id);
    const canSelect = !requiresPurchase; // Only allow selection of non-marketplace courses

    return (
      <Card className={`overflow-hidden h-full flex flex-col ${isSelected ? "ring-2 ring-primary" : ""}`}>
        {/* Header gradient with badges */}
        <div className="w-full h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 relative">
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/20 text-xs px-2 py-0.5"
            >
              {course.course_code}
            </Badge>
          </div>
          {isMarketplace && (
            <div className="absolute top-2.5 right-2.5">
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                Marketplace
              </Badge>
            </div>
          )}
          {canSelect && (
            <div className="absolute top-2.5 right-2.5">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleCourseSelection(course.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>

        <CardHeader className="pb-1 px-4 pt-4">
          <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
            {course.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0 px-4 pb-2 flex-1">
          <p className="text-muted-foreground text-sm">
            Level {course.course_level} · {course.course_unit} Unit{course.course_unit !== 1 ? "s" : ""} · {course.semester}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {isFree && !requiresPurchase ? (
              <Badge className="bg-green-100 text-green-700 text-xs">FREE</Badge>
            ) : (
              <span className="text-sm font-medium text-blue-700">
                {currency === "NGN" ? "₦" : currency}{course.price.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 px-4 pb-4">
          {requiresPurchase ? (
            <Button
              size="sm"
              className="w-full text-sm bg-primary"
              onClick={() => handlePurchase(course)}
            >
              Purchase
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full bg-primary text-sm"
              onClick={() => openRegisterDialog(course)}
              disabled={isCurrentlyRegistering}
            >
              {isCurrentlyRegistering ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-20" />
      <CardHeader className="pb-1 px-4 pt-4">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-2">
        <Skeleton className="h-4 w-1/2 mt-1" />
        <Skeleton className="h-5 w-16 mt-2" />
      </CardContent>
      <CardFooter className="pt-2 px-4 pb-4">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-4 md:pt-8 px-4 md:px-7 lg:px-12 xl:px-20 flex flex-col gap-4 md:gap-6 overflow-y-auto pb-6 md:pb-10">
        {/* Selection Summary Bar */}
        {selectedCourseIds.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">
                {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? "s" : ""} selected
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                Total: {currency === "NGN" ? "₦" : currency}{selectedTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCourseIds([])}
              >
                Clear Selection
              </Button>
              <Button
                size="sm"
                onClick={() => setMultipleRegisterDialogOpen(true)}
                disabled={selectedCourseIds.length === 0}
              >
                Register Selected
              </Button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={levelFilter || "all"} onValueChange={(value) => setLevelFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[140px] h-9">
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
              <SelectTrigger className="w-[180px] h-9">
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
          <div className="relative w-full md:w-auto md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Course Listing */}
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, cardIdx) => (
                    <SkeletonCard key={cardIdx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="space-y-6">
            {sortedLevels.map((level) => (
              <div key={level} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-semibold">
                    Level {level}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {coursesByLevel[level].length} course
                    {coursesByLevel[level].length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {coursesByLevel[level].map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
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

      {/* Register Course Dialog */}
      <RegisterCourseDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        course={selectedCourse}
        onRegister={handleRegister}
      />

      {/* Purchase Course Dialog */}
      <PurchaseCourseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        course={selectedCourse}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {/* Multiple Course Registration Dialog */}
      <MultipleCourseRegistrationDialog
        open={multipleRegisterDialogOpen}
        onOpenChange={setMultipleRegisterDialogOpen}
        selectedCourses={selectedCourses}
        onRegistrationSuccess={handleMultipleRegistrationSuccess}
      />
    </div>
  );
};

export default AllCoursesPage;
