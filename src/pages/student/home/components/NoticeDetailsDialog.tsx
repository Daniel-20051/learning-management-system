import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import type { Notice } from "@/api/notices";

interface NoticeDetailsDialogProps {
  notice: Notice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleDateString("en-US", options);
  } catch {
    return "Date not available";
  }
};

const NoticeDetailsDialog = ({
  notice,
  open,
  onOpenChange,
}: NoticeDetailsDialogProps) => {
  if (!notice) return null;

  // Format the date
  const formattedDate = notice.date ? formatDate(notice.date) : "Date not available";

  // Process the note text - handle line breaks and escape sequences
  const processedNote = notice.note
    ? notice.note
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n")
    : "No content available";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{notice.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground">
            <p>Published: {formattedDate}</p>
            {notice.target_audience && (
              <p className="mt-1">
                Target Audience:{" "}
                <span className="capitalize">{notice.target_audience}</span>
              </p>
            )}
          </div>
          <div className="border-t pt-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {processedNote}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDetailsDialog;

