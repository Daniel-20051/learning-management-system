import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Plus, Edit3, Save, X } from "lucide-react";
import { Api } from "@/api/index";
import { toast } from "sonner";

interface Note {
  id: string;
  note_text: string;
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
  const [newNoteText, setNewNoteText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewNoteInput, setShowNewNoteInput] = useState(false);
  const [newlyCreatedNoteId, setNewlyCreatedNoteId] = useState<string | null>(
    null
  );
  const api = new Api();
  const newNoteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch notes when moduleId changes
  useEffect(() => {
    if (moduleId && !isLoading) {
      fetchNotes();
    }
  }, [moduleId, isLoading]);

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
      } else {
        setNotes([]);
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => [tempNote, ...prev]);
    setNewlyCreatedNoteId(tempNote.id);
    setNewNoteText("");
    setShowNewNoteInput(false);

    try {
      const response = await api.CreateModuleNotes(moduleId, {
        note_text: newNoteText.trim(),
      });

      if (response.data?.data) {
        // Replace the temporary note with the real note data
        setTimeout(() => {
          setNotes((prev) =>
            prev.map((note) =>
              note.id === tempNote.id
                ? {
                    ...response.data.data,
                    id: response.data.data.id || note.id,
                  }
                : note
            )
          );
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
      setNotes((prev) => prev.filter((note) => note.id !== tempNote.id));
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
      });

      if (response.data && response.status >= 200 && response.status < 300) {
        // Update only the specific note without full reload
        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  note_text: editText.trim(),
                  updated_at: new Date().toISOString(),
                }
              : note
          )
        );
        setEditingNoteId(null);
        setEditText("");
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
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditText("");
    setIsSaving(false);
  };

  const cancelNewNote = () => {
    setShowNewNoteInput(false);
    setNewNoteText("");
  };

  const getRandomColor = () => {
    const colors = [
      "bg-yellow-50 border-yellow-200",
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-pink-50 border-pink-200",
      "bg-purple-50 border-purple-200",
      "bg-orange-50 border-orange-200",
    ];
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
    <div className="p-6 max-h-[70vh] mb-5 ">
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
              className={`${getRandomColor()} hover:shadow-md transition-all duration-200 cursor-pointer group relative`}
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

              <CardContent className="p-4">
                {editingNoteId === note.id ? (
                  <>
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
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap cursor-text"
                      style={{
                        minHeight:
                          calculateContentHeight(note.note_text) + "px",
                      }}
                      onClick={() => startEditing(note)}
                    >
                      {note.note_text}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(note);
                          }}
                          className="h-8 w-8 p-0 hover:bg-white/50"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
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
    </div>
  );
};

export default ModuleNotes;
