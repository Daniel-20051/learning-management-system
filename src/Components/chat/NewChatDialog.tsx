import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Search } from "lucide-react";

export type DirectoryUser = {
  id: string;
  name: string;
  role: "Student" | "Staff";
};

export type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: DirectoryUser[];
  onSelectUser: (user: DirectoryUser) => void;
};

const NewChatDialog: React.FC<NewChatDialogProps> = ({ open, onOpenChange, users, onSelectUser }) => {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, query]);

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
          <DialogTitle>Start new chat</DialogTitle>
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
          </div>
          <div className="mt-3 max-h-[50vh] overflow-auto">
            <ul className="flex flex-col">
              {filtered.map((u) => (
                <li key={u.id}>
                  <button
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-accent"
                    onClick={() => onSelectUser(u)}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.role}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;


