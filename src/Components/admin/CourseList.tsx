import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { BookOpen, Calendar, ArrowRight, Video, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { CreateVideoCallDialog } from "./CreateVideoCallDialog";
import { CallHistoryDialog } from "./CallHistoryDialog";

type Props = {
  courses?: any[];
  isLoadingExternal?: boolean;
};

const CourseList = ({
  courses: externalCourses,
  isLoadingExternal = false,
}: Props) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>(externalCourses || []);
  const [isLoading] = useState<boolean>(false);
  const [isSessionLoading] = useState<boolean>(false);
  const [isVideoCallDialogOpen, setIsVideoCallDialogOpen] = useState(false);
  const [isCallHistoryDialogOpen, setIsCallHistoryDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const handleViewCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleCreateOnlineClass = (courseId: string) => {
    setSelectedCourseId(parseInt(courseId));
    setIsVideoCallDialogOpen(true);
  };

  const handleViewCallHistory = () => {
    setIsCallHistoryDialogOpen(true);
  };

  const handleVideoCallSuccess = (callData: any) => {
    console.log('Video call created successfully:', callData);
    // Navigate to meeting page with the callId as parameter
    const callId = callData?.callId || callData?.streamCallId;
    if (callId) {
      navigate(`/meeting/${callId}`);
    } else {
      console.error('No callId or streamCallId found in response:', callData);
    }
  };

  // Keep local state in sync when parent provides courses
  React.useEffect(() => {
    if (externalCourses) {
      setCourses(externalCourses);
    }
  }, [externalCourses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            Manage your courses and their content
          </p>
        </div>
      </div>

      {isLoading || isSessionLoading || isLoadingExternal ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className=" pt-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <div className="h-5 w-5 bg-muted-foreground/20 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                      <div className="h-4 bg-muted-foreground/10 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-muted-foreground/10 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted-foreground/20 rounded w-12"></div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-muted-foreground/10 rounded"></div>
                      <div className="h-4 bg-muted-foreground/10 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-muted-foreground/10 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No Courses Available</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            There are no courses available for the selected session. Please try
            selecting a different session.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className=" pt-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {course.course_code}
                        </CardTitle>
                        <div className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          {course.course_unit} units
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {course.title}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{course.semester}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Level {course.course_level}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewCourse(String(course.id))}
                    className="w-full "
                    variant="outline"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCreateOnlineClass(String(course.id))}
                      className="flex-1 bg-primary text-white"
                      variant="default"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Create Online Class
                    </Button>
                    <Button
                      onClick={handleViewCallHistory}
                      className="w-1/4"
                      variant="outline"
                      size="default"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <CreateVideoCallDialog
        isOpen={isVideoCallDialogOpen}
        onClose={() => setIsVideoCallDialogOpen(false)}
        courseId={selectedCourseId || undefined}
        onSuccess={handleVideoCallSuccess}
      />
      
      <CallHistoryDialog
        isOpen={isCallHistoryDialogOpen}
        onClose={() => setIsCallHistoryDialogOpen(false)}
      />
    </div>
  );
};

export default CourseList;
