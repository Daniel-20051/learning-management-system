import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Search } from "lucide-react";

export type DirectoryUser = {
  id: string;
  name: string;
  role: "Student" | "Staff";
  isOnline?: boolean;
};

export type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: DirectoryUser[];
  onSelectUser: (user: DirectoryUser) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
};

const NewChatDialog: React.FC<NewChatDialogProps> = ({ open, onOpenChange, users, onSelectUser, loading, onSearch }) => {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!onSearch) return;
    const handler = setTimeout(() => {
      onSearch(query.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [query, onSearch]);

  function initials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <DialogTitle>Start new chat</DialogTitle>
            
          </div>
        </DialogHeader>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name"
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading ? (
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </span>
            ) : null}
          </div>
          <div className="mt-3 max-h-[50vh] overflow-auto">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                {query.trim().length > 0
                  ? (<span>No results for "{query.trim()}"</span>)
                  : (<span>Type to search students by name, email, or matric number</span>)}
              </div>
            ) : (
              <ul className="flex flex-col">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-accent"
                      onClick={() => onSelectUser(u)}
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        {u.isOnline !== undefined && (
                          <div 
                            className={`online-indicator ${u.isOnline ? 'online' : 'offline'}`}
                            data-user-id={u.id}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-medium">{u.name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.role} {u.isOnline !== undefined && (u.isOnline ? '• Online' : '• Offline')}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;


