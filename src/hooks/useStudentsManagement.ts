import { useState, useEffect } from "react";
import {
  getStudents,
  deactivateStudent,
  activateStudent,
  resetStudentPassword,
  type Student,
  type PaginationData,
  type UpdateStudentData,
} from "@/api/admin";
import { toast } from "sonner";

export function useStudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, levelFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchStudents();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) params.search = searchTerm;
      if (levelFilter !== "all") params.level = parseInt(levelFilter);
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await getStudents(params);
      if (response.success) {
        setStudents(response.data.students);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDeactivateStudent = async () => {
    if (!selectedStudent) return;

    try {
      setActionLoading(true);
      const response = await deactivateStudent(selectedStudent.id);
      if (response.success) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === selectedStudent.id
              ? { ...student, admin_status: "inactive" }
              : student
          )
        );
        toast.success(response.message);
        setShowDeactivateDialog(false);
      }
    } catch (error: any) {
      console.error("Error deactivating student:", error);
      toast.error(error.response?.data?.message || "Failed to deactivate student");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateStudent = async () => {
    if (!selectedStudent) return;

    try {
      setActionLoading(true);
      const response = await activateStudent(selectedStudent.id);
      if (response.success) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === selectedStudent.id
              ? { ...student, admin_status: "active" }
              : student
          )
        );
        toast.success(response.message);
        setShowActivateDialog(false);
      }
    } catch (error: any) {
      console.error("Error activating student:", error);
      toast.error(error.response?.data?.message || "Failed to activate student");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStudent) return;

    try {
      setActionLoading(true);
      const tempPassword = `Student${selectedStudent.id}!${Math.random()
        .toString(36)
        .slice(-4)}`;
      const response = await resetStudentPassword(selectedStudent.id, {
        newPassword: tempPassword,
      });
      if (response.success) {
        toast.success(response.message);
        setShowResetPasswordDialog(false);
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStudentUpdated = (updatedData: UpdateStudentData & { id: number }) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === updatedData.id ? { ...student, ...updatedData } : student
      )
    );
  };

  const handleStudentCreated = () => {
    // Refresh the students list after creating a new student
    fetchStudents();
  };

  return {
    // State
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

    // Setters
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

    // Handlers
    handlePreviousPage,
    handleNextPage,
    handleDeactivateStudent,
    handleActivateStudent,
    handleResetPassword,
    handleStudentUpdated,
    handleStudentCreated,
  };
}

