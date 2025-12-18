import Navbar from "@/Components/navbar";
import { Api } from "@/api/index";
import { useEffect, useState, useMemo } from "react";
import type { MarketplaceTutor, MarketplaceProgram } from "@/api/marketplace";
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
import { BookOpen, Search, Filter } from "lucide-react";
import { Skeleton } from "@/Components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import PurchaseCourseDialog from "./components/PurchaseCourseDialog";

interface Instructor {
  id: number;
  name: string;
  email?: string;
  [key: string]: any;
}

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
  owner_id: number;
  owner_type: string;
  is_marketplace: boolean;
  marketplace_status: string | null;
  is_owned?: boolean;
  requires_purchase: boolean;
  purchase_endpoint?: string;
  instructor?: Instructor;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters: Record<string, any>;
}

const AllCoursesPage = () => {
  const api = new Api();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>(""); // Format: "owner_id:owner_type" or "wpu" for WPU
  const [tutors, setTutors] = useState<MarketplaceTutor[]>([]);
  const [isLoadingTutors, setIsLoadingTutors] = useState<boolean>(false);
  const [programs, setPrograms] = useState<MarketplaceProgram[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState<boolean>(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const pageLimit = 20;
  
  // Dialog state
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currency, setCurrency] = useState<string>("NGN");

  // Group courses by level
  const coursesByLevel = useMemo(() => {
    const grouped: { [key: number]: Course[] } = {};
    courses.forEach((course) => {
      if (!grouped[course.course_level]) {
        grouped[course.course_level] = [];
      }
      grouped[course.course_level].push(course);
    });
    return grouped;
  }, [courses]);

  const sortedLevels = useMemo(() => {
    return Object.keys(coursesByLevel)
      .map(Number)
      .sort((a, b) => a - b);
  }, [coursesByLevel]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params: {
        level?: string;
        program_id?: string;
        owner_id?: number | null;
        owner_type?: "sole_tutor" | "organization" | "wpu";
        search?: string;
        page?: number;
        limit?: number;
      } = {
        page: currentPage,
        limit: pageLimit,
      };

      if (levelFilter && levelFilter !== "all") params.level = levelFilter;
      if (programFilter && programFilter !== "all") params.program_id = programFilter;
      
      // Parse owner filter: format is "owner_id:owner_type" or "wpu"
      if (ownerFilter && ownerFilter !== "all") {
        if (ownerFilter === "wpu") {
          params.owner_type = "wpu";
          params.owner_id = null;
        } else {
          const [ownerId, ownerType] = ownerFilter.split(":");
          if (ownerId && ownerType) {
            params.owner_id = parseInt(ownerId);
            params.owner_type = ownerType as "sole_tutor" | "organization";
          }
        }
      }
      
      if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();

      const response = await api.marketplace.GetMarketplaceCourses(params);
      if (response.data && response.data.data) {
        setCourses(response.data.data);
        if (response.data.meta) {
          setPaginationMeta(response.data.meta);
        }
      } else {
        setCourses([]);
        setPaginationMeta(null);
      }
    } catch (error) {
      console.error("Error fetching marketplace courses:", error);
      setCourses([]);
      setPaginationMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTutors = async () => {
    setIsLoadingTutors(true);
    try {
      const response = await api.marketplace.GetMarketplaceTutors();
      if (response.data && response.data.data) {
        setTutors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching marketplace tutors:", error);
    } finally {
      setIsLoadingTutors(false);
    }
  };

  const fetchPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      const response = await api.marketplace.GetMarketplacePrograms();
      if (response.data && response.data.data) {
        setPrograms(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching marketplace programs:", error);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  // Debounce search query to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search changes
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [levelFilter, programFilter, ownerFilter, currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchCurrency();
    fetchTutors();
    fetchPrograms();
  }, []);

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



  const handlePurchase = (course: Course) => {
    setSelectedCourse(course);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseSuccess = async () => {
    // Refresh the course list after successful purchase
    await fetchCourses();
    setPurchaseDialogOpen(false);
  };

  // Common course levels for filter
  const availableLevels = [100, 200, 300, 400, 500, 600];

  

  // Course Card Component
  const CourseCard = ({ course }: { course: Course }) => {
    const isOwned = course.is_owned === true;
    const displayCurrency = course.currency || currency;

    return (
      <Card className="overflow-hidden h-full flex flex-col">
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
          <div className="absolute top-2.5 right-2.5 flex gap-1">
            {isOwned && (
              <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">
                Owned
              </Badge>
            )}
          </div>
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
          {course.instructor && (
            <p className="text-muted-foreground text-xs mt-1">
              Instructor: {course.instructor.name}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {displayCurrency === "NGN" ? "₦" : "$"}{course.price.toLocaleString()}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-2 px-4 pb-4">
          {isOwned ? (
            <Button
              size="sm"
              className="w-full text-sm bg-green-600 hover:bg-green-700"
              disabled
            >
              Already Owned
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full text-sm bg-primary"
              onClick={() => handlePurchase(course)}
            >
              Purchase
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
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Marketplace</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and purchase courses from the marketplace
            </p>
          </div>
        </div>

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
            <Select 
              value={ownerFilter || "all"} 
              onValueChange={(value) => setOwnerFilter(value === "all" ? "" : value)}
              disabled={isLoadingTutors}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Tutors/Orgs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tutors/Organizations</SelectItem>
                {tutors.map((tutor) => {
                  const value = tutor.owner_type === "wpu" 
                    ? "wpu" 
                    : `${tutor.owner_id}:${tutor.owner_type}`;
                  return (
                    <SelectItem key={value} value={value}>
                      {tutor.display_name} ({tutor.course_count} {tutor.course_count === 1 ? 'course' : 'courses'})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select 
              value={programFilter || "all"} 
              onValueChange={(value) => setProgramFilter(value === "all" ? "" : value)}
              disabled={isLoadingPrograms}
            >
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={String(program.id)}>
                    {program.title} {program.faculty && `(${program.faculty.name})`} ({program.course_count} {program.course_count === 1 ? 'course' : 'courses'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(levelFilter || programFilter || ownerFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLevelFilter("");
                  setProgramFilter("");
                  setOwnerFilter("");
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
        ) : courses.length > 0 ? (
          <>
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

            {/* Pagination */}
            {paginationMeta && paginationMeta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!paginationMeta.hasPrevPage || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {paginationMeta.page} of {paginationMeta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(paginationMeta.totalPages, prev + 1))}
                  disabled={!paginationMeta.hasNextPage || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
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
              No marketplace courses available
            </h3>
            <p className="text-sm text-muted-foreground">
              There are no published marketplace courses available at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Purchase Course Dialog */}
      <PurchaseCourseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        course={selectedCourse}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

    </div>
  );
};

export default AllCoursesPage;
