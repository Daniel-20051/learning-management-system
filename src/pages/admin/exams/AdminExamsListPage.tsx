import { useEffect, useMemo, useState } from "react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { Api } from "@/api";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

const AdminExamsListPage = () => {
  const api = useMemo(() => new Api(), []);
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const examsBasePath = isSuperAdmin ? "/super-admin/exams" : "/admin/exams";
  const [session, setSession] = useState<string>("");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);

  // Load available sessions from API
  useEffect(() => {
    const loadSessions = async () => {
      setSessionsLoading(true);
      try {
        const response = await api.Getsessions();
        const items = response?.data?.data ?? response?.data ?? [];

        if (Array.isArray(items) && items.length > 0) {
          // Build unique academic year list from API
          const uniqueYears = Array.from(
            new Set(items.map((it: any) => it.academic_year))
          );
          setAvailableSessions(uniqueYears as string[]);

          // Find active session or default to first
          const active = items.find((it: any) => it.status === "Active");
          const defaultSession = active?.academic_year || uniqueYears[0];
          
          if (defaultSession) {
            setSession(defaultSession);
          }
        }
      } catch (err: any) {
        console.error("Error loading sessions:", err);
        const message = err?.response?.data?.message || err?.message || "Failed to load sessions";
        toast.error(message);
        // Fallback to hardcoded values if API fails
        setAvailableSessions(["2024/2025", "2023/2024"]);
        setSession("2024/2025");
      } finally {
        setSessionsLoading(false);
      }
    };

    loadSessions();
  }, [api]);

  // Load courses when session changes
  useEffect(() => {
    if (!session) return; // Don't load courses until session is selected
    
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.GetStaffCourses(session);
        const data = res?.data?.data ?? res?.data ?? [];
        setCourses(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error loading courses:", err);
        const message = err?.response?.data?.message || err?.message || "Failed to load courses";
        toast.error(message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api, session]);

  const handleOpenQuestionBank = (course: any) => {
    const id = String(course.id ?? course.course_id);
    const title = course?.title ?? course?.course_title ?? `Course ${id}`;
    navigate(`${examsBasePath}/question-bank?courseId=${id}&courseTitle=${encodeURIComponent(title)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Exams</h2>
          <p className="text-sm text-muted-foreground">Pick a course to manage its exams.</p>
        </div>
        <div className="w-52">
          <Select value={session} onValueChange={setSession} disabled={sessionsLoading}>
            <SelectTrigger className="h-9">
              {sessionsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select session" />
              )}
            </SelectTrigger>
            <SelectContent>
              {availableSessions.map((sessionOption) => (
                <SelectItem key={sessionOption} value={sessionOption}>
                  {sessionOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[56px]">#</TableHead>
              <TableHead>Course title</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  Loading courses…
                </TableCell>
              </TableRow>
            )}
            {!loading && courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  No courses for this session.
                </TableCell>
              </TableRow>
            )}
            {!loading && courses.map((c, idx) => {
              const id = String(c.id ?? c.course_id);
              const title = c?.title ?? c?.course_title ?? `Course ${id}`;
              const code = c?.code ?? c?.course_code ?? "-";
              return (
                <TableRow key={id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{title}</TableCell>
                  <TableCell>{code}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenQuestionBank(c)}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Question Bank
                      </Button>
                      <Button size="sm" onClick={() => navigate(`${examsBasePath}/${id}?session=${encodeURIComponent(session)}`)}>
                        Manage exams
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminExamsListPage;
