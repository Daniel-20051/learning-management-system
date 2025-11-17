import { useState, useEffect } from "react";
import {
  getStaff,
  deactivateStaff,
  resetStaffPassword,
  type Staff,
  type PaginationData,
  type UpdateStaffData,
} from "@/api/admin";
import { toast } from "sonner";

export function useStaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchStaff();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) params.search = searchTerm;

      const response = await getStaff(params);
      if (response.success) {
        setStaff(response.data.staff);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      toast.error(error.response?.data?.message || "Failed to load staff");
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

  const handleDeactivateStaff = async () => {
    if (!selectedStaff) return;

    try {
      setActionLoading(true);
      const response = await deactivateStaff(selectedStaff.id);
      if (response.success) {
        setStaff((prevStaff) =>
          prevStaff.map((member) =>
            member.id === selectedStaff.id
              ? { ...member, admin_status: "inactive" }
              : member
          )
        );
        toast.success(response.message);
        setShowDeactivateDialog(false);
      }
    } catch (error: any) {
      console.error("Error deactivating staff:", error);
      toast.error(error.response?.data?.message || "Failed to deactivate staff");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStaff) return;

    try {
      setActionLoading(true);
      const tempPassword = `Staff${selectedStaff.id}!${Math.random()
        .toString(36)
        .slice(-4)}`;
      const response = await resetStaffPassword(selectedStaff.id, {
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

  const handleStaffUpdated = (updatedData: UpdateStaffData & { id: number }) => {
    setStaff((prevStaff) =>
      prevStaff.map((member) =>
        member.id === updatedData.id ? { ...member, ...updatedData } : member
      )
    );
  };

  const handleStaffCreated = () => {
    // Refresh the staff list after creating a new staff member
    fetchStaff();
  };

  return {
    // State
    staff,
    pagination,
    loading,
    searchTerm,
    currentPage,
    selectedStaff,
    selectedStaffId,
    actionLoading,
    showEditDialog,
    showCreateDialog,
    showDeactivateDialog,
    showResetPasswordDialog,

    // Setters
    setSearchTerm,
    setSelectedStaff,
    setSelectedStaffId,
    setShowEditDialog,
    setShowCreateDialog,
    setShowDeactivateDialog,
    setShowResetPasswordDialog,

    // Handlers
    handlePreviousPage,
    handleNextPage,
    handleDeactivateStaff,
    handleResetPassword,
    handleStaffUpdated,
    handleStaffCreated,
    refetchStaff: fetchStaff,
  };
}

