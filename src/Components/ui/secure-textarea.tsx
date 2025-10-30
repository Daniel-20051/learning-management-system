import * as React from "react";
import { cn } from "@/lib/utils";

export interface SecureTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  disableCopyPaste?: boolean;
}

const SecureTextarea = React.forwardRef<HTMLTextAreaElement, SecureTextareaProps>(
  ({ className, disableCopyPaste = false, onKeyDown, onContextMenu, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disableCopyPaste) {
        // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A (copy, paste, cut, select all)
        if (e.ctrlKey || e.metaKey) {
          if (
            e.key === 'c' || 
            e.key === 'v' || 
            e.key === 'x' || 
            e.key === 'a' ||
            e.key === 'C' || 
            e.key === 'V' || 
            e.key === 'X' || 
            e.key === 'A'
          ) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
        
        // Block F12 (Developer Tools)
        if (e.key === 'F12') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      
      // Call original onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (disableCopyPaste) {
        // Disable right-click context menu
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Call original onContextMenu if provided
      if (onContextMenu) {
        onContextMenu(e);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleCopy = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleDragStart = (e: React.DragEvent<HTMLTextAreaElement>) => {
      if (disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
      if (disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            disableCopyPaste && "select-none", // Disable text selection via CSS
            className
          )}
          ref={ref}
          onKeyDown={handleKeyDown}
          onContextMenu={handleContextMenu}
          onPaste={handlePaste}
          onCopy={handleCopy}
          onCut={handleCut}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          style={{
            ...(disableCopyPaste && {
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            })
          }}
          {...props}
        />
        {disableCopyPaste && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure Mode</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SecureTextarea.displayName = "SecureTextarea";

export { SecureTextarea };
