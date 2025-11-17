import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { Users, BookOpen, UserCheck, GraduationCap } from "lucide-react";
import type { Staff, PaginationData } from "@/api/admin";

interface StaffStatisticsProps {
  loading: boolean;
  staff: Staff[];
  pagination: PaginationData;
}

export default function StaffStatistics({
  loading,
  staff,
  pagination,
}: StaffStatisticsProps) {
  // Calculate staff with courses
  const staffWithCourses = staff.filter(s => s.courses && s.courses.length > 0).length;
  
  // Calculate total courses
  const totalCourses = staff.reduce((sum, s) => sum + (s.courses?.length || 0), 0);
  
  // Calculate average courses per staff
  const avgCourses = staff.length > 0 ? (totalCourses / staff.length).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-16" /> : pagination.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All staff members</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <Skeleton className="h-8 w-16" /> : staffWithCourses}
          </div>
          <p className="text-xs text-muted-foreground mt-1">With assigned courses</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">
            {loading ? <Skeleton className="h-8 w-16" /> : totalCourses}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Assigned to staff</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Courses</CardTitle>
          <GraduationCap className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-500">
            {loading ? <Skeleton className="h-8 w-16" /> : avgCourses}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Per staff member</p>
        </CardContent>
      </Card>
    </div>
  );
}

