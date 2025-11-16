import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Activity, Calendar, User } from "lucide-react";

interface ActivityLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminName?: string;
}

export default function ActivityLogsDialog({ open, onOpenChange, adminName }: ActivityLogsDialogProps) {
  // Placeholder data
  const activityLogs = [
    {
      id: 1,
      action: "Created Student",
      user: "John Doe",
      timestamp: "2024-11-13 10:30 AM",
      type: "create",
    },
    {
      id: 2,
      action: "Updated Course",
      user: "Course 101",
      timestamp: "2024-11-13 09:15 AM",
      type: "update",
    },
    // Add more placeholder data as needed
  ];

  const getActionBadge = (type: string) => {
    switch (type) {
      case "create":
        return <Badge className="bg-green-500">Create</Badge>;
      case "update":
        return <Badge className="bg-blue-500">Update</Badge>;
      case "delete":
        return <Badge variant="destructive">Delete</Badge>;
      default:
        return <Badge variant="outline">Action</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Logs {adminName && `- ${adminName}`}
          </DialogTitle>
          <DialogDescription>
            View all administrative actions and changes
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {activityLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No activity logs found</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {log.user}
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {log.timestamp}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

