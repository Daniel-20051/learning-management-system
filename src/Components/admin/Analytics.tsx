import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";

import type { Course } from "@/types/admin";

interface AnalyticsProps {
  courses: Course[];
}

const Analytics = ({ courses }: AnalyticsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Course Analytics</h2>
        <p className="text-muted-foreground">
          Track performance and engagement across your courses
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-xs text-muted-foreground">+2 this month</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold">
                {courses.reduce(
                  (sum, course) => sum + course.enrolledStudents,
                  0
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Completion Rate</p>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Avg. Rating</p>
              <p className="text-2xl font-bold">4.8/5</p>
              <p className="text-xs text-muted-foreground">
                +0.2 from last month
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Activity</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• New student enrolled in "Introduction to React"</p>
              <p>
                • Module "Getting Started with React" completed by 5 students
              </p>
              <p>• New course "Advanced JavaScript" created</p>
              <p>• Course "Introduction to React" updated with new content</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
