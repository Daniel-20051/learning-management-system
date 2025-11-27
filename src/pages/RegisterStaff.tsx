import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useState } from "react";
import { AuthApi } from "@/api/auth";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterStaffPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fname: "",
    lname: "",
    phone: "",
    department: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const authApi = new AuthApi();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate all fields
      if (!formData.email || !formData.password || !formData.fname || 
          !formData.lname || !formData.phone || !formData.department) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      const response = await authApi.RegisterStaff({
        email: formData.email,
        password: formData.password,
        fname: formData.fname,
        lname: formData.lname,
        phone: formData.phone,
        department: formData.department,
      });

      if (response && response.data) {
        const apiResponse = response.data as any;
        
        if (apiResponse.status || apiResponse.success) {
          toast.success(
            apiResponse.message || "Staff registered successfully! Please check your email."
          );
          // Redirect to staff login page after successful registration
          setTimeout(() => {
            navigate("/admin/login");
          }, 2000);
        } else {
          toast.error(apiResponse.message || "Registration failed. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      let errorMessage = "An error occurred during registration. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center text-center mb-2">
                  <h1 className="text-xl font-bold">Staff Registration</h1>
                  <p className="text-muted-foreground text-sm">
                    Create your staff account
                  </p>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="fname" className="text-sm">First Name</Label>
                    <Input
                      id="fname"
                      type="text"
                      placeholder="Jane"
                      required
                      value={formData.fname}
                      onChange={(e) => handleChange("fname", e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="lname" className="text-sm">Last Name</Label>
                    <Input
                      id="lname"
                      type="text"
                      placeholder="Smith"
                      required
                      value={formData.lname}
                      onChange={(e) => handleChange("lname", e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Password */}
                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a secure password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pr-10 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 cursor-pointer w-4" />
                      ) : (
                        <Eye className="h-4 cursor-pointer w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="grid gap-1.5">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08012345679"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Department */}
                <div className="grid gap-1.5">
                  <Label htmlFor="department" className="text-sm">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Computer Science"
                    required
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full cursor-pointer h-9 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>

                {/* Link to Login */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Already have an account?{" "}
                  </span>
                  <Link
                    to="/admin/login"
                    className="text-primary font-medium underline-offset-2 hover:underline"
                  >
                    Login here
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="text-muted-foreground text-center text-xs mt-4">
          By registering, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

