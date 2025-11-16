import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Skeleton } from "@/Components/ui/skeleton";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Clock,
  CheckCircle2,
  XCircle,
  UserCog,
  BookOpen,
  FileText,
  Settings,
  Edit,
  Save,
  X
} from "lucide-react";
import { getAdminProfile, updateAdminProfile, type AdminProfile, type UpdateAdminProfileData } from "@/api/admin";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { setUserData } from "@/lib/cookies";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    mname: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        fname: profile.fname,
        lname: profile.lname,
        mname: profile.mname || "",
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getAdminProfile();
      if (response.success) {
        setProfile(response.data.admin);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current profile
    if (profile) {
      setFormData({
        fname: profile.fname,
        lname: profile.lname,
        mname: profile.mname || "",
        email: profile.email,
        phone: profile.phone,
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      const updateData: UpdateAdminProfileData = {
        id: profile.id,
        email: formData.email,
        fname: formData.fname,
        lname: formData.lname,
        mname: formData.mname || null,
        role: profile.role,
        phone: formData.phone,
      };

      const response = await updateAdminProfile(updateData);
      if (response.success) {
        // Optimistically update the profile with the new data
        const updatedProfile = {
          ...profile,
          fname: formData.fname,
          lname: formData.lname,
          mname: formData.mname || null,
          email: formData.email,
          phone: formData.phone,
        };
        setProfile(updatedProfile);

        // Update user in AuthContext and cookies to update the navbar
        if (user) {
          const updatedUser = {
            ...user,
            name: `${formData.fname} ${formData.mname ? formData.mname + " " : ""}${formData.lname}`,
            email: formData.email,
          };
          setUser(updatedUser);
          setUserData(updatedUser);
        }

        toast.success(response.message || "Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = (fname?: string, lname?: string) => {
    if (!fname && !lname) return "SA";
    const firstInitial = fname?.[0] || "";
    const lastInitial = lname?.[0] || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Profile</h1>
          <p className="text-sm md:text-base text-muted-foreground">View and edit your profile information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1 sm:flex-none">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card className="lg:col-span-1 pt-3">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Your account avatar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-3xl">
                {getInitials(isEditing ? formData.fname : profile.fname, isEditing ? formData.lname : profile.lname)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-lg">
                {isEditing ? formData.fname : profile.fname} {(isEditing ? formData.mname : profile.mname) ? (isEditing ? formData.mname : profile.mname) + " " : ""}{isEditing ? formData.lname : profile.lname}
              </p>
              <Badge variant={profile.status === "active" ? "default" : "secondary"} className="mt-2">
                {profile.status}
              </Badge>
            </div>
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {profile.role.replace("_", " ").toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card className="lg:col-span-2 pt-3">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">First Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.fname} 
                    onChange={(e) => handleInputChange("fname", e.target.value)}
                    disabled={!isEditing} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Last Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.lname} 
                    onChange={(e) => handleInputChange("lname", e.target.value)}
                    disabled={!isEditing} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Middle Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.mname} 
                    onChange={(e) => handleInputChange("mname", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.email} 
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Account ID</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Input value={`#${profile.id}`} disabled />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{formatDate(profile.created_at)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Login:</span>
                <span className="font-medium">{formatDate(profile.last_login)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {profile.two_factor_enabled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Two-Factor Authentication Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Two-Factor Authentication Disabled</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Card */}
      <Card className="pt-3">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Your access rights and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Students Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Students
              </h3>
              <div className="space-y-2 pl-6">
                <PermissionItem label="View" enabled={profile.permissions.students.view} />
                <PermissionItem label="Create" enabled={profile.permissions.students.create} />
                <PermissionItem label="Edit" enabled={profile.permissions.students.edit} />
                <PermissionItem label="Delete" enabled={profile.permissions.students.delete} />
              </div>
            </div>

            {/* Staff Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Staff
              </h3>
              <div className="space-y-2 pl-6">
                <PermissionItem label="View" enabled={profile.permissions.staff.view} />
                <PermissionItem label="Create" enabled={profile.permissions.staff.create} />
                <PermissionItem label="Edit" enabled={profile.permissions.staff.edit} />
                <PermissionItem label="Delete" enabled={profile.permissions.staff.delete} />
              </div>
            </div>

            {/* Admins Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admins
              </h3>
              <div className="space-y-2 pl-6">
                <PermissionItem label="View" enabled={profile.permissions.admins.view} />
                <PermissionItem label="Create" enabled={profile.permissions.admins.create} />
                <PermissionItem label="Edit" enabled={profile.permissions.admins.edit} />
                <PermissionItem label="Delete" enabled={profile.permissions.admins.delete} />
              </div>
            </div>

            {/* Courses Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </h3>
              <div className="space-y-2 pl-6">
                <PermissionItem label="View" enabled={profile.permissions.courses.view} />
                <PermissionItem label="Create" enabled={profile.permissions.courses.create} />
                <PermissionItem label="Edit" enabled={profile.permissions.courses.edit} />
                <PermissionItem label="Delete" enabled={profile.permissions.courses.delete} />
              </div>
            </div>

            {/* Content Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </h3>
              <div className="space-y-2 pl-6">
                <PermissionItem label="Modules" enabled={profile.permissions.content.modules} />
                <PermissionItem label="Units" enabled={profile.permissions.content.units} />
                <PermissionItem label="Quizzes" enabled={profile.permissions.content.quizzes} />
                <PermissionItem label="Exams" enabled={profile.permissions.content.exams} />
              </div>
            </div>

            {/* System Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System
              </h3>
              <div className="space-y-2 pl-6">
                <PermissionItem label="Settings" enabled={profile.permissions.system.settings} />
                <PermissionItem label="Analytics" enabled={profile.permissions.system.analytics} />
                <PermissionItem label="Logs" enabled={profile.permissions.system.logs} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for permission items
function PermissionItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={enabled ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

