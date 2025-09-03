import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import { Api } from "@/api";

interface SessionSemesterDialogProps {
  onSelectionChange?: (session: string, semester: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  isStaff?: boolean;
}

const SessionSemesterDialog: React.FC<SessionSemesterDialogProps> = ({
  onSelectionChange,
  onLoadingChange,
  isStaff = false,
}) => {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [apiSessions, setApiSessions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sessions come from API only
  const sessions = apiSessions;

  const semesters = ["1ST", "2ND"];

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    onSelectionChange?.(session, selectedSemester);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    onSelectionChange?.(selectedSession, semester);
  };

  // Load default values from API: pick the active semester entry
  useEffect(() => {
    const api = new Api();
    const loadDefaults = async () => {
      setIsLoading(true);
      onLoadingChange?.(true);
      try {
        const response = await api.Getsessions();
        const items = response?.data?.data ?? response?.data ?? [];

        if (Array.isArray(items) && items.length > 0) {
          // Build unique academic year list from API
          const uniqueYears = Array.from(
            new Set(items.map((it: any) => it.academic_year))
          );
          setApiSessions(uniqueYears as string[]);

          // Find active semester; if multiple, prefer the most recent by date/start_date
          const active = items.find((it: any) => it.status === "Active");

          if (active?.academic_year && active?.semester) {
            setSelectedSession(active.academic_year);
            setSelectedSemester(active.semester);
            onSelectionChange?.(active.academic_year, active.semester);
            return;
          }

          // If no active item, default to the first entry from API
          const first = items[0];
          if (first?.academic_year) {
            const defaultSemester = first?.semester || "1ST";
            setSelectedSession(first.academic_year);
            setSelectedSemester(defaultSemester);
            onSelectionChange?.(first.academic_year, defaultSemester);
            return;
          }
        }
      } catch (err) {
        // Fall back silently to generated defaults
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    };

    loadDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full md:max-w-[400px]">
      <div
        className={`grid grid-cols-1 ${
          !isStaff ? "md:grid-cols-2" : "md:grid-cols-1"
        } gap-4 mb-4`}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Academic Session
          </label>
          <Select
            value={selectedSession}
            onValueChange={handleSessionChange}
            disabled={isLoading}
          >
            <SelectTrigger className="cursor-pointer">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select academic session" />
              )}
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem
                  className="cursor-pointer"
                  key={session}
                  value={session}
                >
                  {session}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isStaff && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Semester
            </label>
            <Select
              value={selectedSemester}
              onValueChange={handleSemesterChange}
              disabled={isLoading}
            >
              <SelectTrigger className="cursor-pointer">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select semester" />
                )}
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={semester}
                    value={semester}
                  >
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSemesterDialog;
