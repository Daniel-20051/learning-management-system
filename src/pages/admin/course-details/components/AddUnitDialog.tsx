import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { CircularProgress } from "@/Components/ui/circular-progress";
import ContentEditor from "@/Components/admin/ContentEditor";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import {
  Upload,
  X,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Api } from "@/api";

// Types for lesson unit creation
export interface UnitFormData {
  title: string;
  content: string;
  videoFiles?: File[];
}

interface AddUnitDialogProps {
  moduleTitle: string;
  moduleId: string;
  existingUnits?: any[]; // Array of existing units to calculate order
  onAddUnit: (moduleId: string, unitData: UnitFormData) => void;
  children: React.ReactNode;
}

const AddUnitDialog = ({
  moduleTitle,
  moduleId,
  existingUnits = [],
  onAddUnit,
  children,
}: AddUnitDialogProps) => {
  // API instance
  const api = new Api();

  // Calculate next order number based on existing units
  const getNextOrderNumber = () => {
    if (!existingUnits || existingUnits.length === 0) {
      return 1;
    }
    const maxOrder = Math.max(...existingUnits.map((unit) => unit.order || 0));
    return maxOrder + 1;
  };

  // Unit creation form state
  const [unitFormData, setUnitFormData] = useState<UnitFormData>({
    title: "",
    content: "",
    videoFiles: [],
  });

  // Alert and loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Adding Unit...");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    description: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Video dropzone functionality
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only take the first file since we only accept one video
    if (acceptedFiles.length > 0) {
      setUnitFormData((prev) => ({
        ...prev,
        videoFiles: [acceptedFiles[0]], // Replace with new video file
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    multiple: false, // Only accept one video file
    maxSize: 50 * 1024 * 1024, // 50MB limit
    onDropRejected: (rejectedFiles) => {
      // Handle rejected files (too large, wrong type, etc.)
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            setAlert({
              type: "error",
              title: "File Too Large",
              description: `File ${file.name} is too large. Maximum size is 50MB.`,
            });
          }
        });
      });
    },
  });

  const removeVideoFile = (index: number) => {
    setUnitFormData((prev) => ({
      ...prev,
      videoFiles: prev.videoFiles?.filter((_, i) => i !== index) || [],
    }));
  };

  const resetUnitForm = () => {
    setUnitFormData({
      title: "",
      content: "",
      videoFiles: [],
    });
    setAlert(null);
    setLoadingMessage("Adding Unit...");
    setUploadProgress(0);
    setIsUploading(false);
    setIsDialogOpen(false);
  };

  const handleAddUnit = async () => {
    // Clear any existing alerts
    setAlert(null);

    // Validate form data
    if (!unitFormData.title.trim()) {
      setAlert({
        type: "error",
        title: "Validation Error",
        description: "Please enter a unit title.",
      });
      return;
    }

    if (!unitFormData.content.trim()) {
      setAlert({
        type: "error",
        title: "Validation Error",
        description: "Please enter lesson content.",
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Creating unit...");

    try {
      // Step 1: Create the unit first
      const unitData = {
        title: unitFormData.title,
        content: unitFormData.content,
        content_type: "html",
        order: getNextOrderNumber(),
        status: "uncompleted",
      };

      const response = await api.AddUnit(moduleId, unitData);

      // Extract unit ID from response
      let unitId = null;
      let unitCreated = false;

      if (response && response.data && response.data.success) {
        unitId = response.data.data?.id || response.data.id;
        unitCreated = true;
      } else if (
        response &&
        response.data &&
        response.data.message === "Unit created"
      ) {
        unitId = response.data.data?.id || response.data.id;
        unitCreated = true;
      }

      if (!unitCreated) {
        throw new Error(response?.data?.message || "Failed to create unit");
      }

      // Step 2: Upload video file if any (only if unit was created successfully)
      if (
        unitFormData.videoFiles &&
        unitFormData.videoFiles.length > 0 &&
        unitId
      ) {
        const videoFile = unitFormData.videoFiles[0]; // Get the single video file

        setLoadingMessage("Uploading video...");
        setIsUploading(true);
        setUploadProgress(0);
        setAlert({
          type: "success",
          title: "Unit Created!",
          description: "Now uploading video file...",
        });

        try {
          await api.UploadUnitVideo(
            moduleId,
            String(unitId),
            videoFile,
            (progress) => {
              setUploadProgress(progress);
              setAlert({
                type: "success",
                title: "Uploading Video...",
                description: `Uploading: ${videoFile.name} (${progress}%)`,
              });
            }
          );

          // Video uploaded successfully
          setUploadProgress(100);
          setIsUploading(false);
          setAlert({
            type: "success",
            title: "Success!",
            description: `Unit and video uploaded successfully!`,
          });
        } catch (uploadError) {
          console.error("Error uploading video:", uploadError);
          setIsUploading(false);
          setUploadProgress(0);
          setAlert({
            type: "error",
            title: "Video Upload Failed",
            description: `Failed to upload ${videoFile.name}. Unit was created but video upload failed.`,
          });
          setTimeout(() => {
            resetUnitForm();
          }, 3000);
          return;
        }
      } else {
        // No videos to upload, just show unit creation success
        setAlert({
          type: "success",
          title: "Success!",
          description: "Lesson unit has been added successfully.",
        });
      }

      // Call the parent callback to refresh the affected module
      onAddUnit(moduleId, unitFormData);

      // Reset form after showing success message
      setTimeout(() => {
        resetUnitForm();
      }, 1500);
    } catch (error: any) {
      console.error("Error adding unit:", error);

      // Check if the error message indicates successful unit creation (legacy handling)
      if (
        error?.message === "Unit created" ||
        error?.response?.data?.message === "Unit created" ||
        error?.data?.message === "Unit created"
      ) {
        setAlert({
          type: "success",
          title: "Success!",
          description: "Lesson unit has been added successfully.",
        });

        onAddUnit(moduleId, unitFormData);
        setTimeout(() => {
          resetUnitForm();
        }, 1500);
      } else {
        setAlert({
          type: "error",
          title: "Error",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to add unit. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl mt-7 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>
            Add a new lesson to {moduleTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Alert Display */}
        {alert && (
          <Alert
            className={
              alert.type === "error" ? "border-destructive" : "border-green-500"
            }
          >
            <div className="flex items-start gap-4 w-[60vw]">
              <div className="flex-shrink-0">
                {isUploading ? (
                  <CircularProgress
                    value={uploadProgress}
                    size={40}
                    strokeWidth={4}
                  />
                ) : (
                  <>
                    <AlertCircle
                      className={alert.type === "error" ? "h-4 w-4" : "hidden"}
                    />
                    <CheckCircle
                      className={
                        alert.type === "success"
                          ? "h-4 w-4 text-green-500"
                          : "hidden"
                      }
                    />
                  </>
                )}
              </div>

              <div className="flex-1 w-full">
                <AlertTitle
                  className={`${
                    alert.type === "error"
                      ? "text-destructive"
                      : "text-green-700"
                  }  w-full text-left`}
                >
                  {alert.title}
                </AlertTitle>
                <AlertDescription
                  className={`${
                    alert.type === "error"
                      ? "text-destructive"
                      : "text-green-600"
                  }  w-full text-left`}
                >
                  {alert.description}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="grid gap-6 py-4">
          {/* Unit Title */}
          <div className="grid gap-2">
            <Label htmlFor="unit-title">Lesson Title</Label>
            <Input
              id="unit-title"
              value={unitFormData.title}
              onChange={(e) =>
                setUnitFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Enter lesson title"
            />
          </div>

          {/* Video Upload Section */}
          <div className="grid gap-2">
            <Label>Video File (Optional)</Label>
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
                <p className="text-primary">Drop video file here...</p>
              ) : (
                <div>
                  <p className="text-muted-foreground">
                    Drag & drop a video file here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports: MP4, MOV, AVI, MKV, WebM (Max: 50MB)
                  </p>
                </div>
              )}
            </div>

            {/* Display uploaded video */}
            {unitFormData.videoFiles && unitFormData.videoFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Video:</Label>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {unitFormData.videoFiles[0].name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (
                      {(
                        unitFormData.videoFiles[0].size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideoFile(0)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Content Editor */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="lesson-content">Lesson Content</Label>
            <ContentEditor
              value={unitFormData.content}
              onChange={(html) =>
                setUnitFormData((prev) => ({
                  ...prev,
                  content: html,
                }))
              }
            />
          </div>
        </div>

        <DialogFooter className="mt-13 flex flex-col gap-2 md:flex-row md:mt-7">
          <Button
            variant="outline"
            onClick={resetUnitForm}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddUnit}
            className=""
            disabled={isLoading || !unitFormData.title || !unitFormData.content}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading
                  ? `${loadingMessage} ${uploadProgress}%`
                  : loadingMessage}
              </>
            ) : (
              "Add Unit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUnitDialog;
