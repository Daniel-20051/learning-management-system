import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Input } from "@/Components/ui/input";
import ConfirmDialog from "@/Components/ConfirmDialog";
import NoteViewerDialog from "@/Components/NoteViewerDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Plus, Edit3, Save, X, Trash2, MoreVertical } from "lucide-react";
import { Api } from "@/api/index";
import { toast } from "sonner";

// Simple in-memory cache to persist notes per module across tab switches
const MODULE_NOTES_CACHE: Map<string, Note[]> = new Map();

interface Note {
  id: string;
  note_text: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

interface ModuleNotesProps {
  moduleId: string;
  isLoading?: boolean;
}

const ModuleNotes: React.FC<ModuleNotesProps> = ({
  moduleId,
  isLoading = false,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewNoteInput, setShowNewNoteInput] = useState(false);
  const [newlyCreatedNoteId, setNewlyCreatedNoteId] = useState<string | null>(
    null
  );
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerNote, setViewerNote] = useState<Note | null>(null);
  const api = new Api();
  const newNoteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep cache in sync helper
  const syncCache = (updated: Note[]) => {
    if (moduleId) MODULE_NOTES_CACHE.set(moduleId, updated);
  };

  // On mount or when moduleId changes: hydrate from cache if present; otherwise fetch once
  useEffect(() => {
    if (!moduleId) return;

    const cached = MODULE_NOTES_CACHE.get(moduleId);
    if (cached && Array.isArray(cached)) {
      setNotes(cached);
      return; // Do not fetch again
    }

    if (!isLoading) {
      fetchNotes();
    }
  }, [moduleId]);

  // Auto-focus new note textarea when creating
  useEffect(() => {
    if (showNewNoteInput && newNoteTextareaRef.current) {
      newNoteTextareaRef.current.focus();
    }
  }, [showNewNoteInput]);

  // Auto-focus edit textarea when editing
  useEffect(() => {
    if (editingNoteId && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [editingNoteId]);

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await api.GetModuleNotes(moduleId);
      if (response.data?.data) {
        setNotes(response.data.data);
        syncCache(response.data.data);
      } else {
        setNotes([]);
        syncCache([]);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteText.trim()) {
      toast.error("Please enter some text for the note");
      return;
    }

    setIsCreating(true);

    // Add the new note optimistically with loading state
    const tempNote: Note = {
      id: "temp-" + Date.now(),
      note_text: newNoteText.trim(),
      title: newNoteTitle.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => {
      const next = [tempNote, ...prev];
      syncCache(next);
      return next;
    });
    setNewlyCreatedNoteId(tempNote.id);
    setNewNoteText("");
    setNewNoteTitle("");
    setShowNewNoteInput(false);

    try {
      const response = await api.CreateModuleNotes(moduleId, {
        note_text: newNoteText.trim(),
        title: newNoteTitle.trim() || undefined,
      });

      if (response.data?.data) {
        // Replace the temporary note with the real note data
        setTimeout(() => {
          setNotes((prev) => {
            const next = prev.map((note) =>
              note.id === tempNote.id
                ? {
                    ...response.data.data,
                    id: response.data.data.id || note.id,
                  }
                : note
            );
            syncCache(next);
            return next;
          });
          setNewlyCreatedNoteId(null);
        }, 1500); // Show loading for 1.5s then update

        toast.success("Note created successfully");
      } else {
        throw new Error("Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");

      // Remove the temporary note on error
      setNotes((prev) => {
        const next = prev.filter((note) => note.id !== tempNote.id);
        syncCache(next);
        return next;
      });
      setNewlyCreatedNoteId(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editText.trim()) {
      toast.error("Please enter some text for the note");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.EditModuleNotes(moduleId, noteId, {
        note_text: editText.trim(),
        title: editTitle.trim() || undefined,
      });

      if (response.data && response.status >= 200 && response.status < 300) {
        // Update only the specific note without full reload
        setNotes((prev) => {
          const next = prev.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  note_text: editText.trim(),
                  title: editTitle.trim() || undefined,
                  updated_at: new Date().toISOString(),
                }
              : note
          );
          syncCache(next);
          return next;
        });
        setEditingNoteId(null);
        setEditText("");
        setEditTitle("");
        toast.success("Note updated successfully");
      } else {
        throw new Error("Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditText(note.note_text);
    setEditTitle(note.title || "");
  };

  const openViewer = (note: Note) => {
    setViewerNote(note);
    setViewerOpen(true);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditText("");
    setEditTitle("");
    setIsSaving(false);
  };

  const cancelNewNote = () => {
    setShowNewNoteInput(false);
    setNewNoteText("");
    setNewNoteTitle("");
  };

  const handleDeleteNote = async (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    setDeletingNoteId(noteToDelete.id);
    setShowDeleteModal(false);

    try {
      const response = await api.DeleteModuleNotes(moduleId, noteToDelete.id);

      if (response.data && response.status >= 200 && response.status < 300) {
        // Remove the note from the list
        setNotes((prev) => {
          const next = prev.filter((note) => note.id !== noteToDelete.id);
          syncCache(next);
          return next;
        });
        toast.success("Note deleted successfully");
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeletingNoteId(null);
      setNoteToDelete(null);
    }
  };

  const cancelDeleteNote = () => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  const getRandomColor = () => {
    const colors = ["bg-yellow-50 border-yellow-200"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Calculate dynamic height based on content
  const calculateContentHeight = (text: string) => {
    const lines = text.split("\n").length;
    const textLength = text.length;

    // Base height calculation
    let baseHeight = lines * 20; // 20px per line

    // Adjust for long single lines
    if (lines === 1 && textLength > 50) {
      baseHeight = Math.ceil(textLength / 50) * 20;
    }

    // Set reasonable min and max bounds
    return Math.min(Math.max(baseHeight, 40), 160);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-r-primary/30 animate-pulse"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 animate-pulse">
              Loading module content...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6  max-h-[70vh] mb-5 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">My Notes</h3>
        <Button
          onClick={() => setShowNewNoteInput(true)}
          size="sm"
          className="gap-2"
          disabled={showNewNoteInput}
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Notes loading state */}
      {notesLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Loading notes...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* New Note Card */}
          {showNewNoteInput && (
            <Card className="bg-white border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <Input
                  placeholder="Note title (optional)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="mb-3 text-base font-bold"
                  disabled={isCreating}
                />
                <Textarea
                  ref={newNoteTextareaRef}
                  placeholder="Type your note here..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="min-h-[80px] max-h-[200px] border-none resize-none focus:ring-0 focus:border-none p-0 text-sm"
                  disabled={isCreating}
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height =
                      Math.min(target.scrollHeight, 200) + "px";
                  }}
                />
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelNewNote}
                    disabled={isCreating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateNote}
                    disabled={isCreating || !newNoteText.trim()}
                    className="gap-2"
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                      </div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Notes */}
          {notes.map((note) => (
            <Card
              key={note.id}
              className={`${getRandomColor()} hover:shadow-md transition-all duration-200 cursor-pointer group relative max-h-60`}
            >
              {/* Loading Overlay for newly created note */}
              {newlyCreatedNoteId === note.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="flex justify-center items-center space-x-1 mb-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saving note...
                    </p>
                  </div>
                </div>
              )}

              <CardContent className="p-4 h-full flex flex-col">
                {editingNoteId === note.id ? (
                  <>
                    <Input
                      placeholder="Note title (optional)"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mb-3 text-base bg-transparent border-none focus:ring-0 focus:border-none p-0 font-bold"
                      disabled={isSaving}
                    />
                    <Textarea
                      ref={editTextareaRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border-none resize-none focus:ring-0 focus:border-none p-0 text-sm bg-transparent"
                      style={{
                        height: calculateContentHeight(editText) + "px",
                        maxHeight: "200px",
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 200) + "px";
                      }}
                    />
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-current/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditNote(note.id)}
                        disabled={!editText.trim() || isSaving}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                          </div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-h-0">
                      {note.title && (
                        <h3
                          className="font-bold text-base mb-3 cursor-text text-gray-900 leading-tight"
                          onClick={() => startEditing(note)}
                        >
                          {note.title}
                        </h3>
                      )}
                      <div
                        className="text-sm leading-relaxed whitespace-pre-wrap cursor-pointer overflow-y-auto max-h-40 pr-2"
                        onClick={() => openViewer(note)}
                        title="Click to view"
                      >
                        {note.note_text}
                      </div>
                    </div>

                    {/* Desktop: Hover buttons */}
                    <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(note);
                        }}
                        className="h-8 w-8 p-0 hover:bg-white/50"
                        disabled={deletingNoteId === note.id}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note);
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        disabled={deletingNoteId === note.id}
                      >
                        {deletingNoteId === note.id ? (
                          <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* Mobile: Hamburger menu */}
                    <div className="md:hidden absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-white/50"
                            onClick={(e) => e.stopPropagation()}
                            disabled={deletingNoteId === note.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(note);
                            }}
                            disabled={deletingNoteId === note.id}
                            className="gap-2"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit Note
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note);
                            }}
                            disabled={deletingNoteId === note.id}
                            className="gap-2 text-red-600 focus:text-red-600"
                          >
                            {deletingNoteId === note.id ? (
                              <>
                                <div className="w-4 h-4 border border-red-500 border-t-transparent rounded-full animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Delete Note
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {!notesLoading && notes.length === 0 && !showNewNoteInput && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Edit3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No notes yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first note to remember important points from this
                module
              </p>
              <Button
                onClick={() => setShowNewNoteInput(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Note
              </Button>
            </div>
          )}
          {/* Bottom spacer to prevent last card from hitting the viewport edge */}
          <div className="col-span-full h-3" />
        </div>
      )}

      <ConfirmDialog
        open={showDeleteModal}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete Note"
        cancelText="Cancel"
        onConfirm={confirmDeleteNote}
        onCancel={cancelDeleteNote}
        isProcessing={deletingNoteId !== null}
      >
        <div className="bg-gray-50 p-3 rounded-md border-l-4 border-red-400 mb-2">
          {noteToDelete?.title && (
            <h4 className="font-bold text-base mb-2 text-gray-900">
              {noteToDelete.title}
            </h4>
          )}
          <p className="text-sm text-gray-700 line-clamp-3">
            "{noteToDelete?.note_text}"
          </p>
        </div>
      </ConfirmDialog>

      <NoteViewerDialog
        open={viewerOpen}
        title={viewerNote?.title || "Note"}
        content={viewerNote?.note_text || ""}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default ModuleNotes;
