import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CoursesApi } from "@/api/courses";
import { AuthApi } from "@/api/auth";
import { WalletApi } from "@/api/wallet";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Skeleton } from "@/Components/ui/skeleton";
import { Badge } from "@/Components/ui/badge";
import { Checkbox } from "@/Components/ui/checkbox";
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
  DollarSign,
  ArrowRightLeft
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

// Currency conversion utility
const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // USD to NGN: multiply by rate
  if (fromCurrency === "USD" && toCurrency === "NGN") {
    return amount * exchangeRate;
  }

  // NGN to USD: divide by rate
  if (fromCurrency === "NGN" && toCurrency === "USD") {
    return amount / exchangeRate;
  }

  return amount;
};

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
  currency: string;
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
  const currencySymbol = currency === "USD" ? "$" : "₦";
  return `${currencySymbol}${parsed.toLocaleString(undefined, {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  })}`;
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
  const authApi = new AuthApi();
  const walletApi = new WalletApi();
  
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [data, setData] = useState<AllocatedCoursesResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("NGN");
  const [exchangeRate, setExchangeRate] = useState<number>(1500); // Default fallback rate
  const [selectedAllocationIds, setSelectedAllocationIds] = useState<number[]>([]);

  // Calculate currency conversions for all courses
  const courseConversions = useMemo(() => {
    if (!data?.allocated_courses) return [];
    
    return data.allocated_courses.map((course) => {
      const courseCurrency = course.currency || "NGN";
      const studentCurrency = currency;
      
      if (courseCurrency === studentCurrency) {
        return {
          allocation_id: course.allocation_id,
          originalPrice: course.price,
          originalCurrency: courseCurrency,
          convertedPrice: course.price,
          convertedCurrency: studentCurrency,
          needsConversion: false,
        };
      }
      
      const convertedPrice = convertCurrency(course.price, courseCurrency, studentCurrency, exchangeRate);
      
      return {
        allocation_id: course.allocation_id,
        originalPrice: course.price,
        originalCurrency: courseCurrency,
        convertedPrice,
        convertedCurrency: studentCurrency,
        needsConversion: true,
      };
    });
  }, [data?.allocated_courses, currency, exchangeRate]);

  // Calculate totals for selected courses only
  const selectedCourses = useMemo(() => {
    if (!data?.allocated_courses) return [];
    return data.allocated_courses.filter(course => 
      selectedAllocationIds.includes(course.allocation_id)
    );
  }, [data?.allocated_courses, selectedAllocationIds]);

  const selectedTotalUnits = useMemo(() => {
    return selectedCourses.reduce((sum, course) => sum + (course.course?.course_unit || 0), 0);
  }, [selectedCourses]);

  const totalAmountInStudentCurrency = useMemo(() => {
    if (!selectedCourses.length) return 0;
    
    return selectedCourses.reduce((sum, course) => {
      const courseCurrency = course.currency || "NGN";
      const studentCurrency = currency;
      
      if (courseCurrency === studentCurrency) {
        return sum + course.price;
      }
      
      const convertedPrice = convertCurrency(course.price, courseCurrency, studentCurrency, exchangeRate);
      return sum + convertedPrice;
    }, 0);
  }, [selectedCourses, currency, exchangeRate]);

  // Check if any selected course needs conversion
  const hasCurrencyConversion = useMemo(() => {
    if (!selectedCourses.length) return false;
    return selectedCourses.some(
      (course) => (course.currency || "NGN") !== currency
    );
  }, [selectedCourses, currency]);

  // Initialize selected courses when data loads (select all by default)
  useEffect(() => {
    if (data?.allocated_courses && selectedAllocationIds.length === 0) {
      setSelectedAllocationIds(data.allocated_courses.map(course => course.allocation_id));
    }
  }, [data?.allocated_courses]);

  const handleCourseToggle = (allocationId: number, courseUnits: number) => {
    setSelectedAllocationIds(prev => {
      const isSelected = prev.includes(allocationId);
      
      if (isSelected) {
        // Deselecting - just remove it
        return prev.filter(id => id !== allocationId);
      } else {
        // Selecting - check if adding would exceed 32 units
        const currentUnits = selectedTotalUnits;
        if (currentUnits + courseUnits > 32) {
          toast.error(`Cannot select this course. Maximum of 32 units allowed. Current: ${currentUnits} units, Adding: ${courseUnits} units`);
          return prev;
        }
        return [...prev, allocationId];
      }
    });
  };

  useEffect(() => {
    fetchData();
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const response = await walletApi.GetExchangeRate();
      if (response?.data?.exchange_rate) {
        setExchangeRate(response.data.exchange_rate);
      }
    } catch (err: any) {
      console.error("Error fetching exchange rate:", err);
      // Keep default rate of 1500 if API fails
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both allocated courses and student profile in parallel
      const [coursesResponse, profileResponse] = await Promise.all([
        coursesApi.GetAllocatedCourses(),
        authApi.getUserProfile()
      ]);
      
      // Handle allocated courses
      if (coursesResponse?.data?.success) {
        setData(coursesResponse.data.data);
      } else {
        setError(coursesResponse?.data?.message || "Failed to load allocated courses");
      }

      // Handle student profile for wallet balance
      const profileData = profileResponse as any;
      if (profileData?.data?.success || profileData?.data?.status) {
        const userData = profileData?.data?.data?.user;
        if (userData) {
          setWalletBalance(parseFloat(userData.wallet_balance) || 0);
          setCurrency(userData.currency || "NGN");
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to load data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (!data?.can_register) return;
    
    // Check if any courses are selected
    if (selectedAllocationIds.length === 0) {
      toast.error("Please select at least one course to register.");
      return;
    }
    
    // Check wallet balance using converted total amount
    if (walletBalance < totalAmountInStudentCurrency) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }
    
    setConfirmDialogOpen(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      setRegistering(true);
      setConfirmDialogOpen(false);
      
      const response = await coursesApi.RegisterAllocatedCourses(selectedAllocationIds);
      
      // Check if response is an error (from handleApiError)
      if (response?.response) {
        // This is an axios error object returned by handleApiError
        const errorMessage = 
          response?.response?.data?.message || 
          response?.data?.message || 
          "Failed to register for courses";
        toast.error(errorMessage);
        return;
      }
      
      // Check if it's a successful response
      if (response?.data?.success || response?.data?.status) {
        toast.success(response?.data?.message || `Successfully registered for ${selectedAllocationIds.length} course${selectedAllocationIds.length !== 1 ? 's' : ''}!`);
        
        // Refresh data
        await fetchData();
        
        // Navigate to home after short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Show the actual error message from backend (non-axios error response)
        const errorMessage = response?.data?.message || "Failed to register for courses";
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error("Error registering for courses:", err);
      // Extract error message from various possible locations in the error object
      const message = 
        err?.response?.data?.message || 
        err?.data?.message || 
        err?.message || 
        "Failed to register for courses";
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
              <Card className="pt-3">
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
              <Card className="border-primary pt-3">
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
            <Card className="pt-3">
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

              {/* Wallet & Total Amount Card */}
              <Card className="border-primary pt-3">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    Registration Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Wallet Balance */}
                  <div className="pb-3 border-b">
                    <p className="text-xs text-muted-foreground">Wallet Balance</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(walletBalance, currency)}
                    </p>
                  </div>
                  
                  {/* Total Units */}
                  <div className="pb-3 border-b">
                    <p className="text-xs text-muted-foreground">Total Units Selected</p>
                    <p className="text-2xl font-bold">
                      {selectedTotalUnits} / 32
                    </p>
                    {selectedTotalUnits > 32 && (
                      <p className="text-xs text-destructive mt-1">Maximum 32 units allowed</p>
                    )}
                  </div>
                  
                  {/* Total Cost */}
                  <div>
                    <p className="text-xs text-muted-foreground">Total Registration Cost</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(totalAmountInStudentCurrency, currency)}
                    </p>
                    {hasCurrencyConversion && (
                      <p className="text-xs text-muted-foreground mt-1">
                        (Converted from mixed currencies)
                      </p>
                    )}
                  </div>

                  {/* Currency Conversion Info */}
                  {hasCurrencyConversion && (
                    <Alert className="mt-2 bg-amber-50 border-amber-200">
                      <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-900">
                        <div className="space-y-1">
                          <p className="font-semibold">Currency Conversion Applied</p>
                          <p>Some courses are priced in different currencies. All prices have been converted to {currency} using the current exchange rate (1 USD = {exchangeRate.toLocaleString()} NGN).</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Show units warning if exceeded */}
                  {selectedTotalUnits > 32 && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Maximum 32 units allowed. Current selection: {selectedTotalUnits} units. Please deselect some courses.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Show balance warning if insufficient */}
                  {walletBalance < totalAmountInStudentCurrency && selectedTotalUnits <= 32 && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Insufficient wallet balance. Please fund your wallet.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    size="default"
                    onClick={handleRegisterClick}
                    disabled={!data.can_register || registering || walletBalance < totalAmountInStudentCurrency || selectedAllocationIds.length === 0 || selectedTotalUnits > 32}
                    className="w-full"
                  >
                    {registering ? "Registering..." : `Register ${selectedAllocationIds.length} Course${selectedAllocationIds.length !== 1 ? 's' : ''}`}
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
                <Card className="pt-3">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <BookOpen className="h-4 w-4" />
                          Allocated Courses
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {data.course_count} course{data.course_count !== 1 ? 's' : ''} allocated for this semester
                          {selectedAllocationIds.length > 0 && (
                            <span className="ml-2">• {selectedAllocationIds.length} selected ({selectedTotalUnits} units)</span>
                          )}
                        </CardDescription>
                      </div>
                      {data.allocated_courses.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (selectedAllocationIds.length === data.allocated_courses.length) {
                              setSelectedAllocationIds([]);
                            } else {
                              // Select all that don't exceed 32 units
                              let totalUnits = 0;
                              const idsToSelect: number[] = [];
                              for (const course of data.allocated_courses) {
                                const units = course.course?.course_unit || 0;
                                if (totalUnits + units <= 32) {
                                  idsToSelect.push(course.allocation_id);
                                  totalUnits += units;
                                }
                              }
                              setSelectedAllocationIds(idsToSelect);
                              if (idsToSelect.length < data.allocated_courses.length) {
                                toast.warning(`Selected ${idsToSelect.length} courses (${totalUnits} units). Maximum 32 units allowed.`);
                              }
                            }
                          }}
                          disabled={registering}
                        >
                          {selectedAllocationIds.length === data.allocated_courses.length ? "Deselect All" : "Select All"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[120px]">Course Code</TableHead>
                            <TableHead>Course Title</TableHead>
                            <TableHead className="w-[80px] text-center">Units</TableHead>
                            <TableHead className="w-[180px] text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.allocated_courses.map((item) => {
                            const conversion = courseConversions.find(
                              (conv) => conv.allocation_id === item.allocation_id
                            );
                            const courseCurrency = item.currency || "NGN";
                            const needsConversion = conversion?.needsConversion || false;
                            const isSelected = selectedAllocationIds.includes(item.allocation_id);
                            
                            return (
                              <TableRow key={item.allocation_id}>
                                <TableCell>
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleCourseToggle(item.allocation_id, item.course?.course_unit || 0)}
                                    disabled={registering}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{item.course.course_code}</TableCell>
                                <TableCell>{item.course.title}</TableCell>
                                <TableCell className="text-center">{item.course.course_unit}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col items-end gap-1">
                                    {needsConversion ? (
                                      <>
                                        <div className="font-semibold">
                                          {formatCurrency(conversion?.convertedPrice || 0, currency)}
                                        </div>
                                        <div className="text-xs text-muted-foreground line-through">
                                          {formatCurrency(item.price, courseCurrency)}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="font-semibold">
                                        {formatCurrency(item.price, courseCurrency)}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
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
              <p>You are about to register for {selectedAllocationIds.length} course(s).</p>
              
              {/* Selected Courses List */}
              <div className="bg-muted p-3 rounded-lg max-h-60 overflow-y-auto">
                <p className="text-sm font-semibold mb-2">Selected Courses:</p>
                <div className="space-y-2">
                  {selectedCourses.map((course) => {
                    const conversion = courseConversions.find(
                      (conv) => conv.allocation_id === course.allocation_id
                    );
                    const courseCurrency = course.currency || "NGN";
                    const needsConversion = conversion?.needsConversion || false;
                    
                    return (
                      <div key={course.allocation_id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                        <div>
                          <span className="font-medium">{course.course.course_code}</span>
                          <span className="text-muted-foreground ml-2">- {course.course.title}</span>
                          <span className="text-muted-foreground ml-2">({course.course.course_unit} units)</span>
                        </div>
                        <div className="font-semibold">
                          {needsConversion 
                            ? formatCurrency(conversion?.convertedPrice || 0, currency)
                            : formatCurrency(course.price, courseCurrency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Units:</span>
                  <span className="font-bold">{selectedTotalUnits} / 32</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Cost ({currency}):</span>
                  <span className="font-bold">{formatCurrency(totalAmountInStudentCurrency, currency)}</span>
                </div>
                {hasCurrencyConversion && (
                  <div className="text-xs text-muted-foreground bg-amber-50 p-2 rounded border border-amber-200">
                    <div className="flex items-center gap-1 mb-1">
                      <ArrowRightLeft className="h-3 w-3 text-amber-600" />
                      <span className="font-semibold text-amber-900">Currency Conversion Applied</span>
                    </div>
                    <p className="text-amber-800">
                      Exchange rate: 1 USD = {exchangeRate.toLocaleString()} NGN
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Wallet Balance:</span>
                  <span className="font-bold">{formatCurrency(walletBalance, currency)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Remaining Balance:</span>
                  <span className="font-bold">
                    {formatCurrency(walletBalance - totalAmountInStudentCurrency, currency)}
                  </span>
                </div>
              </div>
              <p className="text-sm">
                The registration fee will be deducted from your wallet. Do you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setConfirmDialogOpen(false)} 
              disabled={registering}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRegistration} disabled={registering}>
              {registering ? "Processing..." : "Confirm Registration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

