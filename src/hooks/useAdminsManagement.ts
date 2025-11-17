import { useState, useEffect, useMemo } from "react";
import { getAdmins, type AdminListItem } from "@/api/admin";
import { toast } from "sonner";

export function useAdminsManagement() {
  const [allAdmins, setAllAdmins] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAdmins();
      if (response.success) {
        setAllAdmins(response.data.admins);
        setCount(response.data.count);
      }
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      toast.error(error.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to admins
  const admins = useMemo(() => {
    let filtered = [...allAdmins];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.email.toLowerCase().includes(searchLower) ||
          admin.fname.toLowerCase().includes(searchLower) ||
          admin.lname.toLowerCase().includes(searchLower) ||
          `${admin.fname} ${admin.lname}`.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (admin) => admin.status === statusFilter
      );
    }

    return filtered;
  }, [allAdmins, searchTerm, statusFilter]);

  // Calculate statistics from all admins (not filtered)
  const totalAdmins = count;
  const activeAdmins = allAdmins.filter((admin) => admin.status === "active").length;
  const inactiveAdmins = allAdmins.filter((admin) => admin.status === "inactive").length;

  return {
    // State
    admins,
    loading,
    searchTerm,
    statusFilter,
    totalAdmins,
    activeAdmins,
    inactiveAdmins,

    // Setters
    setSearchTerm,
    setStatusFilter,

    // Handlers
    refetchAdmins: fetchAdmins,
  };
}

