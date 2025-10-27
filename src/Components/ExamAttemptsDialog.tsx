import React, { useState, useEffect } from "react";
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
  TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, Trophy, FileText } from "lucide-react";
import { GetStudentExamAttempts } from "@/api/exams";
import type { StudentExamAttempt, StudentExamAttemptsResponse } from "@/types/admin";
import { toast } from "sonner";

interface ExamAttemptsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  examId?: number;
  examTitle?: string;
}

export const ExamAttemptsDialog: React.FC<ExamAttemptsDialogProps> = ({
  isOpen,
  onClose,
  examId,
  examTitle,
}) => {
  const [attempts, setAttempts] = useState<StudentExamAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchAttempts = async (page: number = 1) => {
    if (!isOpen) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await GetStudentExamAttempts(page, 20);
      
      if (response?.data?.status) {
        const data = response.data as StudentExamAttemptsResponse;
        
        // Filter attempts for the specific exam if examId is provided
        let filteredAttempts = data.data;
        if (examId) {
          filteredAttempts = data.data.filter(attempt => attempt.exam_id === examId);
        }
        
        setAttempts(filteredAttempts);
        setPagination(data.pagination);
      } else {
        setError("Failed to fetch exam attempts");
        toast.error("Failed to fetch exam attempts");
      }
    } catch (err) {
      console.error("Error fetching exam attempts:", err);
      setError("An error occurred while fetching exam attempts");
      toast.error("An error occurred while fetching exam attempts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAttempts(1);
    }
  }, [isOpen, examId]);

  const calculateTimeTaken = (startedAt: string, submittedAt?: string) => {
    if (!submittedAt) return "In Progress";
    
    const start = new Date(startedAt);
    const end = new Date(submittedAt);
    const diffMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: { label: "In Progress", variant: "secondary" as const },
      submitted: { label: "Submitted", variant: "outline" as const },
      graded: { label: "Graded", variant: "default" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculatePercentage = (totalScore: string, maxScore: string) => {
    const total = parseFloat(totalScore);
    const max = parseFloat(maxScore);
    if (isNaN(total) || isNaN(max) || max === 0) return "N/A";
    return `${((total / max) * 100).toFixed(1)}%`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAttempts(newPage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exam Attempts
            {examTitle && <span className="text-muted-foreground">- {examTitle}</span>}
          </DialogTitle>
          <DialogDescription>
            View your previous exam attempts and scores
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading attempts...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={() => fetchAttempts(pagination.page)}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {examId ? "No attempts found for this exam" : "No exam attempts found"}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Attempt #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{attempt.exam.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{attempt.exam.duration_minutes} min duration</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">#{attempt.attempt_no}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{calculateTimeTaken(attempt.started_at, attempt.submitted_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attempt.total_score && attempt.max_score ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium">
                            {attempt.total_score}/{attempt.max_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not graded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {attempt.total_score && attempt.max_score ? (
                        <Badge
                          variant={
                            parseFloat(calculatePercentage(attempt.total_score, attempt.max_score).replace('%', '')) >= 70
                              ? "default"
                              : parseFloat(calculatePercentage(attempt.total_score, attempt.max_score).replace('%', '')) >= 50
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {calculatePercentage(attempt.total_score, attempt.max_score)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} attempts
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
