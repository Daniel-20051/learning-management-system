import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* 404 Icon */}
            <div className="text-6xl font-bold text-muted-foreground">404</div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Page Not Found</h1>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
