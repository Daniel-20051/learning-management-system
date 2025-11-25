import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { AuthApi } from "@/api/auth";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Lock, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const userType = searchParams.get("type");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // If no token, show error screen
    if (!token) {
        return (
            <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-6 bg-card p-8 rounded-xl border shadow-sm text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
                            <p className="text-sm text-muted-foreground">
                                This password reset link is invalid or has expired.
                            </p>
                        </div>
                        <Button onClick={() => navigate("/forgot-password")}>
                            Request New Reset Link
                        </Button>
                        <Link
                            to="/"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!newPassword) {
            setError("Please enter a new password");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setShowSuccess(false);

            const authApi = new AuthApi();
            const response = await authApi.resetPassword(token, newPassword, userType || "student");

            if (response && response.status >= 200 && response.status < 300) {
                setShowSuccess(true);
                setNewPassword("");
                setConfirmPassword("");

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            } else {
                setError("Unable to reset password. Please try again.");
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message ||
                err?.message ||
                "Unable to reset password. Please try again.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6 bg-card p-8 rounded-xl border shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-2xl font-bold">Reset Password</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your new password below.
                            {userType && (
                                <span className="block mt-1 text-xs">
                                    Account type: <span className="font-medium capitalize">{userType}</span>
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-200">
                                Password Reset Successfully!
                            </AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                Your password has been reset. Redirecting to login...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* New Password */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="newPassword" className="text-sm font-medium">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isSubmitting || showSuccess}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isSubmitting || showSuccess}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || showSuccess}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>

                    {/* Back to Login Link */}
                    {!showSuccess && (
                        <div className="text-center text-sm">
                            <Link
                                to="/"
                                className="font-medium text-primary hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
