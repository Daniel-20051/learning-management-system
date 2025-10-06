import React from "react";
import { Button } from "@/Components/ui/button";
import { ChevronLeft } from "lucide-react";

export type ChatHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, showBack, onBack }) => {
  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-2">
        {showBack ? (
          <Button size="sm" variant="outline" onClick={onBack} aria-label="Back">
            <ChevronLeft className="size-4" />
          </Button>
        ) : null}
        <div className="text-foreground font-semibold">{title}</div>
      </div>
    </div>
  );
};

export default ChatHeader;


