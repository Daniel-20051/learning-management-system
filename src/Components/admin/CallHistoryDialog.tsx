import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  PlayCircle,
  Loader2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { GetVideoCalls, DeleteVideoCall, type VideoCall } from "@/api/video";
import { toast } from "sonner";
import ConfirmDialog from "../ConfirmDialog";

export interface CallHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallHistoryDialog: React.FC<CallHistoryDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [callToDelete, setCallToDelete] = useState<VideoCall | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCallHistory();
    }
  }, [isOpen]);

  const fetchCallHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await GetVideoCalls();
      if (response.success) {
        // Sort by creation date, newest first
        const sortedCalls = response.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setVideoCalls(sortedCalls);
      } else {
        setError("Failed to fetch call history");
      }
    } catch (err: any) {
      console.error("Error fetching call history:", err);
      setError(err.message || "Failed to fetch call history");
      toast.error("Failed to load call history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCallStatus = (call: VideoCall) => {
    const now = new Date();
    const startTime = call.startsAt ? new Date(call.startsAt) : null;
    const endTime = call.endedAt ? new Date(call.endedAt) : null;

    if (endTime) return "ended";
    if (startTime && now >= startTime) return "live";
    if (startTime && now < startTime) return "upcoming";
    return "scheduled";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const handleJoinCall = (call: VideoCall) => {
    const callId = call.streamCallId || call.id;
    window.open(`/meeting/${callId}`, '_blank');
  };

  const handleDeleteCall = (call: VideoCall) => {
    setCallToDelete(call);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCall = async () => {
    if (!callToDelete) return;

    try {
      setIsDeleting(true);
      const response = await DeleteVideoCall(callToDelete.id);
      
      if (response.success) {
        setVideoCalls(prev => prev.filter(call => call.id !== callToDelete.id));
        toast.success("Video call deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete video call");
      }
    } catch (error: any) {
      console.error("Error deleting video call:", error);
      toast.error(error.message || "Failed to delete video call");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setCallToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setCallToDelete(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Call History
          </DialogTitle>
          <DialogDescription>
            View all previous and upcoming video calls
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading call history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button onClick={fetchCallHistory} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : videoCalls.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No video calls found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No calls created yet
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Starts At</TableHead>
                    <TableHead>Ended At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videoCalls.map((call) => {
                    const status = getCallStatus(call);
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.title}</TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {call.callType}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(call.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {call.startsAt ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-4 w-4" />
                              {formatDateTime(call.startsAt)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {call.endedAt ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-4 w-4" />
                              {formatDateTime(call.endedAt)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(status === "live" || status === "upcoming") && (
                              <Button
                                onClick={() => handleJoinCall(call)}
                                size="sm"
                                className="gap-1"
                                variant={status === "live" ? "default" : "outline"}
                              >
                                <PlayCircle className="h-4 w-4" />
                                {status === "live" ? "Join" : "Join"}
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDeleteCall(call)}
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
      
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Video Call"
        description={`Are you sure you want to delete "${callToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteCall}
        onCancel={cancelDelete}
        isProcessing={isDeleting}
      />
    </Dialog>
  );
};

export default CallHistoryDialog;
