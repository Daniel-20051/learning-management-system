import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useState, useEffect } from "react";
import { Api } from "@/api";
import type { MarketplaceProgram } from "@/api/marketplace";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fname: "",
    lname: "",
    phone: "",
    program_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [programs, setPrograms] = useState<MarketplaceProgram[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  const api = new Api();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      const response = await api.GetMarketplacePrograms();
      if (response.data && response.data.data) {
        setPrograms(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs. Please refresh the page.");
    } finally {
      setIsLoadingPrograms(false);
    }
  };

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
          !formData.lname || !formData.phone || !formData.program_id) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      const response = await api.RegisterStudent({
        email: formData.email,
        password: formData.password,
        fname: formData.fname,
        lname: formData.lname,
        phone: formData.phone,
        level: "100", // Default to 100 level for new students
        program_id: parseInt(formData.program_id),
      });

      if (response && response.data) {
        const apiResponse = response.data as any;
        
        if (apiResponse.status || apiResponse.success) {
          toast.success(
            apiResponse.message || "Student registered successfully! Please check your email."
          );
          // Redirect to login page after successful registration
          setTimeout(() => {
            navigate("/");
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
                  <h1 className="text-xl font-bold">Student Registration</h1>
                  <p className="text-muted-foreground text-sm">
                    Create your student account
                  </p>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="fname" className="text-sm">First Name</Label>
                    <Input
                      id="fname"
                      type="text"
                      placeholder="John"
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
                      placeholder="Doe"
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
                    placeholder="student@example.com"
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
                    placeholder="08012345678"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Program */}
                <div className="grid gap-1.5">
                  <Label htmlFor="program_id" className="text-sm">Program</Label>
                  <Select
                    value={formData.program_id}
                    onValueChange={(value) => handleChange("program_id", value)}
                    required
                    disabled={isLoadingPrograms}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={isLoadingPrograms ? "Loading programs..." : "Select program"} />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={String(program.id)}>
                          {program.title}
                          {program.faculty && ` (${program.faculty.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    to="/"
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

