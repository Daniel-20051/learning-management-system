import { Button } from "@/Components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";

interface CourseHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

const CourseHeader = ({ title, subtitle, onBack }: CourseHeaderProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl" />
      <div className="relative p-8">
        <Button
          variant="outline"
          size="sm"
          className="mb-6 hover:bg-background/80 backdrop-blur-sm"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                  {subtitle && (
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
