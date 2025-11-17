import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Skeleton } from "@/Components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  Activity,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Globe,
} from "lucide-react";
import { getActivityLogs, getAdmins, type ActivityLog, type AdminListItem } from "@/api/admin";
import { toast } from "sonner";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [adminFilter, setAdminFilter] = useState<string>("all");
  const [admins, setAdmins] = useState<AdminListItem[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, adminFilter]);

  const fetchAdmins = async () => {
    try {
      const response = await getAdmins();
      if (response.success) {
        setAdmins(response.data.admins);
      }
    } catch (error: any) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };
      if (actionFilter !== "all") {
        params.action = actionFilter;
      }
      if (adminFilter !== "all") {
        params.admin_id = parseInt(adminFilter);
      }

      const response = await getActivityLogs(params);
      if (response.success) {
        setLogs(response.data.logs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
      toast.error(error.response?.data?.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("login")) {
      return <Badge className="bg-purple-500">Login</Badge>;
    }
    if (actionLower.includes("logout")) {
      return <Badge className="bg-gray-500">Logout</Badge>;
    }
    if (actionLower.includes("create") || actionLower.includes("created")) {
      return <Badge className="bg-green-500">Create</Badge>;
    }
    if (actionLower.includes("update") || actionLower.includes("updated")) {
      return <Badge className="bg-blue-500">Update</Badge>;
    }
    if (actionLower.includes("delete") || actionLower.includes("deleted")) {
      return <Badge variant="destructive">Delete</Badge>;
    }
    if (actionLower.includes("activate") || actionLower.includes("activated")) {
      return <Badge className="bg-green-600">Activate</Badge>;
    }
    if (actionLower.includes("deactivate") || actionLower.includes("deactivated")) {
      return <Badge className="bg-orange-500">Deactivate</Badge>;
    }
    if (actionLower.includes("reset") && actionLower.includes("password")) {
      return <Badge className="bg-yellow-500">Reset Password</Badge>;
    }
    return <Badge variant="outline">{action.replace(/_/g, " ")}</Badge>;
  };

  const getResultBadge = (result: string) => {
    if (result === "success") {
      return <Badge className="bg-green-500">Success</Badge>;
    }
    if (result === "failed" || result === "error") {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="outline">{result}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ["Date/Time", "Admin", "Action", "Target Type", "Target ID", "Description", "Result", "IP Address", "User Agent"];
    const rows = logs.map((log) => {
      const ipAddress = log.ip_address 
        ? (log.ip_address.startsWith("::ffff:") 
            ? log.ip_address.replace("::ffff:", "") 
            : log.ip_address)
        : "-";
      return [
        formatDate(log.created_at),
        log.admin ? `${log.admin.fname} ${log.admin.lname} (${log.admin.email})` : "System",
        log.action.replace(/_/g, " "),
        log.target_type,
        log.target_id.toString(),
        log.description,
        log.result,
        ipAddress,
        log.user_agent || "-",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `activity-logs-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Activity logs exported to CSV");
  };

  const actionOptions = [
    { value: "all", label: "All Actions" },
    { value: "admin_login", label: "Login" },
    { value: "admin_logout", label: "Logout" },
    { value: "created", label: "Created" },
    { value: "updated", label: "Updated" },
    { value: "deleted", label: "Deleted" },
    { value: "activated_student", label: "Activated Student" },
    { value: "deactivated_student", label: "Deactivated Student" },
    { value: "activated_staff", label: "Activated Staff" },
    { value: "deactivated_staff", label: "Deactivated Staff" },
    { value: "reset_student_password", label: "Reset Password" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">View all administrative actions and changes</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <Card className="pt-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Showing {logs.length} of {totalItems} logs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter} disabled={loading}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={adminFilter} onValueChange={setAdminFilter} disabled={loading}>
                <SelectTrigger className="w-48">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admins</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id.toString()}>
                      {admin.fname} {admin.lname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No activity logs found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(log.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.admin ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {log.admin.fname} {log.admin.lname}
                              </p>
                              <p className="text-xs text-muted-foreground">{log.admin.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{log.target_type}</p>
                          <p className="text-xs text-muted-foreground">ID: {log.target_id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm">{log.description}</p>
                      </TableCell>
                      <TableCell>{getResultBadge(log.result)}</TableCell>
                      <TableCell>
                        {log.ip_address ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span className="font-mono text-xs">
                              {log.ip_address.startsWith("::ffff:") 
                                ? log.ip_address.replace("::ffff:", "") 
                                : log.ip_address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalItems} total logs)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

