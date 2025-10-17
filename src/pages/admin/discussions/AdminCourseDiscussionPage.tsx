import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/Components/ui/card";
import Discussion from "@/pages/student/unit/components/Discussion";
import socketService from "@/services/Socketservice";
import { Button } from "@/Components/ui/button";
import { ChevronLeft } from "lucide-react";

const AdminCourseDiscussionPage = () => {
  const { courseId = "" } = useParams();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const academicYear = search.get("session") || "2024/2025";
  const semester = "2ND";
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!courseId) return;
    setError("");
    setIsLoading(true);
    // Join discussion room; backend may return messages
    socketService.joinDiscussion(Number(courseId), academicYear, semester, (res) => {
      if (res?.ok && Array.isArray(res?.messages)) {
        setInitialMessages(res.messages);
        setIsLoading(false);
      } else {
        setError(String(res?.error || "Failed to load discussion."));
        setIsLoading(false);
      }
    });
    // No explicit leave needed if server manages by connection; otherwise we'd emit a leave here
  }, [courseId, academicYear]);

  return (
    <Card className="h-full p-0 overflow-hidden">
      <div className="border-b px-4 py-3 font-semibold flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span>Course Discussion</span>
      </div>
      <div className="h-[70vh]">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin"></div>
              <span>Loading discussion...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-red-600 text-center px-4">{error}</div>
          </div>
        ) : (
          <Discussion
            courseId={courseId}
            moduleId={"-"}
            unitId={"-"}
            academicYear={academicYear}
            semester={semester}
            initialMessages={initialMessages}
          />
        )}
      </div>
    </Card>
  );
};

export default AdminCourseDiscussionPage;


