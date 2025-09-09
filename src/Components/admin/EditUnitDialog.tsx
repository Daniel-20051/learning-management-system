import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import ContentEditor from "@/Components/admin/ContentEditor";
import VideoModal from "@/Components/admin/VideoModal";
import { Api } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { AlertCircle, Upload, Video, X, CheckCircle } from "lucide-react";

type EditUnitDialogProps = {
  open: boolean;
  unit: any | null;
  onClose: () => void;
  onSave?: (updatedUnit: {
    id: string | number;
    title: string;
    content: string;
    video_url?: string;
  }) => void;
};

const EditUnitDialog = ({
  open,
  unit,
  onClose,
  onSave,
}: EditUnitDialogProps) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const api = new Api();

  useEffect(() => {
    if (unit) {
      setTitle(unit.title || "");
      setContent(unit.content || "");
      setVideoUrl(unit.video_url || "");
      setVideoFiles([]); // Reset video files when unit changes
    }
    setErrorMessage("");
  }, [unit]);

  // Video dropzone functionality
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setVideoFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB limit
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            setErrorMessage(
              `File ${file.name} is too large. Maximum size is 50MB.`
            );
          }
        });
      });
    },
  });

  const removeVideoFile = (index: number) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!unit) return;
    try {
      setIsSaving(true);
      setErrorMessage("");

      // TODO: Implement actual video file upload functionality
      // Currently the API only supports video URLs, not file uploads
      // The drag and drop functionality is ready for when the backend supports file uploads

      await api.EditUnit(String(unit.id), {
        title,
        content,
        video_url: videoUrl || undefined,
      });

      if (onSave) {
        onSave({
          id: unit.id,
          title,
          content,
          video_url: videoUrl || undefined,
        });
      }
      onClose();
    } catch (e) {
      setErrorMessage("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => (!val ? onClose() : undefined)}
      >
        <DialogContent className="w-[95vw] mt-7 max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
          </DialogHeader>

          {errorMessage && (
            <Alert className="border-red-200 bg-red-50 text-red-800 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Save failed</AlertTitle>
              <AlertDescription className="text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {" "}
                Unit Title
              </label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Video Upload Section */}
            <div className="grid gap-2">
              <Label>Video Files</Label>

              {/* Show existing video status */}
              {unit?.video_url && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Video already uploaded
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="ml-auto text-sm text-green-600 hover:text-green-800 hover:bg-green-50 p-0 h-auto font-normal underline"
                  >
                    View Current Video
                  </Button>
                </div>
              )}

              {/* Drag and drop area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                {isDragActive ? (
                  <p className="text-primary">Drop video files here...</p>
                ) : (
                  <div>
                    <p className="text-muted-foreground">
                      {unit?.video_url
                        ? "Drag & drop new video files to replace current video"
                        : "Drag & drop video files here, or click to select"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports: MP4, MOV, AVI, MKV, WebM (Max: 50MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Display uploaded videos */}
              {videoFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    New Videos to Upload:
                  </Label>
                  {videoFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideoFile(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {" "}
                  Lesson Content
                </label>
                <ContentEditor value={content} onChange={setContent} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      {unit?.video_url && (
        <VideoModal
          open={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={unit.video_url}
          title={`${unit.title} - Video`}
        />
      )}
    </>
  );
};

export default EditUnitDialog;
