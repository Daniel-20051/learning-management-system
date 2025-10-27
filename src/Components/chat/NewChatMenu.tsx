import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { Input } from "@/Components/ui/input";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Search } from "lucide-react";
import { type DirectoryUser } from "@/Components/chat/NewChatDialog";

export type NewChatMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: DirectoryUser[];
  loading?: boolean;
  onSearch?: (term: string) => void;
  onSelectUser: (user: DirectoryUser) => void;
};

const NewChatMenu: React.FC<NewChatMenuProps> = ({ open, onOpenChange, users, loading, onSearch, onSelectUser }) => {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(query.trim()), 350);
    return () => clearTimeout(t);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 w-[420px] max-w-[90vw]">
        <SheetHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <SheetTitle>New chat</SheetTitle>
          </div>
        </SheetHeader>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email or matric number"
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
          <div className="mt-3 overflow-auto">
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
      </SheetContent>
    </Sheet>
  );
};

export default NewChatMenu;


