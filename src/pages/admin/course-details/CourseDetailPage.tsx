import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
// ModuleCard is not currently used after extraction; keeping UnitsList/QuizzesList
import UnitsList from "./components/UnitsList";
import QuizzesList from "./components/QuizzesList";
import QuizStatsDialog, {
  type QuizStatsDialogRef,
} from "./components/QuizStatsDialog";
import DeleteModuleDialog from "./components/DeleteModuleDialog";

import CourseDetailSkeleton from "./components/CourseDetailSkeleton";

import {
  Trash2,
  FileText,
  Video,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Api } from "@/api";
import CourseHeader from "@/Components/admin/CourseHeader";
import CourseStats from "@/Components/admin/CourseStats";
import EditCourseModal from "./components/EditCourseModal";
import AddUnitDialog, {
  type UnitFormData,
} from "./components/AddUnitDialog";
import AddModuleDialog, {
  type AddModuleDialogRef,
} from "./components/AddModuleDialog";
import EditUnitDialog from "./components/EditUnitDialog";
import DeleteUnitDialog from "./components/DeleteUnitDialog";
import UnitPreviewModal from "./components/UnitPreviewModal";
import CreateQuizDialog, {
  type CreateQuizDialogRef,
  type QuizFormData,
} from "./components/CreateQuizDialog";
import AddQuestionsDialog, {
  type AddQuestionsDialogRef,
  type Question as AddQuestion,
} from "./components/AddQuestionsDialog";
import QuizDetailsDialog, {
  type QuizDetailsDialogRef,
} from "./components/QuizDetailsDialog";
import EditQuizDialog, {
  type EditQuizDialogRef,
  type Quiz,
  type Question as EditQuestion,
} from "./components/EditQuizDialog";
import ConfirmDialog from "@/Components/ConfirmDialog";

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const api = new Api();
  
  // Determine if we're in super-admin context
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const coursesPath = isSuperAdmin ? "/super-admin/courses" : "/admin/courses";
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [expandedQuizSections, setExpandedQuizSections] = useState<Set<string>>(
    new Set()
  );
  const [apiModules, setApiModules] = useState<any[]>(() => []);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [courseCode, setCourseCode] = useState<string>("");
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const addModuleDialogRef = useRef<AddModuleDialogRef>(null);
  const [moduleToDelete, setModuleToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Per-module units loading state
  const [loadingUnitsForModuleIds, setLoadingUnitsForModuleIds] = useState<
    Set<string>
  >(new Set());

  // Unit editing state
  const [isEditUnitOpen, setIsEditUnitOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

  // Unit deletion state
  const [isDeleteUnitOpen, setIsDeleteUnitOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<any | null>(null);

  // Unit preview state
  const [isPreviewUnitOpen, setIsPreviewUnitOpen] = useState(false);
  const quizStatsDialogRef = useRef<QuizStatsDialogRef>(null);
  const [unitToPreview, setUnitToPreview] = useState<any | null>(null);

  // Quiz creation state
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [selectedModuleForQuiz, setSelectedModuleForQuiz] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const quizCreateDialogRef = useRef<CreateQuizDialogRef | null>(null);

  // Add questions state
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);
  const [isAddQuestionsDialogOpen, setIsAddQuestionsDialogOpen] =
    useState(false);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const addQuestionsDialogRef = useRef<AddQuestionsDialogRef | null>(null);
  const quizDetailsDialogRef = useRef<QuizDetailsDialogRef | null>(null);
  const editQuizDialogRef = useRef<EditQuizDialogRef | null>(null);

  // Quiz deletion state
  const [quizToDelete, setQuizToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  // Quiz editing state
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);

  // Helper: fetch modules (now includes units from the same endpoint)
  const fetchModulesAndUnits = async (id: string) => {
    setIsLoadingModules(true);
    try {
      const modulesResponse = await api.GetCourseModules(id);
      const modulesData =
        modulesResponse?.data?.data ?? modulesResponse?.data ?? [];
      const modulesArray: any[] = Array.isArray(modulesData) ? modulesData : [];
      setApiModules(() => [...modulesArray]);
    } catch (e: any) {
      setApiModules(() => []);
    } finally {
      setIsLoadingModules(false);
    }
  };

  // Refresh only the units of a specific module by reusing the modules endpoint
  const refreshUnitsFromModulesEndpoint = async (moduleId: string) => {
    if (!courseId) return;
    setLoadingUnitsForModuleIds((prev) => new Set(prev).add(moduleId));
    try {
      // Just refresh all modules for simplicity
      await fetchModulesAndUnits(String(courseId));
    } catch (e) {
      // no-op
    } finally {
      setLoadingUnitsForModuleIds((prev) => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
    }
  };

  // Handle unit creation (refresh only the affected module)
  const handleAddUnit = async (moduleId: string, _unitData: UnitFormData) => {
    await refreshUnitsFromModulesEndpoint(moduleId);
  };

  const handleCancelEdit = () => {};

  const handleCloseModal = () => {
    setIsEditingCourse(false);
  };

  const handleAddModule = async (moduleData: {
    title: string;
    description: string;
  }) => {
    if (!courseId) {
      console.error("No course ID available");
      return;
    }

    setIsAddingModule(true);

    try {
      const response = await api.AddModule(
        courseId,
        moduleData.title,
        moduleData.description
      );

      if (response.status === 201) {
        // Reload modules (with units) to show the new module
        await fetchModulesAndUnits(courseId);

        // Close dialog and reset form
        addModuleDialogRef.current?.closeDialog();

        // Show success toast
        toast.success("Module created successfully!");
      } else {
        // Error response
        console.error("Failed to create module:", response);
        toast.error("Failed to create module. Please try again.");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error(
        "An unexpected error occurred while creating the module. Please try again."
      );
    } finally {
      setIsAddingModule(false);
    }
  };

  // Fetch modules from API using separate endpoint
  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      await fetchModulesAndUnits(String(courseId));
    };
    load();
  }, [courseId]);

  // Update combined loading state when either course or modules loading changes
  useEffect(() => {
    setIsDetailsLoading(isLoadingCourse || isLoadingModules);
  }, [isLoadingCourse, isLoadingModules]);

  // Fetch course details (e.g., name/title) from separate endpoint by id
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      setIsLoadingCourse(true);
      try {
        const resp = await api.GetStaffCoursesbyId(String(courseId));
        setCourseCode(resp.data.data.course_code);
        setCourseTitle(resp.data.data.title);
      } catch (e: any) {
      } finally {
        setIsLoadingCourse(false);
      }
    };
    loadCourse();
  }, [courseId]);

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  const toggleQuizSectionExpansion = (moduleId: string) => {
    setExpandedQuizSections((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
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

  const getTotalUnits = useCallback(
    () =>
      apiModules.reduce(
        (total: number, module: any) =>
          total + (Array.isArray(module.units) ? module.units.length : 0),
        0
      ),
    [apiModules]
  );

  const confirmDeleteModule = (module: any) => {
    setModuleToDelete(module);
  };

  const openEditUnit = (unit: any) => {
    setSelectedUnit(unit);
    setIsEditUnitOpen(true);
  };

  const closeEditUnit = () => {
    setIsEditUnitOpen(false);
    setSelectedUnit(null);
  };

  const openDeleteUnit = (unit: any) => {
    setUnitToDelete(unit);
    setIsDeleteUnitOpen(true);
  };

  const closeDeleteUnit = () => {
    setIsDeleteUnitOpen(false);
    setUnitToDelete(null);
  };

  const handleDeleteUnit = async (_unitId: string | number) => {
    // Simplified delete approach - just refresh the data
    if (courseId) {
      await fetchModulesAndUnits(String(courseId));
    }

    // Show success alert
    toast.success("Unit deleted successfully!");

    closeDeleteUnit();
  };

  const openPreviewUnit = (unit: any) => {
    setUnitToPreview(unit);
    setIsPreviewUnitOpen(true);
  };

  const closePreviewUnit = () => {
    setIsPreviewUnitOpen(false);
    setUnitToPreview(null);
  };

  const handleUpdateUnit = (_updatedUnit: {
    id: string | number;
    title: string;
    content: string;
    video_url?: string;
  }) => {
    // Simplified update approach
    if (courseId) {
      fetchModulesAndUnits(String(courseId));
    }

    // Show success alert
    toast.success("Unit updated successfully!");
  };
  const isApiSuccess = (resp: any) =>
    resp?.status === 200 ||
    resp?.status === 201 ||
    (resp?.data as any)?.code === "200" ||
    (resp?.data as any)?.code === "201" ||
    (resp?.data as any)?.success === true;

  // Load quizzes
  const fetchQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const response = await api.GetQuiz();
      const list = (response?.data as any)?.data;
      setQuizzes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      setQuizzes([]);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Quiz creation handler
  const handleCreateQuiz = async (moduleId: string, quizData: QuizFormData) => {
    setIsCreatingQuiz(true);

    try {
      const response = await api.CreateQuiz({
        title: quizData.title,
        module_id: parseInt(moduleId),
        duration_minutes: quizData.duration_minutes,
        description: quizData.description,
        status: quizData.status,
      });

      const isSuccess = isApiSuccess(response);

      if (isSuccess) {
        // Close dialog
        setIsQuizDialogOpen(false);
        setSelectedModuleForQuiz(null);

        // Refresh quizzes list
        await fetchQuizzes();

        // Show success alert
        toast.success("Quiz created successfully!");

        // Automatically open the Add Questions dialog for the newly created quiz
        if ((response?.data as any)?.data?.id) {
          setSelectedQuizForQuestions({
            id: (response.data as any).data.id,
            title: quizData.title,
          });
          setIsAddQuestionsDialogOpen(true);
        }
      } else {
        throw new Error(
          `Failed to create quiz. Status: ${response?.status}, Code: ${
            (response?.data as any)?.code || "unknown"
          }`
        );
      }
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create quiz. Please try again."
      );
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Get all quizzes for a module (memoized)
  const quizzesByModuleId = useMemo(() => {
    const map = new Map<number, any[]>();
    for (const q of quizzes) {
      const arr = map.get(q.module_id) || [];
      arr.push(q);
      map.set(q.module_id, arr);
    }
    return map;
  }, [quizzes]);

  const getModuleQuizzes = useCallback(
    (moduleId: string) => quizzesByModuleId.get(parseInt(moduleId)) || [],
    [quizzesByModuleId]
  );

  // Check if a module has any quizzes
  const moduleHasQuizzes = useCallback(
    (moduleId: string) => getModuleQuizzes(moduleId).length > 0,
    [getModuleQuizzes]
  );

  // Open quiz dialog for a specific module
  const openQuizDialog = (_module: any) => {
    setSelectedModuleForQuiz({ id: _module.id, title: _module.title });
    setIsQuizDialogOpen(true);
  };

  // Handle adding questions to quiz
  const handleAddQuestions = async (
    quizId: number,
    questions: AddQuestion[]
  ) => {
    setIsAddingQuestions(true);

    try {
      // Normalize and map questions to API payload ensuring correct type
      const payloadQuestions = questions.map((q) => {
        const type =
          q.type === "multiple_choice" ? "multiple_choice" : "single_choice";
        // Ensure options exist and are normalized
        const rawOptions = Array.isArray(q.options) ? q.options : [];
        let foundCorrect = false;
        const normalizedOptions = rawOptions.map((opt) => {
          const isCorrect = !!opt.is_correct;
          if (type === "single_choice") {
            if (isCorrect && !foundCorrect) {
              foundCorrect = true;
              return { text: String(opt.text ?? "").trim(), is_correct: true };
            }
            return { text: String(opt.text ?? "").trim(), is_correct: false };
          }
          return { text: String(opt.text ?? "").trim(), is_correct: isCorrect };
        });

        return {
          text: String(q.text ?? "").trim(),
          type,
          points: Number(q.points ?? 1) || 1,
          options: normalizedOptions,
        };
      });

      const response = await api.AddQuizQuestions(
        quizId,
        payloadQuestions as any
      );

      const isSuccess = isApiSuccess(response);

      if (isSuccess) {
        // Close dialog
        setIsAddQuestionsDialogOpen(false);
        setSelectedQuizForQuestions(null);

        // Refresh quizzes to get updated question count
        await fetchQuizzes();

        // Show success alert
        toast.success("Questions added successfully!");
      } else {
        throw new Error(
          `Failed to add questions. Status: ${response?.status}, Code: ${
            (response?.data as any)?.code || "unknown"
          }`
        );
      }
    } catch (error: any) {
      console.error("Error adding questions:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add questions. Please try again."
      );
    } finally {
      setIsAddingQuestions(false);
    }
  };

  const openQuizDetailsDialog = (quiz: any) => {
    quizDetailsDialogRef.current?.openDialog(quiz);
  };

  const openEditQuiz = (quiz: any) => {
    editQuizDialogRef.current?.openDialog(quiz);
  };

  const openDeleteQuiz = (quiz: any) => {
    setQuizToDelete({ id: quiz.id, title: quiz.title });
  };

  const closeDeleteQuiz = () => {
    setQuizToDelete(null);
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setIsDeletingQuiz(true);
    try {
      const resp = await api.DeleteQuiz(quizToDelete.id);
      const wasSuccessful =
        (resp as any)?.status === 200 ||
        (resp as any)?.data?.code === "200" ||
        (resp as any)?.status === 204;
      if (wasSuccessful) {
        await fetchQuizzes();
        toast.success("Quiz deleted successfully!");
        closeDeleteQuiz();
      } else {
        toast.error("Failed to delete quiz. Please try again.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to delete quiz. Please try again."
      );
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  const handleUpdateQuiz = async (
    quizId: number,
    quizData: Partial<Quiz>,
    questions: EditQuestion[]
  ) => {
    setIsEditingQuiz(true);
    try {
      // Update quiz details
      await api.UpdateQuiz(quizId, {
        title: quizData.title,
        description: quizData.description,
        duration_minutes: quizData.duration_minutes,
        status: quizData.status,
      });

      // Update questions if there are any
      if (questions.length > 0) {
        await api.UpdateQuizQuestions(quizId, questions);
      }

      // Refresh quizzes list
      await fetchQuizzes();

      // Close dialog
      editQuizDialogRef.current?.closeDialog();

      toast.success("Quiz updated successfully!");
    } catch (error: any) {
      console.error("Error updating quiz:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update quiz. Please try again."
      );
      throw error; // Re-throw to prevent dialog from closing on error
    } finally {
      setIsEditingQuiz(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    setIsDeleting(true);
    try {
      const resp = await api.DeleteModule(String(moduleToDelete.id));
      const wasSuccessful =
        (resp as any)?.status === 200 || (resp as any)?.data?.code === "200";
      if (wasSuccessful) {
        // Refresh modules list from server
        if (courseId) {
          await fetchModulesAndUnits(String(courseId));
        }
        setModuleToDelete(null);
        toast.success("Module deleted successfully!");
      } else {
        console.error("Failed to delete module:", resp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state while course details or modules are loading
  if (isDetailsLoading) {
    return <CourseDetailSkeleton />;
  }

  return (
    <div className="space-y-8">
      <CourseHeader
        title={courseCode}
        subtitle={courseTitle}
        onBack={() => navigate(coursesPath)}
      />

      <CourseStats
        totalModules={apiModules.length}
        totalUnits={getTotalUnits()}
      />

      {/* Course Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Modules & Units</h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Manage the content structure of your course
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <AddModuleDialog
            ref={addModuleDialogRef}
            onAddModule={handleAddModule}
            isLoading={isAddingModule}
          />
        </div>
      </div>

      {/* Modules List - uses API modules */}
      <div className="space-y-6 mb-1">
        {!isLoadingModules && apiModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/20">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Modules Found</h3>
            <p className="text-muted-foreground max-w-md">
              This course doesn't have any modules yet. When modules are added,
              they will appear here.
            </p>
          </div>
        ) : (
          (isLoadingModules ? [] : apiModules).map(
            (module: any, index: number) => (
              <Card
                key={module.id}
                className="border-1 border-gray-300 py-2 gap-2 transition-shadow hover:bg-gray-100 cursor-pointer"
              >
                <CardHeader className="py-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl text-primary font-bold text-base sm:text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl">
                          {module.title}
                        </CardTitle>
                        {/* <CardDescription className="text-sm max-w-lg sm:text-base line-clamp-1">
                          {module.description}
                        </CardDescription> */}
                      </div>
                    </div>
                    <div className="flex items-center   gap-2 sm:gap-3">
                      {Array.isArray(module.units) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] md:text-xs sm:text-sm px-2 sm:px-3 py-1"
                        >
                          {module.units.length} units
                        </Badge>
                      )}
                      {moduleHasQuizzes(module.id) && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] md:text-xs sm:text-sm px-2 sm:px-3 py-1 bg-blue-100 text-blue-800"
                        >
                          <ClipboardList className="h-3 w-3 mr-1" />
                          {getModuleQuizzes(module.id).length} Quiz
                          {getModuleQuizzes(module.id).length > 1 ? "es" : ""}
                        </Badge>
                      )}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => confirmDeleteModule(module)}
                        aria-label="Delete module"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {expandedModules.has(module.id) && (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-semibold">
                            Units
                          </h3>
                          {loadingUnitsForModuleIds.has(module.id) && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="w-full sm:w-auto">
                            <AddUnitDialog
                              moduleTitle={module.title}
                              moduleId={module.id}
                              existingUnits={module.units || []}
                              onAddUnit={handleAddUnit}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-sm w-full"
                              >
                                Add Unit
                              </Button>
                            </AddUnitDialog>
                          </div>
                          <div className="w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-sm w-full"
                              onClick={() => openQuizDialog(module)}
                            >
                              <ClipboardList className="mr-2 h-4 w-4" />
                              Create Quiz
                            </Button>
                          </div>
                        </div>
                      </div>
                      <UnitsList
                        units={module.units || []}
                        getUnitIcon={getUnitIcon}
                        onPreviewUnit={openPreviewUnit}
                        onEditUnit={openEditUnit}
                        onDeleteUnit={openDeleteUnit}
                      />

                      {isLoadingQuizzes ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading quizzes...
                        </div>
                      ) : (
                        <QuizzesList
                          moduleId={module.id}
                          quizzes={getModuleQuizzes(module.id)}
                          expanded={expandedQuizSections.has(String(module.id))}
                          onToggle={(id) =>
                            toggleQuizSectionExpansion(String(id))
                          }
                          onView={openQuizDetailsDialog}
                          onEdit={openEditQuiz}
                          onDelete={openDeleteQuiz}
                          onStats={(quiz) =>
                            quizStatsDialogRef.current?.openDialog({
                              id: quiz.id,
                              title: quiz.title,
                            })
                          }
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )
        )}
      </div>

      <DeleteModuleDialog
        open={!!moduleToDelete}
        moduleTitle={moduleToDelete?.title}
        onCancel={() => setModuleToDelete(null)}
        onConfirm={handleDeleteModule}
        loading={isDeleting}
      />

      {/* Edit Unit Dialog */}
      <EditUnitDialog
        open={isEditUnitOpen}
        unit={selectedUnit}
        onClose={closeEditUnit}
        onSave={handleUpdateUnit}
      />

      {/* Delete Unit Dialog */}
      <DeleteUnitDialog
        open={isDeleteUnitOpen}
        unit={unitToDelete}
        onClose={closeDeleteUnit}
        onDelete={handleDeleteUnit}
      />

      {/* Unit Preview Modal */}
      <UnitPreviewModal
        open={isPreviewUnitOpen}
        unit={unitToPreview}
        onClose={closePreviewUnit}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        open={isEditingCourse}
        formData={{
          title: courseTitle,
          content: "",
        }}
        onChange={() => {}}
        onCancel={handleCancelEdit}
        onClose={handleCloseModal}
        onSave={() => {
          setIsEditingCourse(false);
        }}
      />

      {/* Quiz Creation Dialog */}
      {selectedModuleForQuiz && (
        <CreateQuizDialog
          ref={quizCreateDialogRef}
          moduleTitle={selectedModuleForQuiz.title}
          moduleId={selectedModuleForQuiz.id}
          onCreateQuiz={handleCreateQuiz}
          isLoading={isCreatingQuiz}
          open={isQuizDialogOpen}
          onOpenChange={setIsQuizDialogOpen}
        />
      )}

      {/* Quiz Stats Dialog */}
      <QuizStatsDialog ref={quizStatsDialogRef} />

      {/* Add Questions Dialog */}
      {selectedQuizForQuestions && (
        <AddQuestionsDialog
          ref={addQuestionsDialogRef}
          quizTitle={selectedQuizForQuestions.title}
          quizId={selectedQuizForQuestions.id}
          existingQuestions={(() => {
            return (
              quizzes.find((q) => q.id === selectedQuizForQuestions.id)
                ?.questions || []
            );
          })()}
          onAddQuestions={handleAddQuestions}
          isLoading={isAddingQuestions}
          open={isAddQuestionsDialogOpen}
          onOpenChange={setIsAddQuestionsDialogOpen}
        />
      )}

      <QuizDetailsDialog ref={quizDetailsDialogRef} />

      {/* Edit Quiz Dialog */}
      <EditQuizDialog
        ref={editQuizDialogRef}
        onUpdateQuiz={handleUpdateQuiz}
        isLoading={isEditingQuiz}
      />

      {/* Delete Quiz Confirm Dialog */}
      <ConfirmDialog
        open={!!quizToDelete}
        title="Delete quiz?"
        description={`This action cannot be undone. This will permanently delete "${
          quizToDelete?.title ?? "this quiz"
        }" and its questions.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteQuiz}
        onCancel={closeDeleteQuiz}
        isProcessing={isDeletingQuiz}
      />
    </div>
  );
};

export default CourseDetailPage;
