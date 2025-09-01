import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Calendar } from "lucide-react";

interface SessionSemesterDialogProps {
  onSelectionChange?: (session: string, semester: string) => void;
}

const SessionSemesterDialog: React.FC<SessionSemesterDialogProps> = ({
  onSelectionChange,
}) => {
  // Get current academic year for default selection
  const getCurrentAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const academicYear = currentMonth >= 9 ? currentYear : currentYear - 1;
    return `${academicYear}/${academicYear + 1}`;
  };

  const [selectedSession, setSelectedSession] = useState<string>(
    getCurrentAcademicYear()
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("1ST");

  // Generate sessions from 2023/2024 to current academic year
  const generateSessions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

    // Academic year starts in September (month 9)
    // If current month is before September, we're still in the previous academic year
    const academicYear = currentMonth >= 9 ? currentYear : currentYear - 1;

    const sessions = [];
    const startYear = 2023;

    for (let year = startYear; year <= academicYear; year++) {
      const nextYear = year + 1;
      sessions.push(`${year}/${nextYear}`);
    }

    return sessions;
  };

  const sessions = generateSessions();

  const semesters = ["1ST", "2ND"];

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    onSelectionChange?.(session, selectedSemester);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    onSelectionChange?.(selectedSession, semester);
  };

  return (
    <div className="w-full md:w-[400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Academic Session
          </label>
          <Select value={selectedSession} onValueChange={handleSessionChange}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select academic session" />
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

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Semester
          </label>
          <Select value={selectedSemester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select semester" />
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
      </div>
    </div>
  );
};

export default SessionSemesterDialog;
