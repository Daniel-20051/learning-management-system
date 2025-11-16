import { useState, useEffect } from "react";
import { getStaff, type Staff, type PaginationData } from "@/api/admin";
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

  return {
    // State
    staff,
    pagination,
    loading,
    searchTerm,
    currentPage,

    // Setters
    setSearchTerm,

    // Handlers
    handlePreviousPage,
    handleNextPage,
    refetchStaff: fetchStaff,
  };
}

