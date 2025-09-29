import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/Components/ui/badge";
import { useSession } from "@/context/SessionContext";

interface CourseCardsProps {
  courseCode: string;
  courseTitle: string;
  courseLevel?: number;
  courseUnit?: number;
  semester?: string;
  price?: string | number;
  currency?: string;
  academicYear?: string;
  courseType?: string; // e.g. "C" or "E"
  examFee?: number;
  courseId?: number | string;
  actionLabel?: string;
}

const CourseCards = ({
  courseCode,
  courseTitle,
  courseLevel,
  courseUnit,

  academicYear,
  courseType,

  courseId,
  actionLabel,
}: CourseCardsProps) => {
  const navigate = useNavigate();
  const { selectedSession, selectedSemester } = useSession();

  const typeLabel =
    courseType === "C"
      ? "Core"
      : courseType === "E"
      ? "Elective"
      : courseType || "Course";
  const resolvedAction = actionLabel || "Details";

  const handleCourseClick = () => {
    const params = new URLSearchParams();
    if (selectedSession) params.set("session", selectedSession);
    if (selectedSemester) params.set("semester", selectedSemester);

    const queryString = params.toString();
    const url = `/unit/${courseId ?? "1"}${
      queryString ? `?${queryString}` : ""
    }`;
    navigate(url);
  };
  return (
    <div>
      <Card className="overflow-hidden">
        {/* Header gradient with badges */}
        <div className="w-full h-20 md:h-28 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 relative">
          <div className="absolute top-2 md:top-3 left-2 md:left-3">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/20 text-xs md:text-sm px-2 py-1"
            >
              {courseCode}
            </Badge>
          </div>
          <div className="absolute top-2 md:top-3 right-2 md:right-3">
            <Badge className="bg-emerald-600 text-white border-transparent text-xs md:text-sm px-2 py-1">
              {typeLabel}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
          <CardTitle className="text-base md:text-xl leading-tight">
            {courseTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 md:px-6">
          <p className="text-muted-foreground text-xs md:text-sm">
            {`Level ${courseLevel ?? "-"}`} ·{" "}
            {`${courseUnit ?? "-"} Unit${(courseUnit || 0) === 1 ? "" : "s"}`}
          </p>
        </CardContent>

        <CardFooter className="pt-3 md:pt-4 px-3 md:px-6 pb-3 md:pb-6 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {academicYear ? `Session ${academicYear}` : ""}
          </Badge>
          <Button
            onClick={handleCourseClick}
            size="sm"
            className="text-xs md:text-sm"
          >
            {resolvedAction}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CourseCards;
