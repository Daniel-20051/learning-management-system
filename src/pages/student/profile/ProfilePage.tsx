import { useEffect, useMemo, useState } from "react";
import { AuthApi } from "@/api/auth";
import { ProgramsApi } from "@/api/programs";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Skeleton } from "@/Components/ui/skeleton";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Phone, GraduationCap, Wallet, Edit2, X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import Navbar from "@/Components/navbar";

interface StudentProfile {
  id: number;
  fname: string;
  mname?: string;
  lname: string;
  gender?: string;
  dob?: string;
  address?: string;
  state_origin?: string;
  lcda?: string;
  country?: string;
  phone?: string;
  email: string;
  file?: string | null;
  admin_status?: string;
  g_status?: string;
  matric_number?: string;
  wallet?: string | null;
  wallet_balance?: string | null;
  level?: string | number | null;
  program_id?: number;
  facaulty_id?: number;
  study_mode?: string;
  teller_no?: string | null;
  application_code?: string | null;
  referral_code?: string | null;
  designated_institute?: number | null;
  foreign_student?: number | null;
  certificate_file?: string | null;
  birth_certificate?: string | null;
  ref_letter?: string | null;
  valid_id?: string | null;
  resume_cv?: string | null;
  other_file?: string | null;
  application_fee?: string | null;
  date?: string;
  currency?: string | null;
}

type ProfileApiResponse =
  | {
    success?: boolean;
    status?: boolean;
    message?: string;
    data?: {
      user?: StudentProfile;
      userType?: string;
    };
  }
  | undefined;

const formatValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }
  return String(value);
};

const formatCurrency = (amount?: string | null, currency?: string | null) => {
  if (!amount) return "—";
  const parsed = Number(amount);
  if (Number.isNaN(parsed)) return amount;
  return Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 2,
  }).format(parsed);
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [programName, setProgramName] = useState<string | null>(null);
  const [facultyName, setFacultyName] = useState<string | null>(null);
  const [loadingProgramName, setLoadingProgramName] = useState(false);
  const [loadingFacultyName, setLoadingFacultyName] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    mname: "",
    lname: "",
    phone: "",
    address: "",
    dob: "",
    country: "",
    state_origin: "",
    lcda: "",
    currency: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const authApi = new AuthApi();
        const response = await authApi.getUserProfile();
        const payload: ProfileApiResponse = response?.data ?? response;
        const userData = payload?.data?.user;
        if (!userData) {
          throw new Error(payload?.message || "Unable to load profile");
        }
        if (isMounted) {
          setProfile(userData);
          // Initialize form data with current profile values
          setFormData({
            fname: userData.fname || "",
            mname: userData.mname || "",
            lname: userData.lname || "",
            phone: userData.phone || "",
            address: userData.address || "",
            dob: userData.dob || "",
            country: userData.country || "",
            state_origin: userData.state_origin || "",
            lcda: userData.lcda || "",
            currency: userData.currency || "",
          });
          setError(null);
          
          // Reset names and fetch program and faculty names
          setProgramName(null);
          setFacultyName(null);
          if (userData.program_id) {
            fetchProgramName(userData.program_id);
          }
          if (userData.facaulty_id) {
            fetchFacultyName(userData.facaulty_id);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to retrieve profile information.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch program name by ID
  const fetchProgramName = async (programId: number) => {
    try {
      setLoadingProgramName(true);
      const programsApi = new ProgramsApi();
      const response = await programsApi.GetProgramById(programId);
      // Handle response structure: response.data.data.program.title
      const programName = response?.data?.data?.program?.title ||
                         response?.data?.program?.title ||
                         response?.data?.data?.title ||
                         response?.data?.title ||
                         response?.data?.data?.program?.name ||
                         response?.data?.program?.name ||
                         response?.data?.data?.name ||
                         response?.data?.name;
      if (programName) {
        setProgramName(programName);
      }
    } catch (err: any) {
      console.error("Error fetching program name:", err);
      // Keep programName as null, will show ID as fallback
    } finally {
      setLoadingProgramName(false);
    }
  };

  // Fetch faculty name by ID
  const fetchFacultyName = async (facultyId: number) => {
    try {
      setLoadingFacultyName(true);
      const programsApi = new ProgramsApi();
      const response = await programsApi.GetFacultyById(facultyId);
      // Handle response structure: response.data.data.faculty.name
      const facultyName = response?.data?.data?.faculty?.name || 
                         response?.data?.faculty?.name || 
                         response?.data?.data?.name ||
                         response?.data?.name;
      if (facultyName) {
        setFacultyName(facultyName);
      }
    } catch (err: any) {
      console.error("Error fetching faculty name:", err);
      // Keep facultyName as null, will show ID as fallback
    } finally {
      setLoadingFacultyName(false);
    }
  };

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  // Handler to toggle edit mode
  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        fname: profile.fname || "",
        mname: profile.mname || "",
        lname: profile.lname || "",
        phone: profile.phone || "",
        address: profile.address || "",
        dob: profile.dob || "",
        country: profile.country || "",
        state_origin: profile.state_origin || "",
        lcda: profile.lcda || "",
        currency: profile.currency || "",
      });
    }
  };

  // Handler for form field changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handler to save changes
  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const authApi = new AuthApi();
      await authApi.updateStudentProfile({
        fname: formData.fname,
        mname: formData.mname || undefined,
        lname: formData.lname,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        dob: formData.dob || undefined,
        country: formData.country || undefined,
        state_origin: formData.state_origin || undefined,
        lcda: formData.lcda || undefined,
        currency: formData.currency || undefined,
      });

      // Refresh profile data
      const response = await authApi.getUserProfile();
      const payload: ProfileApiResponse = response?.data ?? response;
      const userData = payload?.data?.user;
      if (userData) {
        setProfile(userData);
      }

      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile. Please try again.";
      setUpdateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullName = useMemo(() => {
    if (!profile) return "";
    return [profile.fname, profile.mname, profile.lname].filter(Boolean).join(" ");
  }, [profile]);

  const academicDetails = [
    { label: "Matric Number", value: profile?.matric_number },
    { label: "Level", value: profile?.level },
    { label: "Study Mode", value: profile?.study_mode },
    { label: "Program", value: programName || profile?.program_id || null },
    { label: "Faculty", value: facultyName || profile?.facaulty_id || null },
    { label: "Application Code", value: profile?.application_code },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      {/* Branded Header */}
      <Navbar sidebar={false} />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 mt-6 pb-16">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Unable to load profile</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {updateSuccess && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Profile Updated</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your profile has been successfully updated.
            </AlertDescription>
          </Alert>
        )}

        {/* Update Error Alert */}
        {updateError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Update Failed</AlertTitle>
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}

        {/* Edit/Cancel/Save Buttons */}
        {!loading && (
          <div className="flex justify-end gap-2 mb-4">
            {!isEditing ? (
              <Button onClick={handleEditClick} variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} size="sm" disabled={isSubmitting}>
                  <Check className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Profile Summary Row */}
        <section className="w-full border bg-card rounded-lg px-4 md:px-7 py-5 md:py-7 mb-5 flex flex-col md:flex-row items-start gap-6 md:gap-8 min-h-[160px]">
          <div className="w-full md:w-auto flex md:block justify-center md:justify-start">
            <img
              src={"/assets/avatar.png"}
              alt="Profile Picture"
              className="rounded-full w-20 h-20 border border-border bg-muted object-cover"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-center md:text-left">
            <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start text-base md:text-lg font-semibold text-foreground">
              {loading ? <Skeleton className="h-5 w-40" /> : (fullName || "Student Profile")}
              {profile?.admin_status && (
                <Badge variant="secondary" className="rounded px-2 py-0.5 text-xs text-muted-foreground tracking-wide font-normal">{profile.admin_status}</Badge>
              )}
              {profile?.study_mode && (
                <Badge variant="outline" className="rounded px-2 py-0.5 text-xs tracking-wide font-normal">{profile.study_mode}</Badge>
              )}
            </div>
            <span className="text-muted-foreground text-[15px] md:text-base mb-1 font-normal">
              {loading ? <Skeleton className="h-4 w-28" /> : profile?.email}
            </span>
            <div className="flex gap-4 flex-wrap justify-center md:justify-start mt-1 text-muted-foreground text-sm">
              <div className="flex items-center gap-1"><Phone className="w-4 h-4" />{loading ? <Skeleton className="h-4 w-14" /> : formatValue(profile?.phone)}</div>
              <div className="flex items-center gap-1"><GraduationCap className="w-4 h-4" />{loading ? <Skeleton className="h-4 w-14" /> : formatValue(profile?.matric_number)}</div>
              <div className="flex items-center gap-1 font-medium text-primary"><Wallet className="w-4 h-4" />{loading ? <Skeleton className="h-4 w-14" /> : formatCurrency(profile?.wallet_balance, profile?.currency)}</div>
            </div>
          </div>
        </section>
        {/* Details */}
        <section className="w-full grid md:grid-cols-2 gap-5">
          <div className="border bg-card rounded-lg p-5 min-w-0 min-h-[180px]">
            <h3 className="text-base font-semibold mb-3 text-muted-foreground">Personal Information</h3>
            <dl className="space-y-2">
              {/* First Name - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">First Name:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.fname}
                      onChange={(e) => handleInputChange("fname", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="First Name"
                    />
                  ) : (
                    formatValue(profile?.fname)
                  )}
                </dd>
              </div>

              {/* Middle Name - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Middle Name:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.mname}
                      onChange={(e) => handleInputChange("mname", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Middle Name"
                    />
                  ) : (
                    formatValue(profile?.mname)
                  )}
                </dd>
              </div>

              {/* Last Name - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Last Name:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.lname}
                      onChange={(e) => handleInputChange("lname", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Last Name"
                    />
                  ) : (
                    formatValue(profile?.lname)
                  )}
                </dd>
              </div>

              {/* Phone - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Phone:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Phone Number"
                    />
                  ) : (
                    formatValue(profile?.phone)
                  )}
                </dd>
              </div>

              {/* Address - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Address:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Address"
                    />
                  ) : (
                    formatValue(profile?.address)
                  )}
                </dd>
              </div>

              {/* Gender - Read-only */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Gender:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? <Skeleton className="h-4 w-20 inline-block" /> : formatValue(profile?.gender)}
                </dd>
              </div>

              {/* Date of Birth - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Date of Birth:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="h-8 text-sm"
                    />
                  ) : (
                    formatValue(profile?.dob)
                  )}
                </dd>
              </div>

              {/* Country - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Country:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Country"
                    />
                  ) : (
                    formatValue(profile?.country)
                  )}
                </dd>
              </div>

              {/* State of Origin - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">State of Origin:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.state_origin}
                      onChange={(e) => handleInputChange("state_origin", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="State of Origin"
                    />
                  ) : (
                    formatValue(profile?.state_origin)
                  )}
                </dd>
              </div>

              {/* LCDA - Editable */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">LCDA:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Input
                      value={formData.lcda}
                      onChange={(e) => handleInputChange("lcda", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="LCDA"
                    />
                  ) : (
                    formatValue(profile?.lcda)
                  )}
                </dd>
              </div>

              {/* Currency - Editable Dropdown */}
              <div className="flex justify-between items-center py-1 text-sm">
                <dt className="text-muted-foreground w-2/5 font-normal">Currency:</dt>
                <dd className="font-medium text-right flex-1 break-words">
                  {loading ? (
                    <Skeleton className="h-4 w-20 inline-block" />
                  ) : isEditing ? (
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleInputChange("currency", value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    formatValue(profile?.currency)
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border bg-card rounded-lg p-5 min-w-0 min-h-[180px]">
            <h3 className="text-base font-semibold mb-3 text-muted-foreground">Academic Information</h3>
            <dl className="space-y-1">
              {academicDetails.map((detail) => {
                const isProgramLoading = detail.label === "Program" && loadingProgramName;
                const isFacultyLoading = detail.label === "Faculty" && loadingFacultyName;
                const isLoading = loading || isProgramLoading || isFacultyLoading;
                
                return (
                  <div key={detail.label} className="flex justify-between items-center py-1 text-sm">
                    <dt className="text-muted-foreground w-2/5 font-normal">{detail.label}:</dt>
                    <dd className="font-medium text-right flex-1 break-words">
                      {isLoading ? <Skeleton className="h-4 w-20 inline-block" /> : formatValue(detail.value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}

