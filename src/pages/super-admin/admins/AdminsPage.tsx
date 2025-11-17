import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Skeleton } from "@/Components/ui/skeleton";
import { 
  Plus, 
  Search, 
  Filter, 
  Activity,
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/Components/ui/select";
import { useAdminsManagement } from "@/hooks/useAdminsManagement";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ViewPermissionsDialog from "@/Components/super-admin/admins/ViewPermissionsDialog";
import AdminsTable from "@/Components/super-admin/admins/AdminsTable";
import CreateAdminDialog from "@/Components/super-admin/dialogs/CreateAdminDialog";
import EditAdminDialog from "@/Components/super-admin/admins/EditAdminDialog";
import AdminActionDialogs from "@/Components/super-admin/admins/AdminActionDialogs";
import { deactivateAdmin, getAdminProfile } from "@/api/admin";
import type { AdminListItem } from "@/api/admin";

export default function AdminsPage() {
  const navigate = useNavigate();
  const {
    admins,
    loading,
    searchTerm,
    statusFilter,
    totalAdmins,
    activeAdmins,
    inactiveAdmins,
    setSearchTerm,
    setStatusFilter,
    refetchAdmins,
  } = useAdminsManagement();

  const [selectedAdmin, setSelectedAdmin] = useState<AdminListItem | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<number | undefined>();

  useEffect(() => {
    fetchCurrentAdmin();
  }, []);

  const fetchCurrentAdmin = async () => {
    try {
      const response = await getAdminProfile();
      if (response.success) {
        setCurrentAdminId(response.data.admin.id);
      }
    } catch (error) {
      console.error("Error fetching current admin:", error);
    }
  };

  const handleCreateAdmin = () => {
    refetchAdmins();
  };

  const handleEditAdmin = () => {
    refetchAdmins();
  };

  const handleDeactivateAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setActionLoading(true);
      const response = await deactivateAdmin(selectedAdmin.id);
      if (response.success) {
        toast.success(response.message || "Admin deactivated successfully");
        refetchAdmins();
        setShowDeactivateDialog(false);
        setSelectedAdmin(null);
      }
    } catch (error: any) {
      console.error("Error deactivating admin:", error);
      toast.error(error.response?.data?.message || "Failed to deactivate admin");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admins Management</h1>
          <p className="text-muted-foreground">Manage all system administrators</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <Card className="pt-3" >
        <CardHeader>
          <CardTitle>Admin Statistics</CardTitle>
          <CardDescription>Overview of admin data</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Admins</p>
                <p className="text-2xl font-bold">{totalAdmins}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Active Admins</p>
                <p className="text-2xl font-bold text-green-500">{activeAdmins}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Inactive Admins</p>
                <p className="text-2xl font-bold text-red-500">{inactiveAdmins}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Recent Actions</p>
                <p className="text-2xl font-bold text-blue-500">-</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Admins</CardTitle>
              <CardDescription>View and manage admin accounts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/super-admin/activity-logs")}
              >
                <Activity className="h-4 w-4 mr-2" />
                View Activity Logs
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  disabled={loading}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminsTable
            loading={loading}
            admins={admins}
            searchTerm={searchTerm}
            onShowPermissions={(admin) => {
              setSelectedAdmin(admin);
              setShowPermissionsDialog(true);
            }}
            onEdit={(admin) => {
              setSelectedAdmin(admin);
              setShowEditDialog(true);
            }}
            onDeactivate={(admin) => {
              setSelectedAdmin(admin);
              setShowDeactivateDialog(true);
            }}
          />
        </CardContent>
      </Card>

      <Card className="pt-3">
        <CardHeader>
          <CardTitle>Recent Activity Log</CardTitle>
          <CardDescription>Latest administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <CreateAdminDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onAdminCreated={handleCreateAdmin}
      />

      {/* Edit Admin Dialog */}
      <EditAdminDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setSelectedAdmin(null);
          }
        }}
        admin={selectedAdmin}
        onAdminUpdated={handleEditAdmin}
      />

      {/* Deactivate Admin Dialog */}
      <AdminActionDialogs
        selectedAdmin={selectedAdmin}
        actionLoading={actionLoading}
        showDeactivateDialog={showDeactivateDialog}
        onDeactivateDialogChange={(open) => {
          setShowDeactivateDialog(open);
          if (!open) {
            setSelectedAdmin(null);
          }
        }}
        onConfirmDeactivate={handleDeactivateAdmin}
        currentAdminId={currentAdminId}
      />

      {/* Permissions Dialog */}
      <ViewPermissionsDialog
        open={showPermissionsDialog}
        onOpenChange={(open) => {
          setShowPermissionsDialog(open);
          if (!open) {
            setSelectedAdmin(null);
          }
        }}
        admin={selectedAdmin}
      />
    </div>
  );
}

