import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CoursesApi } from "@/api/courses";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Skeleton } from "@/Components/ui/skeleton";
import { Badge } from "@/Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import Navbar from "@/Components/navbar";
import { 
  BookOpen, 
  Calendar, 
  AlertCircle, 
  GraduationCap,
  Clock,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
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

interface CourseDetails {
  id: number;
  title: string;
  course_code: string;
  course_unit: number;
}

interface AllocatedCourse {
  allocation_id: number;
  course: CourseDetails;
  price: number;
  allocated_at: string | null;
}

interface SemesterInfo {
  id: number;
  academic_year: string;
  semester: string;
  status: string;
  registration_deadline: string | null;
  deadline_passed: boolean;
}

interface AllocatedCoursesResponse {
  success: boolean;
  message?: string;
  data: {
    semester: SemesterInfo;
    allocated_courses: AllocatedCourse[];
    total_amount: number;
    course_count: number;
    can_register: boolean;
    wallet_balance?: number;
    currency?: string;
  };
}

const formatCurrency = (amount: number | string, currency?: string) => {
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(parsed)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 2,
  }).format(parsed);
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export default function AllocatedCoursesPage() {
  const navigate = useNavigate();
  const coursesApi = new CoursesApi();
  
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [data, setData] = useState<AllocatedCoursesResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllocatedCourses();
  }, []);

  const fetchAllocatedCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesApi.GetAllocatedCourses();
      
      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        setError(response?.data?.message || "Failed to load allocated courses");
      }
    } catch (err: any) {
      console.error("Error fetching allocated courses:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to load allocated courses";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (!data?.can_register) return;
    
    // Check wallet balance
    const walletBalance = data.wallet_balance || 0;
    const totalAmount = data.total_amount || 0;
    
    if (walletBalance < totalAmount) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }
    
    setConfirmDialogOpen(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      setRegistering(true);
      setConfirmDialogOpen(false);
      
      const response = await coursesApi.RegisterAllocatedCourses();
      
      if (response?.data?.success || response?.data?.status) {
        toast.success(response?.data?.message || "Successfully registered for all allocated courses!");
        
        // Refresh data
        await fetchAllocatedCourses();
        
        // Navigate to home after short delay
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      } else {
        toast.error(response?.data?.message || "Failed to register for courses");
      }
    } catch (err: any) {
      console.error("Error registering for courses:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to register for courses";
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navbar sidebar={false} />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 mt-4 pb-12">
        {/* Header - Compact */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">Course Registration</h1>
          <p className="text-sm text-muted-foreground">
            Review and register for your allocated courses
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Error</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid lg:grid-cols-[320px_1fr] gap-4">
            {/* Left Sidebar Skeleton */}
            <div className="space-y-4">
              {/* Semester Info Skeleton */}
              <Card>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Total Amount Skeleton */}
              <Card>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Courses Table Skeleton */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <div className="p-3 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : data ? (
          <div className="grid lg:grid-cols-[320px_1fr] gap-4">
            {/* Left Sidebar - Info Cards */}
            <div className="space-y-4">
              {/* Semester Info Card */}
              <Card className="pt-3">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Semester Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Academic Year</p>
                    <p className="text-sm font-semibold">{data.semester.academic_year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Semester</p>
                    <p className="text-sm font-semibold">{data.semester.semester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {data.semester.registration_deadline ? formatDate(data.semester.registration_deadline) : "Not Set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={data.semester.deadline_passed ? "destructive" : "default"} className="text-xs mt-1">
                      {data.semester.deadline_passed ? "Closed" : "Open"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Total Amount Card */}
              <Card className="border-primary pt-3">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    Total Registration Cost
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold">
                      {formatCurrency(data.total_amount, data.currency)}
                    </p>
                  </div>
                  <Button
                    size="default"
                    onClick={handleRegisterClick}
                    disabled={!data.can_register || registering}
                    className="w-full"
                  >
                    {registering ? "Registering..." : "Register All Courses"}
                  </Button>
                  {!data.can_register && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {data.semester.deadline_passed
                          ? "Registration deadline has passed."
                          : "Registration is currently not available."}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Allocated Courses Table */}
            <div>
              {data.allocated_courses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <GraduationCap className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-base font-semibold mb-1">No Allocated Courses</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any courses allocated for this semester.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <BookOpen className="h-4 w-4" />
                          Allocated Courses
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {data.course_count} course{data.course_count !== 1 ? 's' : ''} allocated for this semester
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Course Code</TableHead>
                            <TableHead>Course Title</TableHead>
                            <TableHead className="w-[80px] text-center">Units</TableHead>
                            <TableHead className="w-[120px] text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.allocated_courses.map((item) => (
                            <TableRow key={item.allocation_id}>
                              <TableCell className="font-medium">{item.course.course_code}</TableCell>
                              <TableCell>{item.course.title}</TableCell>
                              <TableCell className="text-center">{item.course.course_unit}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(item.price, data.currency)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Course Registration</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>You are about to register for {data?.course_count || 0} course(s).</p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-bold">{formatCurrency(data?.total_amount || 0, data?.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Wallet Balance:</span>
                  <span className="font-bold">{formatCurrency(data?.wallet_balance || 0, data?.currency)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Remaining Balance:</span>
                  <span className="font-bold">
                    {formatCurrency((data?.wallet_balance || 0) - (data?.total_amount || 0), data?.currency)}
                  </span>
                </div>
              </div>
              <p className="text-sm">
                The registration fee will be deducted from your wallet. Do you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={registering}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRegistration} disabled={registering}>
              {registering ? "Processing..." : "Confirm Registration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

