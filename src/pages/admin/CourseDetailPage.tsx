import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import DeleteModuleDialog from "@/Components/admin/DeleteModuleDialog";

import CourseDetailSkeleton from "@/Components/CourseDetailSkeleton";

import {
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
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Api } from "@/api";
import CourseHeader from "@/Components/admin/CourseHeader";
import CourseStats from "@/Components/admin/CourseStats";
import EditCourseModal from "@/Components/admin/EditCourseModal";
import AddUnitDialog, {
  type UnitFormData,
} from "@/Components/admin/AddUnitDialog";
import AddModuleDialog, {
  type AddModuleDialogRef,
} from "@/Components/admin/AddModuleDialog";
import EditUnitDialog from "@/Components/admin/EditUnitDialog";
import DeleteUnitDialog from "@/Components/admin/DeleteUnitDialog";
import UnitPreviewModal from "@/Components/admin/UnitPreviewModal";

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const api = new Api();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
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
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const addModuleDialogRef = useRef<AddModuleDialogRef>(null);
  const [moduleToDelete, setModuleToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showUnitUpdateSuccess, setShowUnitUpdateSuccess] = useState(false);
  const [showUnitDeleteSuccess, setShowUnitDeleteSuccess] = useState(false);

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
  const [unitToPreview, setUnitToPreview] = useState<any | null>(null);

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
      console.log(e);
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
  const handleAddUnit = async (moduleId: string, unitData: UnitFormData) => {
    console.log("handleAddUnit", moduleId, unitData);
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

      if (response.code === "201") {
        // Reload modules (with units) to show the new module
        await fetchModulesAndUnits(courseId);

        // Close dialog and reset form
        addModuleDialogRef.current?.closeDialog();

        // Show success alert
        setShowSuccessAlert(true);

        // Auto-hide alert after 5 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 5000);
      } else {
        // Error response
        console.error("Failed to create module:", response);
        setErrorMessage("Failed to create module. Please try again.");
        setShowErrorAlert(true);

        // Auto-hide error alert after 5 seconds
        setTimeout(() => {
          setShowErrorAlert(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error creating module:", error);
      setErrorMessage(
        "An unexpected error occurred while creating the module. Please try again."
      );
      setShowErrorAlert(true);

      // Auto-hide error alert after 5 seconds
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 5000);
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
        console.log(e);
      } finally {
        setIsLoadingCourse(false);
      }
    };
    loadCourse();
  }, [courseId]);

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
    return apiModules.reduce((total: number, module: any) => {
      const units = Array.isArray(module.units) ? module.units.length : 0;
      return total + units;
    }, 0);
  };

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
    setShowUnitDeleteSuccess(true);
    setTimeout(() => setShowUnitDeleteSuccess(false), 4000);

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
    setShowUnitUpdateSuccess(true);
    setTimeout(() => setShowUnitUpdateSuccess(false), 4000);
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
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 4000);
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
        onBack={() => navigate("/admin/courses")}
      />

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            Module Created Successfully!
          </AlertTitle>
          <AlertDescription className="text-green-700">
            The new module has been added to your course and is now available in
            the modules list below.
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Success Alert */}
      {showDeleteSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Module Deleted</AlertTitle>
          <AlertDescription className="text-green-700">
            The module was deleted successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Unit Update Success Alert */}
      {showUnitUpdateSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Unit Updated</AlertTitle>
          <AlertDescription className="text-green-700">
            The unit was updated successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Unit Delete Success Alert */}
      {showUnitDeleteSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Unit Deleted</AlertTitle>
          <AlertDescription className="text-green-700">
            The unit has been deleted successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Failed to Create Module
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

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
                className="border-1 border-gray-300 py-2 gap-2 transition-shadow"
              >
                <CardHeader className="py-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl text-primary font-bold text-base sm:text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {Array.isArray(module.units) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] md:text-xs sm:text-sm px-2 sm:px-3 py-1"
                        >
                          {module.units.length} units
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
                              <Plus className="mr-2 h-4 w-4" />
                              Add Unit
                            </Button>
                          </AddUnitDialog>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(Array.isArray(module.units) ? module.units : []).map(
                          (unit: any, unitIndex: number) => (
                            <div
                              key={unit.id}
                              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/30 rounded-xl border border-muted/50 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-lg text-primary font-medium text-xs sm:text-sm">
                                  {unitIndex + 1}
                                </div>
                                <div className="flex items-center gap-3">
                                  {getUnitIcon(unit.type)}
                                  <div>
                                    <span className="font-medium text-sm sm:text-base">
                                      {unit.title}
                                    </span>
                                    {unit.duration && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3" />
                                        {unit.duration}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:self-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => openPreviewUnit(unit)}
                                  title="Preview unit"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-primary/10"
                                  onClick={() => openEditUnit(unit)}
                                  title="Edit unit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => openDeleteUnit(unit)}
                                  title="Delete unit"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
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
    </div>
  );
};

export default CourseDetailPage;
