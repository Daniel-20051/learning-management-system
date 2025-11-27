import { useEffect, useState } from "react";
import { AuthApi } from "@/api/auth";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Skeleton } from "@/Components/ui/skeleton";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  Phone,
  Mail,
  Edit2,
  X,
  Check,
  BookOpen,
  Linkedin,
  GraduationCap,
  MapPin,
  FlaskConical,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  course_code: string;
  course_unit: number;
  course_type: string;
  course_level: number;
  semester: string;
  price: string;
  exam_fee: number | null;
}

interface StaffProfile {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  google_scholar?: string;
  file?: string;
  research_areas?: string;
  home_address?: string;
  courses?: Course[];
}

type ProfileApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    user?: StaffProfile;
    userType?: string;
  };
};

const formatValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }
  return String(value);
};

export default function StaffProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    phone: "",
    linkedin: "",
    google_scholar: "",
    research_areas: "",
    home_address: "",
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
          // Parse full_name into fname and lname
          const nameParts = (userData.full_name || "").split(" ");
          const fname = nameParts[0] || "";
          const lname = nameParts.slice(1).join(" ") || "";
          
          setFormData({
            fname,
            lname,
            phone: userData.phone || "",
            linkedin: userData.linkedin || "",
            google_scholar: userData.google_scholar || "",
            research_areas: userData.research_areas || "",
            home_address: userData.home_address || "",
          });
          setError(null);
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

  // Auto-dismiss success message
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => setUpdateSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
    if (profile) {
      const nameParts = (profile.full_name || "").split(" ");
      setFormData({
        fname: nameParts[0] || "",
        lname: nameParts.slice(1).join(" ") || "",
        phone: profile.phone || "",
        linkedin: profile.linkedin || "",
        google_scholar: profile.google_scholar || "",
        research_areas: profile.research_areas || "",
        home_address: profile.home_address || "",
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      setUpdateError(null);

      const authApi = new AuthApi();
      await authApi.updateStaffProfile({
        fname: formData.fname || undefined,
        lname: formData.lname || undefined,
        phone: formData.phone || undefined,
        linkedin: formData.linkedin || undefined,
        google_scholar: formData.google_scholar || undefined,
        research_areas: formData.research_areas || undefined,
        home_address: formData.home_address || undefined,
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
        "Failed to update profile.";
      setUpdateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getTypeLabel = (type: string) => {
    return type === "C" ? "Core" : type === "E" ? "Elective" : type || "Course";
  };

  // Group courses by level
  const coursesByLevel = profile?.courses?.reduce((acc, course) => {
    const level = course.course_level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(course);
    return acc;
  }, {} as Record<number, Course[]>) || {};

  const sortedLevels = Object.keys(coursesByLevel).map(Number).sort((a, b) => a - b);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Profile</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Unable to load profile</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {updateSuccess && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Profile Updated</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your profile has been successfully updated.
            </AlertDescription>
          </Alert>
        )}

        {updateError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Update Failed</AlertTitle>
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.file} />
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {loading ? "..." : profile?.full_name ? getInitials(profile.full_name) : "ST"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    {loading ? (
                      <Skeleton className="h-8 w-48 mb-2" />
                    ) : (
                      <h2 className="text-2xl font-bold">{profile?.full_name || "Staff Member"}</h2>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {loading ? <Skeleton className="h-4 w-40" /> : <span className="text-sm">{profile?.email}</span>}
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!loading && (
                    <div className="flex gap-2">
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
                            {isSubmitting ? "Saving..." : "Save"}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <Badge variant="secondary" className="text-sm">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {profile?.courses?.length || 0} Courses
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
          </TabsList>

          {/* Profile Details Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="pt-3">
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">First Name</label>
                    {loading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : isEditing ? (
                      <Input
                        value={formData.fname}
                        onChange={(e) => handleInputChange("fname", e.target.value)}
                        placeholder="First Name"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatValue(formData.fname)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Last Name</label>
                    {loading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : isEditing ? (
                      <Input
                        value={formData.lname}
                        onChange={(e) => handleInputChange("lname", e.target.value)}
                        placeholder="Last Name"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatValue(formData.lname)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone
                    </label>
                    {loading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Phone Number"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatValue(profile?.phone)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Address
                    </label>
                    {loading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : isEditing ? (
                      <Input
                        value={formData.home_address}
                        onChange={(e) => handleInputChange("home_address", e.target.value)}
                        placeholder="Home Address"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatValue(profile?.home_address)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card className="pt-3">
                <CardHeader>
                  <CardTitle className="text-base">Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </label>
                    {loading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : isEditing ? (
                      <Input
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        placeholder="LinkedIn Profile URL"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatValue(profile?.linkedin)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Google Scholar
                    </label>
                    {loading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : isEditing ? (
                      <Input
                        value={formData.google_scholar}
                        onChange={(e) => handleInputChange("google_scholar", e.target.value)}
                        placeholder="Google Scholar Profile URL"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatValue(profile?.google_scholar)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" /> Research Areas
                    </label>
                    {loading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : isEditing ? (
                      <Input
                        value={formData.research_areas}
                        onChange={(e) => handleInputChange("research_areas", e.target.value)}
                        placeholder="Research Areas (comma separated)"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatValue(profile?.research_areas)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : sortedLevels.length > 0 ? (
              <div className="space-y-6">
                {sortedLevels.map((level) => (
                  <div key={level} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Level {level}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {coursesByLevel[level].length} course{coursesByLevel[level].length !== 1 ? "s" : ""}
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
                                <TableHead className="w-[100px] text-center">Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {coursesByLevel[level].map((course) => (
                                <TableRow key={course.id} className="hover:bg-muted/50">
                                  <TableCell className="font-medium">
                                    {course.course_code}
                                  </TableCell>
                                  <TableCell>{course.title}</TableCell>
                                  <TableCell className="text-center">
                                    {course.course_unit}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {course.semester}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge className="bg-emerald-600 text-white text-xs">
                                      {getTypeLabel(course.course_type)}
                                    </Badge>
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
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Assigned</h3>
                  <p className="text-muted-foreground text-sm">
                    You don't have any courses assigned yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

