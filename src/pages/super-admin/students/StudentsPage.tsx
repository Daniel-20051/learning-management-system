import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Plus } from "lucide-react";
import { useStudentsManagement } from "@/hooks/useStudentsManagement";
import StudentsStatistics from "@/Components/super-admin/students/StudentsStatistics";
import StudentsFilters from "@/Components/super-admin/students/StudentsFilters";
import StudentsTable from "@/Components/super-admin/students/StudentsTable";
import StudentsPagination from "@/Components/super-admin/students/StudentsPagination";
import StudentActionDialogs from "@/Components/super-admin/students/StudentActionDialogs";
import ViewStudentDialog from "@/Components/super-admin/students/ViewStudentDialog";
import EditStudentDialog from "@/Components/super-admin/students/EditStudentDialog";
import CreateStudentDialog from "@/Components/super-admin/students/CreateStudentDialog";

export default function StudentsPage() {
  const {
    students,
    pagination,
    loading,
    searchTerm,
    levelFilter,
    statusFilter,
    currentPage,
    selectedStudent,
    selectedStudentId,
    actionLoading,
    showViewDialog,
    showEditDialog,
    showCreateDialog,
    showDeactivateDialog,
    showActivateDialog,
    showResetPasswordDialog,
    setSearchTerm,
    setLevelFilter,
    setStatusFilter,
    setSelectedStudent,
    setSelectedStudentId,
    setShowViewDialog,
    setShowEditDialog,
    setShowCreateDialog,
    setShowDeactivateDialog,
    setShowActivateDialog,
    setShowResetPasswordDialog,
    handlePreviousPage,
    handleNextPage,
    handleDeactivateStudent,
    handleActivateStudent,
    handleResetPassword,
    handleStudentUpdated,
    handleStudentCreated,
  } = useStudentsManagement();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Students Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage all students in the system</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Statistics Cards */}
      <StudentsStatistics
        loading={loading}
        students={students}
        pagination={pagination}
        currentPage={currentPage}
      />

      {/* Main Content Card */}
      <Card className="pt-3">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>A list of all students with their details</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <StudentsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            levelFilter={levelFilter}
            onLevelChange={setLevelFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          {/* Table */}
          <StudentsTable
            loading={loading}
            students={students}
            searchTerm={searchTerm}
            levelFilter={levelFilter}
            statusFilter={statusFilter}
            onViewStudent={(id) => {
              setSelectedStudentId(id);
              setShowViewDialog(true);
            }}
            onEditStudent={(id) => {
              setSelectedStudentId(id);
              setShowEditDialog(true);
            }}
            onDeactivateStudent={(student) => {
              setSelectedStudent(student);
              setShowDeactivateDialog(true);
            }}
            onActivateStudent={(student) => {
              setSelectedStudent(student);
              setShowActivateDialog(true);
            }}
            onResetPassword={(student) => {
              setSelectedStudent(student);
              setShowResetPasswordDialog(true);
            }}
          />

          {/* Pagination */}
          {!loading && students.length > 0 && (
            <StudentsPagination
              currentPage={currentPage}
              pagination={pagination}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Dialogs */}
      <StudentActionDialogs
        selectedStudent={selectedStudent}
        actionLoading={actionLoading}
        showDeactivateDialog={showDeactivateDialog}
        showActivateDialog={showActivateDialog}
        showResetPasswordDialog={showResetPasswordDialog}
        onDeactivateDialogChange={setShowDeactivateDialog}
        onActivateDialogChange={setShowActivateDialog}
        onResetPasswordDialogChange={setShowResetPasswordDialog}
        onConfirmDeactivate={handleDeactivateStudent}
        onConfirmActivate={handleActivateStudent}
        onConfirmResetPassword={handleResetPassword}
      />

      {/* View Student Dialog */}
      <ViewStudentDialog
        key={`view-${selectedStudentId}-${showViewDialog ? 'open' : 'closed'}`}
        open={showViewDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowViewDialog(false);
            setSelectedStudentId(null);
          }
        }}
        studentId={selectedStudentId}
      />

      {/* Edit Student Dialog */}
      <EditStudentDialog
        key={`edit-${selectedStudentId}-${showEditDialog ? 'open' : 'closed'}`}
        open={showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowEditDialog(false);
            setSelectedStudentId(null);
          }
        }}
        studentId={selectedStudentId}
        onStudentUpdated={handleStudentUpdated}
      />

      {/* Create Student Dialog */}
      <CreateStudentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onStudentCreated={handleStudentCreated}
      />
    </div>
  );
}
