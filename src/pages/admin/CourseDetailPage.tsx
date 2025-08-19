import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  FileText,
  Video,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Upload,
  X,
  HelpCircle,
} from "lucide-react";
import { dummyCourses } from "@/lib/adminData";

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

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  // Unit creation form state
  const [unitFormData, setUnitFormData] = useState<UnitFormData>({
    title: "",
    type: "lesson",
    content: "",
    videoFiles: [],
    quizQuestions: [],
  });

  // Course editing state
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseEditData, setCourseEditData] = useState({
    title: "",
    description: "",
    status: "draft" as "draft" | "published" | "archived",
  });

  // Module creation state
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
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

  const handleCancelEdit = () => {
    // Reset form to original values first
    if (course) {
      setCourseEditData({
        title: course.title,
        description: course.description,
        status: course.status,
      });
    }
  };

  const handleCloseModal = () => {
    setIsEditingCourse(false);
  };

  const handleAddModule = () => {
    // Here you would handle the actual module creation
    console.log("Creating module:", moduleFormData);
    // Reset form and close modal
    setModuleFormData({ title: "", description: "" });
    setIsAddingModule(false);
  };

  const handleCancelAddModule = () => {
    // Reset form and close modal
    setModuleFormData({ title: "", description: "" });
    setIsAddingModule(false);
  };

  // Find the course by ID
  const course = dummyCourses.find((c) => c.id === courseId);

  // Initialize course edit data when course is loaded
  useEffect(() => {
    if (course) {
      setCourseEditData({
        title: course.title,
        description: course.description,
        status: course.status,
      });
    }
  }, [course]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The course you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
    );
  }

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTotalUnits = () => {
    return course.modules.reduce(
      (total, module) => total + module.units.length,
      0
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl" />
        <div className="relative p-8">
          <Button
            variant="outline"
            size="sm"
            className="mb-6 hover:bg-background/80 backdrop-blur-sm"
            onClick={() => navigate("/admin/courses")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      {course.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    course.status === "published" ? "default" : "secondary"
                  }
                  className="text-sm px-4 py-2"
                >
                  {course.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingCourse(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Title
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Enrolled Students
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {course.enrolledStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Total Modules
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {course.modules.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Units
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {getTotalUnits()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Created
                </p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Type Breakdown */}

      {/* Course Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Modules & Units</h2>
          <p className="text-muted-foreground text-lg">
            Manage the content structure of your course
          </p>
        </div>
        <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="shadow-lg"
              onClick={() => setIsAddingModule(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
              <DialogDescription>
                Add a new module to {course.title}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="module-title">Module Title</Label>
                <Input
                  id="module-title"
                  placeholder="Enter module title"
                  value={moduleFormData.title}
                  onChange={(e) =>
                    setModuleFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  placeholder="Enter module description"
                  value={moduleFormData.description}
                  onChange={(e) =>
                    setModuleFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelAddModule}>
                Cancel
              </Button>
              <Button
                onClick={handleAddModule}
                disabled={!moduleFormData.title || !moduleFormData.description}
              >
                Add Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {course.modules.map((module, index) => (
          <Card
            key={module.id}
            className="border-0 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl text-primary font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription className="text-base">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {module.units.length} units
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleModuleExpansion(module.id)}
                    className="hover:bg-primary/10"
                  >
                    {expandedModules.has(module.id) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {expandedModules.has(module.id) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Units</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Unit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Unit</DialogTitle>
                          <DialogDescription>
                            Add a new unit to {module.title}
                          </DialogDescription>
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
                              onValueChange={(value: UnitType) =>
                                handleUnitTypeChange(value)
                              }
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
                                    <p className="text-primary">
                                      Drop video files here...
                                    </p>
                                  ) : (
                                    <div>
                                      <p className="text-muted-foreground">
                                        Drag & drop video files here, or click
                                        to select
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Supports: MP4, MOV, AVI, MKV, WebM (Max:
                                        50MB)
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
                                      {unitFormData.videoFiles.map(
                                        (file, index) => (
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
                                                (
                                                {(
                                                  file.size /
                                                  (1024 * 1024)
                                                ).toFixed(2)}{" "}
                                                MB)
                                              </span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                removeVideoFile(index)
                                              }
                                              className="hover:bg-destructive/10 hover:text-destructive"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )
                                      )}
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
                                        // This is a placeholder for image upload functionality
                                        // In a real app, you'd upload to your server and return the URL
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
                                      No questions added yet. Click "Add
                                      Question" to get started.
                                    </p>
                                  </div>
                                )}

                              <div className="space-y-4">
                                {unitFormData.quizQuestions?.map(
                                  (question, questionIndex) => (
                                    <Card key={question.id} className="p-4">
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <Label className="font-medium">
                                            Question {questionIndex + 1}
                                          </Label>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              removeQuizQuestion(question.id)
                                            }
                                            className="hover:bg-destructive/10 hover:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        <div className="grid gap-2">
                                          <Label
                                            htmlFor={`question-${question.id}`}
                                          >
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
                                          {question.options.map(
                                            (option, optionIndex) => (
                                              <div
                                                key={optionIndex}
                                                className="flex items-center gap-3"
                                              >
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                                                  {String.fromCharCode(
                                                    65 + optionIndex
                                                  )}
                                                </div>
                                                <Input
                                                  value={option}
                                                  onChange={(e) => {
                                                    const newOptions = [
                                                      ...question.options,
                                                    ];
                                                    newOptions[optionIndex] =
                                                      e.target.value;
                                                    updateQuizQuestion(
                                                      question.id,
                                                      { options: newOptions }
                                                    );
                                                  }}
                                                  placeholder={`Option ${String.fromCharCode(
                                                    65 + optionIndex
                                                  )}`}
                                                  className="flex-1"
                                                />
                                                <Button
                                                  variant={
                                                    question.correctAnswer ===
                                                    optionIndex
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  size="sm"
                                                  onClick={() =>
                                                    updateQuizQuestion(
                                                      question.id,
                                                      {
                                                        correctAnswer:
                                                          optionIndex,
                                                      }
                                                    )
                                                  }
                                                  className="min-w-[80px]"
                                                >
                                                  {question.correctAnswer ===
                                                  optionIndex ? (
                                                    <>
                                                      <CheckCircle className="mr-1 h-3 w-3" />
                                                      Correct
                                                    </>
                                                  ) : (
                                                    "Mark Correct"
                                                  )}
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </Card>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={resetUnitForm}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              // Here you would handle the actual unit creation
                              console.log("Creating unit:", unitFormData);
                              resetUnitForm();
                            }}
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
                  </div>

                  <div className="space-y-3">
                    {module.units.map((unit, unitIndex) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-muted/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg text-primary font-medium text-sm">
                            {unitIndex + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            {getUnitIcon(unit.type)}
                            <div>
                              <span className="font-medium">{unit.title}</span>
                              {unit.duration && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  {unit.duration}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Course Modal */}
      <Dialog
        open={isEditingCourse}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelEdit();
            handleCloseModal();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course title, description, and status
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                value={courseEditData.title}
                onChange={(e) =>
                  setCourseEditData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter course title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                value={courseEditData.description}
                onChange={(e) =>
                  setCourseEditData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter course description"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course-status">Status</Label>
              <Select
                value={courseEditData.status}
                onValueChange={(value: "draft" | "published" | "archived") =>
                  setCourseEditData((prev) => ({
                    ...prev,
                    status: value as "draft" | "published" | "archived",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                handleCancelEdit();
                handleCloseModal();
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Here you would handle the actual course update
                console.log("Updating course:", courseEditData);
                // Update the course data
                if (course) {
                  course.title = courseEditData.title;
                  course.description = courseEditData.description;
                  course.status = courseEditData.status;
                }
                setIsEditingCourse(false);
              }}
              disabled={!courseEditData.title || !courseEditData.description}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;
