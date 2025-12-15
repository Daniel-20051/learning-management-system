import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/Components/ui/badge";
import { useSession } from "@/context/SessionContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { MoreVertical, Users, UserMinus, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import ParticipantsDialog from "./ParticipantsDialog";

interface Instructor {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
}

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
  registrationId?: number | string;
  instructor?: Instructor;
  onUnregister?: () => void;
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
  registrationId,
  instructor,
  onUnregister: _onUnregister,
}: CourseCardsProps) => {
  const navigate = useNavigate();
  const { selectedSession, selectedSemester } = useSession();
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [unregisterDialogOpen, setUnregisterDialogOpen] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);

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

  const handleUnregister = async () => {
    if (!registrationId) return;
    
    setIsUnregistering(true);
    try {
      // Course unregistration is no longer available
      toast.error(
        "Course unregistration is no longer available. " +
        "Please contact your administrator if you need to make changes to your course registration."
      );
      setUnregisterDialogOpen(false);
    } catch (error) {
      console.error("Error unregistering from course:", error);
      toast.error("Unable to unregister from course. Please contact your administrator.");
    } finally {
      setIsUnregistering(false);
    }
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
          <div className="absolute top-2 md:top-3 right-2 md:right-3 flex items-center gap-1">
            <Badge className="bg-emerald-600 text-white border-transparent text-xs md:text-sm px-2 py-1">
              {typeLabel}
            </Badge>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/20 hover:bg-white/30 text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() => setParticipantsDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Participants
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setUnregisterDialogOpen(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unregister
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Participants Dialog */}
        <ParticipantsDialog
          open={participantsDialogOpen}
          onOpenChange={setParticipantsDialogOpen}
          courseId={courseId ?? ""}
          courseTitle={courseTitle}
          academicYear={academicYear}
          semester={selectedSemester ?? undefined}
        />

        {/* Unregister Confirmation Dialog */}
        <AlertDialog open={unregisterDialogOpen} onOpenChange={setUnregisterDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unregister from Course</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unregister from <strong>{courseTitle}</strong> ({courseCode})?
                This action cannot be undone and you may need to re-register later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUnregistering}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnregister}
                disabled={isUnregistering}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isUnregistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unregistering...
                  </>
                ) : (
                  "Unregister"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
          <CardTitle className="text-base md:text-xl leading-tight">
            {courseTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 md:px-6 space-y-1">
          <p className="text-muted-foreground text-xs md:text-sm">
            {`Level ${courseLevel ?? "-"}`} ·{" "}
            {`${courseUnit ?? "-"} Unit${(courseUnit || 0) === 1 ? "" : "s"}`}
          </p>
          {instructor && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GraduationCap className="h-3 w-3" />
              <span className="truncate">{instructor.full_name}</span>
            </div>
          )}
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
