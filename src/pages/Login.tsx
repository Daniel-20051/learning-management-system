import { LoginForm } from "@/Components/loginForm";
import { Button } from "@/Components/ui/button";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Button 
        className="absolute top-5 md:top-10 right-5 md:right-10 gap-2" 
        onClick={() => navigate("/admin-login")}
      >
        
        Login as Admin
      </Button>
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
