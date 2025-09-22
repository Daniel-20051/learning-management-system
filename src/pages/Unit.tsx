import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Button } from "@/Components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import UserCard from "@/Components/user-card";
import { useSidebarSelection } from "@/context/SidebarSelectionContext";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import VideoControl from "@/Components/video-control";
import { useNavigate, useParams } from "react-router-dom";
import { Api } from "@/api/index";
import ModuleNotes from "@/Components/ModuleNotes";

const Unit = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const {
    selectedIndex,
    setSelectedIndex,
    module,
    setModule,
    setCourseId,
    modules,
    setModules,
    isLoading,
    setIsLoading,
    selectedQuiz,
    setSelectedQuiz,
    quizzes,
    setQuizzes,
  } = useSidebarSelection();

  // Add quiz loading state
  const [isQuizLoading, setIsQuizLoading] = useState(true);

  const api = new Api();

  // Quiz start/attempt are handled in QuizPage

  // Fetch course modules when component mounts or courseId changes
  useEffect(() => {
    const fetchCourseModules = async () => {
      if (!courseId) return;

      setIsLoading(true);
      setCourseId(courseId);

      try {
        const response = await api.GetCourseModules(courseId);

        if (response.data?.status && response.data?.data) {
          // Units are already included in the modules response
          const modulesWithUnits = response.data.data.map((mod: any) => ({
            ...mod,
            units: mod.units || [], // Use the units that come with the module
          }));

          setModules(modulesWithUnits);

          // Default to first unit of first module if no selection exists
          if (modulesWithUnits.length > 0) {
            const firstModule = modulesWithUnits[0];
            const sortedUnits = firstModule.units
              ? [...firstModule.units].sort((a, b) => a.order - b.order)
              : [];

            // Only set defaults if not already set
            if (module === 0 && selectedIndex === 0 && sortedUnits.length > 0) {
              setModule(0);
              setSelectedIndex(0);
            }
          }
        } else {
          console.log("Invalid response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching course modules:", error);
        toast.error("Failed to load course modules");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseModules();
  }, [courseId]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (!courseId) return;
        setIsQuizLoading(true);
        const response = await api.GetQuiz(Number(courseId));

        // Store quiz data in context
        if (
          response.data &&
          typeof response.data === "object" &&
          "status" in response.data &&
          "data" in response.data
        ) {
          const responseData = response.data as {
            status: boolean;
            data: any[];
          };
          if (responseData.status && responseData.data) {
            setQuizzes(responseData.data);
          } else {
            console.log("Invalid quiz response structure:", response.data);
            setQuizzes([]);
          }
        } else {
          console.log("Invalid quiz response structure:", response.data);
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error("Failed to load quizzes");
        setQuizzes([]);
      } finally {
        setIsQuizLoading(false);
      }
    };
    fetchQuizzes();
  }, [courseId, setQuizzes]);

  // Current module and unit logic
  const currentModule = modules[module] || null;
  const units = currentModule?.units
    ? [...currentModule.units].sort((a, b) => a.order - b.order)
    : [];
  const unitNumber = selectedIndex + 1;
  const currentUnit = units[unitNumber - 1] || null;

  // Ref to lesson content to enforce list styling
  const lessonContentRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"lesson" | "notes" | "discussion">(
    "lesson"
  );

  // Helper function to get quizzes for current module
  const getCurrentModuleQuizzes = () => {
    if (!currentModule?.id) return [];
    return (quizzes || []).filter(
      (q: any) =>
        String(q.module_id) === String(currentModule.id) &&
        String((q.status || "").toLowerCase()) === "published"
    );
  };

  // Helper function to get quizzes for a specific module
  const getModuleQuizzes = (moduleId: string) => {
    return (quizzes || []).filter(
      (q: any) =>
        String(q.module_id) === String(moduleId) &&
        String((q.status || "").toLowerCase()) === "published"
    );
  };

  // Navigation logic
  const handleNext = () => {
    // If currently viewing a quiz, handle quiz navigation
    if (selectedQuiz) {
      const currentModuleQuizzes = getCurrentModuleQuizzes();
      const currentQuizIndex = currentModuleQuizzes.findIndex(
        (q: any) => q.id === selectedQuiz.id
      );

      // If there's a next quiz in the current module
      if (currentQuizIndex < currentModuleQuizzes.length - 1) {
        setSelectedQuiz(currentModuleQuizzes[currentQuizIndex + 1]);
        return;
      }

      // No more quizzes in current module, try next module
      if (module < modules.length - 1) {
        const nextModule = modules[module + 1];
        const nextModuleQuizzes = getModuleQuizzes(nextModule.id);

        if (nextModuleQuizzes.length > 0) {
          // Go to next module and select first quiz
          setModule(module + 1);
          setSelectedIndex(0);
          setSelectedQuiz(nextModuleQuizzes[0]);
        } else {
          // No quizzes in next module, go to first unit
          setModule(module + 1);
          setSelectedIndex(0);
          setSelectedQuiz(null);
        }
      } else {
        // No more modules, stay on current quiz
        return;
      }
      return;
    }

    // If currently viewing a unit
    const isLastUnit = selectedIndex === units.length - 1;

    if (isLastUnit) {
      // Check if current module has quizzes
      const currentModuleQuizzes = getCurrentModuleQuizzes();

      if (currentModuleQuizzes.length > 0) {
        // Go to first quiz of current module
        setSelectedQuiz(currentModuleQuizzes[0]);
        return;
      }

      // No quizzes in current module, go to next module
      if (module < modules.length - 1) {
        const nextModule = modules[module + 1];
        const nextModuleQuizzes = getModuleQuizzes(nextModule.id);

        if (nextModuleQuizzes.length > 0) {
          // Go to next module and select first quiz
          setModule(module + 1);
          setSelectedIndex(0);
          setSelectedQuiz(nextModuleQuizzes[0]);
        } else {
          // Go to next module first unit
          setModule(module + 1);
          setSelectedIndex(0);
          setSelectedQuiz(null);
        }
      }
    } else {
      // Not last unit, go to next unit
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrevious = () => {
    // If currently viewing a quiz, handle quiz navigation
    if (selectedQuiz) {
      const currentModuleQuizzes = getCurrentModuleQuizzes();
      const currentQuizIndex = currentModuleQuizzes.findIndex(
        (q: any) => q.id === selectedQuiz.id
      );

      // If there's a previous quiz in the current module
      if (currentQuizIndex > 0) {
        setSelectedQuiz(currentModuleQuizzes[currentQuizIndex - 1]);
        return;
      }

      // No previous quiz in current module, go back to last unit of current module
      setSelectedQuiz(null);
      setSelectedIndex(units.length - 1);
      return;
    }

    // If currently viewing a unit
    const isFirstUnit = selectedIndex === 0;
    if (isFirstUnit) {
      if (module > 0) {
        const prevModule = modules[module - 1];
        const prevModuleQuizzes = getModuleQuizzes(prevModule.id);

        if (prevModuleQuizzes.length > 0) {
          // Go to previous module and select last quiz
          setModule(module - 1);
          setSelectedIndex(0);
          setSelectedQuiz(prevModuleQuizzes[prevModuleQuizzes.length - 1]);
        } else {
          // Go to previous module last unit
          const prevUnits = prevModule.units;
          setModule(module - 1);
          setSelectedIndex(prevUnits.length - 1);
          setSelectedQuiz(null);
        }
      }
    } else {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  // Check if we're at the very end (last unit of last module with no quizzes)
  const isLastUnitOfLastModule =
    module === modules.length - 1 && selectedIndex === units.length - 1;

  // Check if we're at the very beginning
  const isFirstUnitOfFirstModule = module === 0 && selectedIndex === 0;

  // Check if we should show the Next button
  const shouldShowNext = () => {
    // If viewing a quiz, check if there are more quizzes or modules
    if (selectedQuiz) {
      const currentModuleQuizzes = getCurrentModuleQuizzes();
      const currentQuizIndex = currentModuleQuizzes.findIndex(
        (q: any) => q.id === selectedQuiz.id
      );

      // Show next if there are more quizzes in current module or more modules
      return (
        currentQuizIndex < currentModuleQuizzes.length - 1 ||
        module < modules.length - 1
      );
    }

    // If viewing a unit, show next if not the last unit of last module
    return !isLastUnitOfLastModule;
  };

  // Check if we should show the Previous button
  const shouldShowPrevious = () => {
    // If viewing a quiz, check if there are previous quizzes or modules
    if (selectedQuiz) {
      const currentModuleQuizzes = getCurrentModuleQuizzes();
      const currentQuizIndex = currentModuleQuizzes.findIndex(
        (q: any) => q.id === selectedQuiz.id
      );

      // Show previous if there are previous quizzes in current module or more modules
      return currentQuizIndex > 0 || module > 0 || selectedIndex > 0;
    }

    // If viewing a unit, show previous if not the first unit of first module
    return !isFirstUnitOfFirstModule;
  };

  const applyListStyles = (root: HTMLElement | null) => {
    if (!root) return;
    const unorderedLists = root.querySelectorAll<HTMLUListElement>("ul");
    unorderedLists.forEach((ul) => {
      ul.style.listStyleType = "disc";
      ul.style.paddingLeft = "1.25rem";
      ul.style.marginBottom = "0.75rem";
    });
    const orderedLists = root.querySelectorAll<HTMLOListElement>("ol");
    orderedLists.forEach((ol) => {
      ol.style.listStyleType = "decimal";
      ol.style.paddingLeft = "1.25rem";
      ol.style.marginBottom = "0.75rem";
    });
    const listItems = root.querySelectorAll<HTMLLIElement>("li");
    listItems.forEach((li) => {
      li.style.marginTop = "0.25rem";
      li.style.marginBottom = "0.25rem";
    });
  };

  // Apply list styles when content changes or when returning to the Lesson tab
  useEffect(() => {
    if (activeTab !== "lesson") return;
    // Delay to ensure DOM is mounted
    const id = setTimeout(() => applyListStyles(lessonContentRef.current), 0);
    return () => clearTimeout(id);
  }, [activeTab, currentUnit?.content]);

  // Observe mutations inside lesson content to keep styles intact
  useEffect(() => {
    const root = lessonContentRef.current;
    if (!root) return;
    const observer = new MutationObserver(() => applyListStyles(root));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [lessonContentRef.current]);

  // Show loading state while fetching modules and quizzes - full page loader
  if (isLoading || isQuizLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin"></div>
            {/* Inner spinning dot */}
            <div className="absolute w-20 h-20 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            {/* Center dot */}
            <div className="absolute w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Loading Course
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Fetching modules and content..."
                : "Loading quizzes..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no modules are available
  if (!isLoading && !isQuizLoading && modules.length === 0) {
    return (
      <div>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <p className="text-lg text-gray-600">
                  No modules available for this course
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Course ID: {courseId}
                </p>
                <p className="text-sm text-gray-500">
                  Modules loaded: {modules.length}
                </p>
                <Button onClick={() => navigate(-1)} className="mt-4">
                  Go Back
                </Button>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Quiz taking moved to dedicated route /quiz/:quizId

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex  px-5 justify-between w-full">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Courses
                </Button>
                <Breadcrumb className="hidden md:block">
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Module {module + 1}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {selectedQuiz
                          ? `Quiz: ${selectedQuiz.title}`
                          : `Unit ${unitNumber}: ${
                              currentUnit?.title || "Unknown Unit"
                            }`}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <UserCard sidebar={false} />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-1 md:gap-2  p-3">
            <div className="flex flex-col gap-1 md:gap-3">
              {/* Quiz outlet: when a quiz is selected, hide unit UI */}
              {selectedQuiz && (
                <div className="w-full flex justify-center items-center py-6">
                  <div className="w-full max-w-4xl space-y-4">
                    <div className="border rounded-lg p-6 bg-card shadow-sm">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold">
                          {selectedQuiz.title}
                        </h2>
                        <div className="flex items-center gap-2">
                          {selectedQuiz.duration_minutes ? (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {selectedQuiz.duration_minutes} mins
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {selectedQuiz.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedQuiz.description}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border bg-muted/20">
                      <div className="p-5 border-b">
                        <p className="font-semibold">Quiz details</p>
                      </div>
                      <div className="p-5 flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Due</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            No due date
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Attempts</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedQuiz.attempts_allowed
                              ? `${selectedQuiz.attempts_allowed} allowed`
                              : "Unlimited"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Button
                            onClick={() => navigate(`/quiz/${selectedQuiz.id}`)}
                          >
                            Start Quiz
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card">
                      <div className="p-5 border-b">
                        <p className="font-semibold">Your grade</p>
                      </div>
                      <div className="p-5 text-sm text-muted-foreground">
                        You haven’t submitted this yet. We keep your highest
                        score.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!selectedQuiz && (
                <div className="md:flex items-center justify-between sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-2">
                  <p className=" text-xl  md:text-3xl text-sidebar-foreground font-bold">
                    {`${currentUnit?.title || "Unknown Unit"}`}
                  </p>
                  <div className="flex items-center gap-2 px-0 md:px-5  md:place-self-end text-[10px] md:text-sm text-sidebar-foreground font-bold">
                    {shouldShowPrevious() && (
                      <Button
                        variant="link"
                        className="gap-2"
                        onClick={handlePrevious}
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Previous
                      </Button>
                    )}
                    {shouldShowNext() && (
                      <Button
                        variant="link"
                        className="gap-2"
                        onClick={handleNext}
                      >
                        Next <ArrowRightIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {!selectedQuiz && (
                <div className="flex flex-col gap-4">
                  {currentUnit?.video_url && currentUnit.video_url !== "" && (
                    <VideoControl
                      src={currentUnit.video_url}
                      maxWidth="max-w-[100vw]"
                      maxHeight="max-h-100"
                      className="mx-auto"
                    />
                  )}
                </div>
              )}
              {!selectedQuiz &&
                (currentUnit ? (
                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                    className="flex w-[100%] p-5 h-auto max-h-[80vh] md:max-h-[75vh]  "
                  >
                    <TabsList className="mb-3">
                      <TabsTrigger value="lesson">Lesson</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                      <TabsTrigger value="discussion">Discussion</TabsTrigger>
                    </TabsList>
                    <TabsContent value="lesson">
                      <div
                        ref={lessonContentRef}
                        dangerouslySetInnerHTML={{
                          __html:
                            currentUnit?.content ||
                            "No lesson content available",
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="notes">
                      <ModuleNotes
                        moduleId={currentModule?.id || ""}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                    <TabsContent value="discussion">
                      {/* TODO: Implement discussion endpoint */}
                      <p className="text-muted-foreground">
                        Discussion functionality will be implemented when
                        endpoint is available
                      </p>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-500">
                      No unit content available
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Quiz Start Confirmation Modal removed; handled in QuizPage */}
    </div>
  );
};

export default Unit;
