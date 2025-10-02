import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import VideoModal from "@/Components/admin/VideoModal";
import { Play, FileText, Video } from "lucide-react";

type UnitPreviewModalProps = {
  open: boolean;
  unit: any | null;
  onClose: () => void;
};

// Function to generate video thumbnail URL (placeholder for now)
const getVideoThumbnail = (videoUrl: string): string => {
  // For YouTube videos, extract video ID and use YouTube thumbnail
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    const videoIdMatch = videoUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    if (videoIdMatch) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
  }

  // For Vimeo videos
  if (videoUrl.includes("vimeo.com")) {
    // Vimeo thumbnails require API calls, so we'll use a placeholder
    return "/api/placeholder/320/180";
  }

  // For other video URLs, use a generic video thumbnail placeholder
  return "/api/placeholder/320/180";
};

const UnitPreviewModal = ({ open, unit, onClose }: UnitPreviewModalProps) => {
  const [imageError, setImageError] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  if (!unit) return null;

  const hasVideo = unit.video_url && unit.video_url.trim() !== "";
  const videoThumbnail = hasVideo ? getVideoThumbnail(unit.video_url) : null;

  return (
    <Dialog open={open} onOpenChange={(val) => (!val ? onClose() : undefined)}>
      <DialogContent className="max-w-4xl mt-7 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold pr-8">
              {unit.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          {hasVideo && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Video Content</h3>
              </div>

              <div className="relative group">
                {videoThumbnail && !imageError ? (
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setIsVideoModalOpen(true)}
                  >
                    <img
                      src={videoThumbnail}
                      alt="Video thumbnail"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-3">
                        <Play className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-20 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setIsVideoModalOpen(true)}
                  >
                    <div className="text-center">
                      <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to watch video
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Lesson Content
            </h3>

            <div className="prose prose-sm max-w-none">
              {unit.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: unit.content }}
                  className="p-4 border rounded-lg bg-background"
                />
              ) : (
                <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>No content available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Video Modal */}
      {hasVideo && (
        <VideoModal
          open={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={unit.video_url}
          title={`${unit.title} - Video`}
        />
      )}
    </Dialog>
  );
};

export default UnitPreviewModal;
