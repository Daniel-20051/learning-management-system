import Navbar from "../../../Components/navbar";
import CourseCards from "./components/courseCards";
import CourseCardSkeleton from "./components/CourseCardSkeleton";
import EmptyCoursesState from "./components/EmptyCoursesState";
import SessionSemesterDialog from "../../../Components/SessionSemesterDialog";
import NoticeSlider from "./components/NoticeSlider";
import UnpaidCoursesAlert from "./components/UnpaidCoursesAlert";
import CourseTypeFilter from "./components/CourseTypeFilter";
import { lazy, Suspense } from "react";

// Lazy load heavy dialog components
const NoticeDetailsDialog = lazy(() => import("./components/NoticeDetailsDialog"));
const UploadDocumentsDialog = lazy(() => import("./components/UploadDocumentsDialog"));
const PurchaseCourseDialog = lazy(() => import("../all-courses/components/PurchaseCourseDialog"));
import { Api } from "../../../api/index";
import { AuthApi } from "../../../api/auth";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Alert, AlertTitle } from "@/Components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { BookOpen, CheckCircle2, Clock, Search, AlertCircle, Upload, Loader2 } from "lucide-react";
import type { Notice } from "@/api/notices";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type CourseType = "allocated" | "marketplace" | "degree_programs" | "my_courses" | "certificate_courses";

const Home = () => {
  const api = new Api();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedSession, selectedSemester, setSessionAndSemester } =
    useSession();

  // Check if user account is active - specifically check for status === "active"
  const isAccountActive = user?.status === "active";
  const isPendingUser = user?.status === "pending";

  const [courses, setCourses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [showUnpaidAlert, setShowUnpaidAlert] = useState(true);
  const [uploadDocumentsDialogOpen, setUploadDocumentsDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCourseForPurchase, setSelectedCourseForPurchase] = useState<any>(null);
  const [kycDocuments, setKycDocuments] = useState<Record<string, {
    url: string | null;
    status: string | null;
    rejection_reason: string | null;
    reviewed_at: string | null;
  }> | null>(null);
  const [loadingKycDocuments, setLoadingKycDocuments] = useState(false);
  const [userProgramId, setUserProgramId] = useState<number | null>(null);
  const [isApplyingToProgram, setIsApplyingToProgram] = useState(false);
  const [confirmApplyDialogOpen, setConfirmApplyDialogOpen] = useState(false);
  const [selectedProgramForApply, setSelectedProgramForApply] = useState<any>(null);
  // Default based on user status
  const [courseType, setCourseType] = useState<CourseType>(
    isPendingUser ? "degree_programs" : (isAccountActive ? "allocated" : "marketplace")
  );

  // Derive first name from authenticated user
  const userFirstName = useMemo(() => {
    const fullName = user?.name?.trim() || "";
    if (!fullName) return "Student";
    return fullName.split(" ")[0];
  }, [user?.name]);

  // Get heading text based on course type
  const getHeadingText = useMemo(() => {
    if (isPendingUser) {
      switch (courseType) {
        case "degree_programs":
          return "Degree Programs";
        case "my_courses":
          return "My Courses";
        case "certificate_courses":
          return "Certificate Courses";
        default:
          return "My Courses";
      }
    } else {
      switch (courseType) {
        case "allocated":
          return "My Courses";
        case "marketplace":
          return "Marketplace Courses";
        default:
          return "My Courses";
      }
    }
  }, [courseType, isPendingUser]);

  // Separate paid and unpaid courses (only for allocated courses)
  // Only show courses where paid === true (strict check)
  const { paidCourses, allCoursesUnpaid } = useMemo(() => {
    // For marketplace, my_courses, and certificate_courses, show all courses
    if (courseType === "marketplace" || courseType === "my_courses" || courseType === "certificate_courses") {
      return { paidCourses: courses, allCoursesUnpaid: false };
    }

    // For allocated courses, filter by paid status
    const paid: any[] = [];
    
    courses.forEach((course) => {
      // Strict check: only true (boolean or string "true") is considered paid
      const paidValue = course.paid;
      const isPaid = paidValue === true || paidValue === "true" || String(paidValue).toLowerCase() === "true";
      
      if (isPaid) {
        paid.push(course);
      }
    });
    
    // Check if ALL courses are unpaid (no course has paid === true)
    const allUnpaid = courses.length > 0 && paid.length === 0;
    
    return { paidCourses: paid, allCoursesUnpaid: allUnpaid };
  }, [courses, courseType]);

  // Filter paid courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return paidCourses;

    const query = searchQuery.toLowerCase().trim();
    return paidCourses.filter((course) => {
      const courseCode =
        typeof course.course_code === "string"
          ? course.course_code.toLowerCase()
          : "";
      const courseTitle =
        typeof course.title === "string" ? course.title.toLowerCase() : "";
      const courseLevel =
        typeof course.course_level === "string"
          ? course.course_level.toLowerCase()
          : String(course.course_level || "").toLowerCase();

      return (
        courseCode.includes(query) ||
        courseTitle.includes(query) ||
        courseLevel.includes(query)
      );
    });
  }, [paidCourses, searchQuery]);

  // Fetch user profile to get program_id
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || user.role !== "student") return;
      
      try {
        const authApi = new AuthApi();
        const response: any = await authApi.getUserProfile();
        const userData = response?.data?.data?.user || response?.data?.user;
        
        if (userData?.program_id) {
          setUserProgramId(userData.program_id);
          // If user has program_id and is on degree_programs, switch to my_courses
          if (isPendingUser && courseType === "degree_programs") {
            setCourseType("my_courses");
          }
        } else {
          setUserProgramId(null);
        }
      } catch (err: any) {
        console.error("Error loading user profile:", err);
        setUserProgramId(null);
      }
    };

    fetchUserProfile();
  }, [user, isPendingUser, courseType]);

  // Fetch KYC documents on component mount
  useEffect(() => {
    const fetchKycDocuments = async () => {
      if (!user || user.role !== "student") return;
      
      try {
        setLoadingKycDocuments(true);
        const authApi = new AuthApi();
        const response: any = await authApi.getKycDocuments();
        
        if (response?.data?.success && response?.data?.data?.documents) {
          // Transform the documents object to match our state structure
          const documents: Record<string, {
            url: string | null;
            status: string | null;
            rejection_reason: string | null;
            reviewed_at: string | null;
          }> = {};
          
          Object.entries(response.data.data.documents).forEach(([key, value]: [string, any]) => {
            documents[key] = {
              url: value?.url || null,
              status: value?.status || null,
              rejection_reason: value?.rejection_reason || null,
              reviewed_at: value?.reviewed_at || null,
            };
          });
          
          setKycDocuments(documents);
        }
      } catch (err: any) {
        console.error("Error loading KYC documents:", err);
        // Don't show error, just continue
      } finally {
        setLoadingKycDocuments(false);
      }
    };

    fetchKycDocuments();
  }, [user]);

  // Check document statuses for alert messages
  // Exclude optional fields (resume_cv and other_file) from the check
  const documentStatusInfo = useMemo(() => {
    if (!kycDocuments) return { hasRejected: false, hasPending: false, allApproved: false, allNull: false };
    
    // Filter out optional fields
    const requiredDocumentTypes = ["birth_certificate", "ref_letter", "valid_id", "certificate_file"];
    const requiredDocuments = Object.entries(kycDocuments)
      .filter(([key]) => requiredDocumentTypes.includes(key))
      .map(([, value]) => value);
    
    const hasRejected = requiredDocuments.some((doc) => doc.status === "rejected");
    const hasPending = requiredDocuments.some((doc) => doc.status === "pending");
    // Check if all required documents are approved (have status "approved" and a URL)
    const allApproved = requiredDocuments.length > 0 && 
      requiredDocuments.every((doc) => doc.status === "approved" && doc.url !== null);
    // Check if all required documents are null (not uploaded yet)
    const allNull = requiredDocuments.length > 0 && 
      requiredDocuments.every((doc) => doc.status === null && doc.url === null);
    
    return { hasRejected, hasPending, allApproved, allNull };
  }, [kycDocuments]);

  // Basic stat placeholders to match the dashboard vibe
  const totalCourses = paidCourses.length || 0;
  const completedCourses = 0;
  const inProgressCourses = Math.max(totalCourses - completedCourses, 0);

  const handleSessionSemesterChange = (session: string, semester: string) => {
    setSessionAndSemester(session, semester);
  };

  // Handle applying to a program
  const handleApplyToProgram = async (program: any) => {
    try {
      setIsApplyingToProgram(true);

      // First, fetch the current user profile to preserve existing data
      const authApi = new AuthApi();
      const profileResponse: any = await authApi.getUserProfile();
      const userData = profileResponse?.data?.data?.user || profileResponse?.data?.user;

      if (!userData) {
        throw new Error("Unable to fetch user profile");
      }

      // Update profile with the program_id and faculty_id
      await authApi.updateStudentProfile({
        fname: userData.fname || "",
        lname: userData.lname || "",
        mname: userData.mname || undefined,
        phone: userData.phone || undefined,
        address: userData.address || undefined,
        dob: userData.dob || undefined,
        country: userData.country || undefined,
        state_origin: userData.state_origin || undefined,
        lcda: userData.lcda || undefined,
        currency: userData.currency || undefined,
        program_id: program.id,
        facaulty_id: program.faculty_id || undefined,
      });

      // Update local state
      setUserProgramId(program.id);

      // Switch away from degree_programs view if currently on it
      if (courseType === "degree_programs") {
        setCourseType("my_courses");
      }

      // Show success message
      toast.success(`Successfully applied to ${program.title}! Please upload your documents to continue.`);

      // Open the upload documents modal
      setUploadDocumentsDialogOpen(true);
    } catch (error: any) {
      console.error("Error applying to program:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to apply to program. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsApplyingToProgram(false);
    }
  };

  // Fetch notices on component mount
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await api.GetNotices();
        if (response.data && Array.isArray(response.data)) {
          // Filter for active notices only
          const activeNotices = response.data.filter(
            (notice) => notice.status && String(notice.status).toLowerCase() === "active"
          );
          setNotices(activeNotices);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };

    fetchNotices();
  }, []);

  // Force appropriate view based on user status
  useEffect(() => {
    if (isPendingUser && (courseType === "allocated" || courseType === "marketplace")) {
      // If user has program_id, don't show degree_programs, default to my_courses
      if (userProgramId !== null) {
        setCourseType("my_courses");
      } else {
        setCourseType("degree_programs");
      }
    } else if (!isAccountActive && !isPendingUser && courseType === "allocated") {
      setCourseType("marketplace");
    }
    // If user has program_id and is on degree_programs view, switch to my_courses
    if (userProgramId !== null && courseType === "degree_programs") {
      setCourseType("my_courses");
    }
  }, [isAccountActive, isPendingUser, courseType, userProgramId]);

  // Fetch programs for pending users
  useEffect(() => {
    const fetchPrograms = async () => {
      if (isPendingUser && courseType === "degree_programs") {
        setIsLoadingPrograms(true);
        try {
          const response = await api.marketplace.GetMarketplacePrograms();
          if (response.data && response.data.data) {
            setPrograms(Array.isArray(response.data.data) ? response.data.data : []);
          } else {
            setPrograms([]);
          }
        } catch (error) {
          console.error("Error fetching programs:", error);
          setPrograms([]);
        } finally {
          setIsLoadingPrograms(false);
        }
      }
    };

    fetchPrograms();
  }, [isPendingUser, courseType]);

  // Fetch courses when course type, session/semester changes
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        if (courseType === "marketplace") {
          // For active students, fetch their purchased marketplace courses
          if (isAccountActive) {
            const response = await api.marketplace.GetMyCourses();
            if (response.data) {
              const coursesData = response.data.data || response.data;
              if (Array.isArray(coursesData)) {
                setCourses(coursesData);
              } else {
                setCourses([]);
              }
            }
          } else {
            // For inactive students, fetch marketplace courses available for purchase
            const response = await api.marketplace.GetMarketplaceCourses({
              page: 1,
              limit: 100,
            });
            if (response.data && response.data.data) {
              setCourses(Array.isArray(response.data.data) ? response.data.data : []);
            } else {
              setCourses([]);
            }
          }
        } else if (courseType === "my_courses") {
          // Fetch purchased marketplace courses
          const response = await api.marketplace.GetMyCourses();
          if (response.data) {
            const coursesData = response.data.data || response.data;
            if (Array.isArray(coursesData)) {
              setCourses(coursesData);
            } else {
              setCourses([]);
            }
          }
        } else if (courseType === "certificate_courses") {
          // Fetch marketplace courses available for purchase
          const response = await api.marketplace.GetMarketplaceCourses({
            page: 1,
            limit: 100,
          });
          if (response.data && response.data.data) {
            setCourses(Array.isArray(response.data.data) ? response.data.data : []);
          } else {
            setCourses([]);
          }
        } else if (courseType === "degree_programs") {
          // Programs are handled separately
          setCourses([]);
        } else {
          // Fetch allocated courses (requires session and semester)
          if (selectedSession && selectedSemester) {
            const response = await api.GetCourses(
              selectedSession,
              selectedSemester
            );
            if (response.data) {
              const coursesData = response.data.data || response.data;
              if (Array.isArray(coursesData)) {
                setCourses(coursesData);
              } else {
                setCourses([]);
              }
            }
          } else {
            setCourses([]);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [courseType, selectedSession, selectedSemester, isAccountActive]);

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsNoticeDialogOpen(true);
  };

  // Show loader while fetching KYC documents (only for students)
  if (user?.role === "student" && loadingKycDocuments) {
    return (
      <div className="flex flex-col min-h-screen bg-muted">
        <Navbar sidebar={false} />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar sidebar={false} />
      <div className="flex-1 pt-4 md:pt-8 px-4 md:px-7 lg:px-12 xl:px-20 flex flex-col gap-4 md:gap-8 overflow-y-auto pb-6 md:pb-10">
        {/* Notices Slider */}
        {notices.length > 0 ? (
          <NoticeSlider notices={notices} onNoticeClick={handleNoticeClick} />
        ) : (
          <Card className="bg-gradient-to-br py-4 md:py-6 from-slate-900 via-slate-800 to-slate-700 text-white border-0">
            <CardContent className="px-4 md:px-6 lg:px-8">
              <div className="flex flex-col gap-2 md:gap-4">
                <div>
                  <p className="text-sm md:text-lg text-white/80">
                    Welcome back, {userFirstName}
                  </p>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                    Keep up the excellent work!
                  </h1>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card className="py-2 md:py-3">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-md bg-blue-50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Courses
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs w-fit">
                  this semester
                </Badge>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3 text-blue-700 ml-0 md:ml-3">
                {totalCourses}
              </p>
            </CardContent>
          </Card>
          <Card className="py-2 md:py-3">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-md bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Completed
                </p>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3 text-green-700 ml-0 md:ml-3">
                {completedCourses}
              </p>
            </CardContent>
          </Card>
          <Card className="py-2 md:py-3 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-md bg-amber-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  In Progress
                </p>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3 text-amber-700 ml-0 md:ml-3">
                {inProgressCourses}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Verification Alert - Show for pending/inactive accounts or if documents are pending/rejected/null, but not if all are approved */}
        {/* Don't show if program_id is null */}
        {userProgramId !== null && (!isAccountActive || documentStatusInfo.hasRejected || documentStatusInfo.hasPending || documentStatusInfo.allNull) && !documentStatusInfo.allApproved && (
          <Alert className="bg-blue-50 flex items-center border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900 flex flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p>
                  {documentStatusInfo.hasRejected
                    ? "There are some rejected documents. Please check and update your documents."
                    : documentStatusInfo.hasPending
                    ? "Documents are under review."
                    : documentStatusInfo.allNull
                    ? "Complete application process"
                    : !isAccountActive
                    ? "Verify your account to gain admission into degree awarding programs."
                    : "Some of your documents are under review or have been rejected. Please check and update your documents."}
                </p>
                <Button
                  onClick={() => setUploadDocumentsDialogOpen(true)}
                  className=" text-white gap-2 place-self-end"
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </Button>
              </div>
              </AlertTitle>
           
          </Alert>
        )}

        {/* Unpaid Courses Alert - Only for allocated courses, show only if ALL courses are unpaid */}
        {courseType === "allocated" && allCoursesUnpaid && showUnpaidAlert && (
          <UnpaidCoursesAlert
            onDismiss={() => setShowUnpaidAlert(false)}
            onCompleteRegistration={() => navigate('/allocated-courses')}
          />
        )}

        {/* My Courses Header + Filters */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">{getHeadingText}</h2>
              <div className="flex items-center gap-3">
                <CourseTypeFilter
                  activeType={courseType}
                  onTypeChange={(type) => {
                    // Prevent switching to allocated if account is not active
                    if (type === "allocated" && !isAccountActive) {
                      return;
                    }
                    setCourseType(type);
                  }}
                  showRegisteredCourses={isAccountActive}
                  isPendingUser={isPendingUser}
                  hasProgramId={userProgramId !== null}
                />
                {courseType === "allocated" && (
                  <SessionSemesterDialog
                    onSelectionChange={handleSessionSemesterChange}
                  />
                )}
              </div>
            </div>

            {/* Search Bar - Only show for non-program views */}
            {courseType !== "degree_programs" && (
              <div className="relative place-self-end max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search courses"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            {courseType === "allocated" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Session:</span>
                  <span className="text-foreground font-medium">
                    {selectedSession || "-"}
                  </span>
                </div>
                <span className="hidden sm:inline text-muted-foreground">/</span>
                <div className="flex items-center gap-2">
                  <span>Semester:</span>
                  <span className="text-foreground font-medium">
                    {selectedSemester || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Degree Programs View */}
          {courseType === "degree_programs" && (
            <>
              {isLoadingPrograms ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programs.map((program: any) => (
                    <Card key={program.id} className="flex flex-col h-full pt-3">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          {program.title}
                        </CardTitle>
                        {program.faculty && (
                          <Badge variant="secondary" className="w-fit mt-2">
                            {program.faculty.name}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {program.description || "No description available for this program."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedProgramForApply(program);
                            setConfirmApplyDialogOpen(true);
                          }}
                          disabled={isApplyingToProgram}
                        >
                          Apply Now
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyCoursesState />
              )}
            </>
          )}

          {/* Certificate Courses View (Marketplace for purchase) */}
          {courseType === "certificate_courses" && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <CourseCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredCourses.map((course: any, index: number) => {
                    const isOwned = course.is_owned === true;
                    return (
                      <Card key={course.id || index} className="overflow-hidden h-full flex flex-col">
                        <div className="w-full h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 relative">
                          <div className="absolute top-2.5 left-2.5">
                            <Badge
                              variant="secondary"
                              className="bg-white/20 text-white border-white/20 text-xs px-2 py-0.5"
                            >
                              {course.course_code || "N/A"}
                            </Badge>
                          </div>
                          {isOwned && (
                            <div className="absolute top-2.5 right-2.5">
                              <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">
                                Owned
                              </Badge>
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
                            Level {course.course_level} · {course.course_unit} Unit{course.course_unit !== 1 ? "s" : ""} · {course.semester || ""}
                          </p>
                          {course.instructor && (
                            <p className="text-muted-foreground text-xs mt-1">
                              Instructor: {course.instructor.name}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              {course.currency === "NGN" ? "₦" : "$"}{course.price?.toLocaleString() || "0"}
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
                              onClick={() => {
                                setSelectedCourseForPurchase(course);
                                setPurchaseDialogOpen(true);
                              }}
                            >
                              Purchase
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
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
                <EmptyCoursesState />
              )}
            </>
          )}

          {/* My Courses and Other Views */}
          {courseType !== "degree_programs" && courseType !== "certificate_courses" && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <CourseCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredCourses.map((course: any, index: number) => {
                    // Handle both allocated and marketplace course structures
                    const registration = course.registration || {};
                    
                    return (
                      <CourseCards
                        key={course.id || index}
                        courseCode={course.course_code}
                        courseTitle={course.title}
                        courseLevel={course.course_level}
                        courseUnit={course.course_unit}
                        academicYear={registration.academic_year || course.academic_year}
                        courseType={course.course_type}
                        examFee={course.exam_fee}
                        courseId={course.id}
                        registrationId={registration.id || course.registration_id}
                        instructor={course.instructor}
                        onUnregister={() => {
                          // Remove the course from the list after unregistering
                          setCourses((prev) => prev.filter((c) => c.id !== course.id));
                        }}
                      />
                    );
                  })}
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
                <EmptyCoursesState />
              )}
            </>
          )}
        </div>
      </div>

      {/* Notice Details Dialog */}
      {isNoticeDialogOpen && (
        <Suspense fallback={null}>
          <NoticeDetailsDialog
            notice={selectedNotice}
            open={isNoticeDialogOpen}
            onOpenChange={setIsNoticeDialogOpen}
          />
        </Suspense>
      )}

      {/* Upload Documents Dialog */}
      {uploadDocumentsDialogOpen && (
        <Suspense fallback={null}>
          <UploadDocumentsDialog
            open={uploadDocumentsDialogOpen}
            onOpenChange={setUploadDocumentsDialogOpen}
            onUploadSuccess={async () => {
              // Refresh KYC documents after upload
              try {
                const authApi = new AuthApi();
                const response: any = await authApi.getKycDocuments();
                
                if (response?.data?.success && response?.data?.data?.documents) {
                  const documents: Record<string, {
                    url: string | null;
                    status: string | null;
                    rejection_reason: string | null;
                    reviewed_at: string | null;
                  }> = {};
                  
                  Object.entries(response.data.data.documents).forEach(([key, value]: [string, any]) => {
                    documents[key] = {
                      url: value?.url || null,
                      status: value?.status || null,
                      rejection_reason: value?.rejection_reason || null,
                      reviewed_at: value?.reviewed_at || null,
                    };
                  });
                  
                  setKycDocuments(documents);
                }
              } catch (err: any) {
                console.error("Error refreshing KYC documents:", err);
              }
            }}
          />
        </Suspense>
      )}

      {/* Purchase Course Dialog */}
      {purchaseDialogOpen && (
        <Suspense fallback={null}>
          <PurchaseCourseDialog
            open={purchaseDialogOpen}
            onOpenChange={setPurchaseDialogOpen}
            course={selectedCourseForPurchase}
            onPurchaseSuccess={async () => {
              // Refresh courses after successful purchase
              try {
                setIsLoading(true);
                if (courseType === "certificate_courses") {
                  // Refresh marketplace courses
                  const response = await api.marketplace.GetMarketplaceCourses({
                    page: 1,
                    limit: 100,
                  });
                  if (response.data && response.data.data) {
                    setCourses(Array.isArray(response.data.data) ? response.data.data : []);
                  }
                } else if (courseType === "my_courses" || (courseType === "marketplace" && isAccountActive)) {
                  // Refresh purchased courses (for my_courses or marketplace for active students)
                  const response = await api.marketplace.GetMyCourses();
                  if (response.data) {
                    const coursesData = response.data.data || response.data;
                    if (Array.isArray(coursesData)) {
                      setCourses(coursesData);
                    } else {
                      setCourses([]);
                    }
                  }
                } else if (courseType === "marketplace" && !isAccountActive) {
                  // Refresh marketplace courses for inactive students
                  const response = await api.marketplace.GetMarketplaceCourses({
                    page: 1,
                    limit: 100,
                  });
                  if (response.data && response.data.data) {
                    setCourses(Array.isArray(response.data.data) ? response.data.data : []);
                  }
                }
              } catch (error) {
                console.error("Error refreshing courses after purchase:", error);
              } finally {
                setIsLoading(false);
              }
            }}
          />
        </Suspense>
      )}

      {/* Confirm Apply to Program Dialog */}
      <AlertDialog open={confirmApplyDialogOpen} onOpenChange={setConfirmApplyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Program Application</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProgramForApply && (
                <>
                  Are you sure you want to apply for <strong>{selectedProgramForApply.title}</strong>?
                  {selectedProgramForApply.faculty && (
                    <>
                      <br />
                      <br />
                      <strong>Faculty:</strong> {selectedProgramForApply.faculty.name}
                    </>
                  )}
                  {selectedProgramForApply.description && (
                    <>
                      <br />
                      <br />
                      <strong>Description:</strong> {selectedProgramForApply.description}
                    </>
                  )}
                  <br />
                  <br />
                  Once you apply, you will be prompted to upload your documents to complete the application process.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isApplyingToProgram}
              onClick={() => {
                setConfirmApplyDialogOpen(false);
                setSelectedProgramForApply(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedProgramForApply) {
                  setConfirmApplyDialogOpen(false);
                  await handleApplyToProgram(selectedProgramForApply);
                }
              }}
              disabled={isApplyingToProgram}
            >
              {isApplyingToProgram ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Confirm Application"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
