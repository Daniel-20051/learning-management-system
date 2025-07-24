import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerFullscreenButton,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "@/Components/ui/kibo-ui/video-player";
import { cn } from "@/lib/utils";

interface VideoControlProps {
  src: string;
  className?: string;
  maxWidth?: string;
  maxHeight?: string;
}

const VideoControl = ({
  src,
  className,
  maxWidth = "max-w-4xl",
  maxHeight = "max-h-96",
}: VideoControlProps) => (
  <div className={cn("w-full flex justify-center", className)}>
    <VideoPlayer
      className={cn(
        "w-full overflow-hidden rounded-lg border",
        maxWidth,
        maxHeight,
        "aspect-video"
      )}
    >
      <VideoPlayerContent
        crossOrigin=""
        muted
        preload="auto"
        slot="media"
        src={src}
        className="w-full h-full object-contain"
      />
      <VideoPlayerControlBar>
        <VideoPlayerPlayButton />

        <VideoPlayerTimeRange />
        <VideoPlayerTimeDisplay showDuration />
        <VideoPlayerMuteButton />
        <VideoPlayerVolumeRange />
        <VideoPlayerFullscreenButton />
      </VideoPlayerControlBar>
    </VideoPlayer>
  </div>
);

export default VideoControl;
