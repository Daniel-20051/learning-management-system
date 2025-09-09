import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { ExternalLink } from "lucide-react";

type VideoModalProps = {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
};

const VideoModal = ({ open, onClose, videoUrl, title }: VideoModalProps) => {
  // Function to check if URL is a video file or streaming service
  const isVideoFile = (url: string) => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  // Function to check if it's a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  // Function to check if it's a Vimeo URL
  const isVimeoUrl = (url: string) => {
    return url.includes("vimeo.com");
  };

  // Function to convert Vimeo URL to embed URL
  const getVimeoEmbedUrl = (url: string) => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  };

  const renderVideoPlayer = () => {
    if (isYouTubeUrl(videoUrl)) {
      return (
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }

    if (isVimeoUrl(videoUrl)) {
      return (
        <iframe
          src={getVimeoEmbedUrl(videoUrl)}
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }

    if (isVideoFile(videoUrl)) {
      return (
        <video controls className="w-full h-full rounded-lg" preload="metadata">
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Fallback for other URLs - show in iframe
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-muted-foreground mb-4">
          Unable to display video in modal
        </p>
        <Button
          variant="outline"
          onClick={() => window.open(videoUrl, "_blank")}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => (!val ? onClose() : undefined)}>
      <DialogContent className="max-w-4xl mt-7 max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {title || "Video Preview"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            {renderVideoPlayer()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
