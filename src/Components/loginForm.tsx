import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Api } from "@/api";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getUserData, getLoginState, setUserData, setLoginState } from "@/lib/cookies";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { setIsLoggedIn, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const api = new Api();

  useEffect(() => {
    const savedUser = getUserData();
    const isLoggedIn = getLoginState();

    if (isLoggedIn && savedUser) {
      setIsLoggedIn(true);
      setUser(savedUser);
    }
  }, [setIsLoggedIn, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.LoginUser({ email, password });
    

      if (response && response.data) {
        const apiResponse = response.data as any;

        // Note: Auth token is now handled by the API layer and stored in cookies automatically

        const user = {
          id: apiResponse.data?.user?.id ,
          email: apiResponse.data?.user?.email,
          matricNumber: apiResponse.data?.user?.matricNumber,
          name:
            apiResponse.data?.user?.userType === "student"
              ? apiResponse.data?.user?.firstName +
                " " +
                apiResponse.data?.user?.lastName
              : apiResponse.data?.user?.fullName,
          role: apiResponse.data?.user?.userType,
        };

        setIsLoggedIn(true);
        setUser(user);
        setLoginState(true);
        setUserData(user);
        toast.success("Login successful!");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Extract the exact error message from the API response
      let errorMessage = "An error occurred during login. Please try again.";
      
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-muted  relative hidden md:block">
            <img
              src="/assets/login-image.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <form className="p-6  md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
