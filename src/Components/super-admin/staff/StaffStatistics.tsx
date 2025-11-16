import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
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
  const activeStaff = staff.filter(
    (s) => s.admin_status === "active" || s.admin_status === "Active"
  ).length;
  const inactiveStaff = staff.filter(
    (s) => s.admin_status === "inactive" || s.admin_status === "Inactive"
  ).length;

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
          <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <Skeleton className="h-8 w-16" /> : activeStaff}
          </div>
          <p className="text-xs text-muted-foreground mt-1">On current page</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-16" /> : inactiveStaff}
          </div>
          <p className="text-xs text-muted-foreground mt-1">On current page</p>
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">
            {loading ? <Skeleton className="h-8 w-16" /> : 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Recently added</p>
        </CardContent>
      </Card>
    </div>
  );
}

