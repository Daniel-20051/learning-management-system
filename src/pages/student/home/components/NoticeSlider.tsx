import { useEffect, useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/Components/ui/button";
import type { Notice } from "@/api/notices";

interface NoticeSliderProps {
  notices: Notice[];
  onNoticeClick: (notice: Notice) => void;
}

const NoticeSlider = ({ notices, onNoticeClick }: NoticeSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide through notices every 5 seconds
  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [notices.length]);

  if (notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  };

  return (
    <Card className="bg-gradient-to-br py-4 md:py-6 from-slate-900 via-slate-800 to-slate-700 text-white border-0 cursor-pointer hover:opacity-95 transition-opacity">
      <CardContent className="px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Previous Button */}
          {notices.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Notice Content */}
          <div
            className="flex-1 min-w-0"
            onClick={() => onNoticeClick(currentNotice)}
          >
            <div className="flex flex-col gap-2 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-white/60 mb-1">
                  Notice
                </p>
                <h1 className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight line-clamp-2">
                  {currentNotice.title}
                </h1>
                <div className="flex items-center gap-1.5 mt-2 text-xs md:text-sm text-white/70">
                  <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Click for more information</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          {notices.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Dots Indicator */}
        {notices.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {notices.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                aria-label={`Go to notice ${index + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NoticeSlider;

