import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Search } from "lucide-react";
import { useStaffManagement } from "@/hooks/useStaffManagement";
import StaffStatistics from "@/Components/super-admin/staff/StaffStatistics";
import StaffTable from "@/Components/super-admin/staff/StaffTable";
import StudentsPagination from "@/Components/super-admin/students/StudentsPagination";

export default function StaffPage() {
  const {
    staff,
    pagination,
    loading,
    searchTerm,
    currentPage,
    setSearchTerm,
    handlePreviousPage,
    handleNextPage,
  } = useStaffManagement();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage all staff members in the system</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Statistics */}
      <StaffStatistics loading={loading} staff={staff} pagination={pagination} />

      {/* Main Content Card */}
      <Card className="pt-3">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Staff</CardTitle>
              <CardDescription>View and manage staff accounts</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <StaffTable
            loading={loading}
            staff={staff}
            searchTerm={searchTerm}
          />

          {/* Pagination */}
          {!loading && staff.length > 0 && (
            <StudentsPagination
              currentPage={currentPage}
              pagination={pagination}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

