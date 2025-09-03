import { useState, useCallback } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Card } from "@/Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import {
  Plus,
  BookOpen,
  Upload,
  X,
  HelpCircle,
  Video,
  CheckCircle,
  Trash2,
} from "lucide-react";

// Types for unit creation
type UnitType = "lesson" | "quiz";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface UnitFormData {
  title: string;
  type: UnitType;
  content?: string; // Rich text content for lessons
  videoFiles?: File[];
  quizQuestions?: QuizQuestion[];
}

interface AddUnitDialogProps {
  moduleTitle: string;
  onAddUnit: (unitData: UnitFormData) => void;
  children: React.ReactNode;
}

const AddUnitDialog = ({
  moduleTitle,
  onAddUnit,
  children,
}: AddUnitDialogProps) => {
  // Unit creation form state
  const [unitFormData, setUnitFormData] = useState<UnitFormData>({
    title: "",
    type: "lesson",
    content: "",
    videoFiles: [],
    quizQuestions: [],
  });

  // Video dropzone functionality
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUnitFormData((prev) => ({
      ...prev,
      videoFiles: [...(prev.videoFiles || []), ...acceptedFiles],
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB limit
    onDropRejected: (rejectedFiles) => {
      // Handle rejected files (too large, wrong type, etc.)
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            alert(`File ${file.name} is too large. Maximum size is 50MB.`);
          }
        });
      });
    },
  });

  // Quiz question management
  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setUnitFormData((prev) => ({
      ...prev,
      quizQuestions: [...(prev.quizQuestions || []), newQuestion],
    }));
  };

  const updateQuizQuestion = (
    questionId: string,
    updates: Partial<QuizQuestion>
  ) => {
    setUnitFormData((prev) => ({
      ...prev,
      quizQuestions:
        prev.quizQuestions?.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ) || [],
    }));
  };

  const removeQuizQuestion = (questionId: string) => {
    setUnitFormData((prev) => ({
      ...prev,
      quizQuestions:
        prev.quizQuestions?.filter((q) => q.id !== questionId) || [],
    }));
  };

  const removeVideoFile = (index: number) => {
    setUnitFormData((prev) => ({
      ...prev,
      videoFiles: prev.videoFiles?.filter((_, i) => i !== index) || [],
    }));
  };

  const resetUnitForm = () => {
    setUnitFormData({
      title: "",
      type: "lesson",
      content: "",
      videoFiles: [],
      quizQuestions: [],
    });
  };

  const handleUnitTypeChange = (type: UnitType) => {
    setUnitFormData((prev) => ({
      ...prev,
      type,
      // Clear type-specific data when switching
      ...(type === "lesson"
        ? { quizQuestions: [] }
        : { content: "", videoFiles: [] }),
    }));
  };

  const handleAddUnit = () => {
    onAddUnit(unitFormData);
    resetUnitForm();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
          <DialogDescription>Add a new unit to {moduleTitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Unit Title */}
          <div className="grid gap-2">
            <Label htmlFor="unit-title">Unit Title</Label>
            <Input
              id="unit-title"
              value={unitFormData.title}
              onChange={(e) =>
                setUnitFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Enter unit title"
            />
          </div>

          {/* Unit Type Selection */}
          <div className="grid gap-2">
            <Label htmlFor="unit-type">Unit Type</Label>
            <Select
              value={unitFormData.type}
              onValueChange={(value: UnitType) => handleUnitTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Lesson
                  </div>
                </SelectItem>
                <SelectItem value="quiz">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Quiz
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Content Based on Unit Type */}
          {unitFormData.type === "lesson" && (
            <div className="space-y-6">
              {/* Video Upload Section */}
              <div className="grid gap-2">
                <Label>Video Files (Optional)</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  {isDragActive ? (
                    <p className="text-primary">Drop video files here...</p>
                  ) : (
                    <div>
                      <p className="text-muted-foreground">
                        Drag & drop video files here, or click to select
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports: MP4, MOV, AVI, MKV, WebM (Max: 50MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Display uploaded videos */}
                {unitFormData.videoFiles &&
                  unitFormData.videoFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Uploaded Videos:
                      </Label>
                      {unitFormData.videoFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVideoFile(index)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Rich Text Editor */}
              <div className="grid gap-2">
                <Label>Lesson Content</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    value={unitFormData.content}
                    onEditorChange={(content) =>
                      setUnitFormData((prev) => ({
                        ...prev,
                        content,
                      }))
                    }
                    init={{
                      height: 400,
                      menubar: false,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                        "help",
                        "wordcount",
                      ],
                      toolbar:
                        "undo redo | blocks | " +
                        "bold italic forecolor | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist outdent indent | " +
                        "removeformat | image link | help",
                      content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      images_upload_handler: (
                        blobInfo: any,
                        success: (url: string) => void
                      ) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          success(reader.result as string);
                        };
                        reader.readAsDataURL(blobInfo.blob());
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quiz Questions Builder */}
          {unitFormData.type === "quiz" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Quiz Questions
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuizQuestion}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>

              {unitFormData.quizQuestions &&
                unitFormData.quizQuestions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>
                      No questions added yet. Click "Add Question" to get
                      started.
                    </p>
                  </div>
                )}

              <div className="space-y-4">
                {unitFormData.quizQuestions?.map((question, questionIndex) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">
                          Question {questionIndex + 1}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuizQuestion(question.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`question-${question.id}`}>
                          Question Text
                        </Label>
                        <Textarea
                          id={`question-${question.id}`}
                          value={question.question}
                          onChange={(e) =>
                            updateQuizQuestion(question.id, {
                              question: e.target.value,
                            })
                          }
                          placeholder="Enter your question here..."
                          rows={3}
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label>Answer Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-3"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuizQuestion(question.id, {
                                  options: newOptions,
                                });
                              }}
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                              className="flex-1"
                            />
                            <Button
                              variant={
                                question.correctAnswer === optionIndex
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateQuizQuestion(question.id, {
                                  correctAnswer: optionIndex,
                                })
                              }
                              className="min-w-[80px]"
                            >
                              {question.correctAnswer === optionIndex ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Correct
                                </>
                              ) : (
                                "Mark Correct"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetUnitForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddUnit}
            disabled={
              !unitFormData.title ||
              (unitFormData.type === "quiz" &&
                (!unitFormData.quizQuestions ||
                  unitFormData.quizQuestions.length === 0))
            }
          >
            Add Unit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUnitDialog;
