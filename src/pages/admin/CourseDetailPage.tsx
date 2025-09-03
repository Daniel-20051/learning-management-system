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
} from "lucide-react";
import { Api } from "@/api";
import CourseHeader from "@/Components/admin/CourseHeader";
import CourseStats from "@/Components/admin/CourseStats";
import EditCourseModal from "@/Components/admin/EditCourseModal";
import AddUnitDialog from "@/Components/admin/AddUnitDialog";
import AddModuleDialog, {
  type AddModuleDialogRef,
} from "@/Components/admin/AddModuleDialog";

// Types for unit creation (moved to AddUnitDialog component)
interface UnitFormData {
  title: string;
  type: "lesson" | "quiz";
  content?: string; // Rich text content for lessons
  videoFiles?: File[];
  quizQuestions?: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const api = new Api();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [apiModules, setApiModules] = useState<any[]>([]);
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

  // Handle unit creation
  const handleAddUnit = (unitData: UnitFormData) => {
    console.log("Creating unit:", unitData);
    // TODO: Implement API call to create unit
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

      if (response && !response.response) {
        // Success - refresh the modules list
        console.log("Module created successfully:", response.data);

        // Reload modules to show the new module
        const modulesResponse = await api.GetCourseModules(courseId);
        const modulesData =
          modulesResponse?.data?.data ?? modulesResponse?.data ?? [];
        setApiModules(Array.isArray(modulesData) ? modulesData : []);

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
      setIsLoadingModules(true);

      try {
        const resp = await api.GetCourseModules(String(courseId));
        const data = resp?.data?.data ?? resp?.data ?? [];
        setApiModules(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.log(e);
      } finally {
        setIsLoadingModules(false);
      }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Modules & Units</h2>
          <p className="text-muted-foreground text-lg">
            Manage the content structure of your course
          </p>
        </div>
        <AddModuleDialog
          ref={addModuleDialogRef}
          onAddModule={handleAddModule}
          isLoading={isAddingModule}
        />
      </div>

      {/* Modules List - uses API modules */}
      <div className="space-y-6">
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
                className="border-1 border-gray-300 pt-3  transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl text-primary font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {Array.isArray(module.units) && (
                        <Badge variant="outline" className="text-sm px-3 py-1">
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {expandedModules.has(module.id) && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Units</h3>
                        <AddUnitDialog
                          moduleTitle={module.title}
                          onAddUnit={handleAddUnit}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-sm"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
                          </Button>
                        </AddUnitDialog>
                      </div>

                      <div className="space-y-3">
                        {(Array.isArray(module.units) ? module.units : []).map(
                          (unit: any, unitIndex: number) => (
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
                                    <span className="font-medium">
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
