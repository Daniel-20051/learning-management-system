import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useState } from "react";
import { Api } from "@/api";
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
    level: "",
    program_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const api = new Api();

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
          !formData.lname || !formData.phone || !formData.level || !formData.program_id) {
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
        level: formData.level,
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className={cn("flex flex-col gap-6 w-full max-w-4xl")}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Student Registration</h1>
                  <p className="text-muted-foreground text-balance">
                    Create your student account
                  </p>
                </div>

                {/* First Name */}
                <div className="grid gap-2">
                  <Label htmlFor="fname">First Name</Label>
                  <Input
                    id="fname"
                    type="text"
                    placeholder="John"
                    required
                    value={formData.fname}
                    onChange={(e) => handleChange("fname", e.target.value)}
                  />
                </div>

                {/* Last Name */}
                <div className="grid gap-2">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input
                    id="lname"
                    type="text"
                    placeholder="Doe"
                    required
                    value={formData.lname}
                    onChange={(e) => handleChange("lname", e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a secure password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pr-10"
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
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08012345678"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                {/* Level */}
                <div className="grid gap-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleChange("level", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Program */}
                <div className="grid gap-2">
                  <Label htmlFor="program_id">Program</Label>
                  <Select
                    value={formData.program_id}
                    onValueChange={(value) => handleChange("program_id", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Computer Science</SelectItem>
                      <SelectItem value="2">Information Technology</SelectItem>
                      <SelectItem value="3">Software Engineering</SelectItem>
                      <SelectItem value="4">Data Science</SelectItem>
                      <SelectItem value="5">Cybersecurity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
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
        <div className="text-muted-foreground text-center text-xs text-balance">
          By registering, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}

