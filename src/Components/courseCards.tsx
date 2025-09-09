import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/Components/ui/badge";

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
  const typeLabel =
    courseType === "C"
      ? "Core"
      : courseType === "E"
      ? "Elective"
      : courseType || "Course";
  const resolvedAction = actionLabel || "Details";
  return (
    <div>
      <Card className="overflow-hidden">
        {/* Header gradient with badges */}
        <div className="w-full h-28 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 relative">
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/20"
            >
              {courseCode}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-emerald-600 text-white border-transparent">
              {typeLabel}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{courseTitle}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground">
            {`Level ${courseLevel ?? "-"}`} ·{" "}
            {`${courseUnit ?? "-"} Unit${(courseUnit || 0) === 1 ? "" : "s"}`}
          </p>
        </CardContent>

        <CardFooter className="pt-4 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {academicYear ? `Session ${academicYear}` : ""}
          </Badge>
          <Button asChild>
            <Link to={`/unit/${courseId ?? "1"}`}>{resolvedAction}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CourseCards;
