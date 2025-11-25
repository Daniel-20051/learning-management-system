import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { AuthApi } from "@/api/auth";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { ArrowLeft, Mail, CheckCircle2, Loader2, UserCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [userType, setUserType] = useState<"student" | "staff">("student");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic email validation
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setShowSuccess(false);

            const authApi = new AuthApi();
            const response = await authApi.requestPasswordReset(email, userType);

            // Only show success if we get a successful response
            if (response && response.status >= 200 && response.status < 300) {
                setShowSuccess(true);
                setEmail(""); // Clear email field
            } else {
                setError("Unable to send reset email. Please try again.");
            }
        } catch (err: any) {
            // Show the actual error message
            const errorMessage = err?.response?.data?.message ||
                err?.message ||
                "Unable to send reset email. Please try again.";
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
                        <div className="flex items-center justify-between mb-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/")}
                                className="h-8 w-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex-1" />
                        </div>
                        <h1 className="text-2xl font-bold">Forgot Password?</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-200">
                                Email Sent!
                            </AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                If an account exists with that email, you will receive password reset instructions.
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
                        {/* User Type Selection */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userType" className="text-sm font-medium">
                                Account Type
                            </label>
                            <Select value={userType} onValueChange={(value: "student" | "staff") => setUserType(value)}>
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Select account type" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-10"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="text-center text-sm">
                        Remember your password?{" "}
                        <Link
                            to="/"
                            className="font-medium text-primary hover:underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
