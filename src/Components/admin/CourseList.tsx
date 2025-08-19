import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { BookOpen, Eye, Users, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Course } from "@/types/admin";

interface CourseListProps {
  courses: Course[];
}

const CourseList = ({ courses }: CourseListProps) => {
  const navigate = useNavigate();

  const handleViewCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const getTotalUnits = (course: Course) => {
    return course.modules.reduce(
      (total, module) => total + module.units.length,
      0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            Manage your courses and their content
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      course.status === "published"
                        ? "default"
                        : course.status === "draft"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {course.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrolledStudents} students
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.modules.length} modules
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {getTotalUnits(course)} units
                  </div>
                </div>

                <Button
                  onClick={() => handleViewCourse(course.id)}
                  className="w-full"
                  variant="outline"
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
