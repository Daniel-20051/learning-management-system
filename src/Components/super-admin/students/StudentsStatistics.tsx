import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { Users, UserCheck, UserX, GraduationCap } from "lucide-react";
import type { Student, PaginationData } from "@/api/admin";

interface StudentsStatisticsProps {
  loading: boolean;
  students: Student[];
  pagination: PaginationData;
  currentPage: number;
}

export default function StudentsStatistics({
  loading,
  students,
  pagination,
  currentPage,
}: StudentsStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-16" /> : pagination.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across all levels</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              students.filter(
                (s) => s.admin_status === "active" || s.admin_status === "Active"
              ).length
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">On current page</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              students.filter(
                (s) => s.admin_status === "Pending" || s.admin_status === "inactive"
              ).length
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">On current page</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Page</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              `${currentPage}/${pagination.totalPages || 1}`
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pagination.limit || 10} per page
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

