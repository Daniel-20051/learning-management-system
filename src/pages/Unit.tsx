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
  } = useSidebarSelection();

  const api = new Api();

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

  // Navigation logic
  const handleNext = () => {
    const isLastUnit = selectedIndex === units.length - 1;
    if (isLastUnit) {
      if (module < modules.length - 1) {
        setModule(module + 1);
        setSelectedIndex(0);
      }
    } else {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrevious = () => {
    const isFirstUnit = selectedIndex === 0;
    if (isFirstUnit) {
      if (module > 0) {
        const prevModule = module - 1;
        const prevUnits = modules[prevModule].units;
        setModule(prevModule);
        setSelectedIndex(prevUnits.length - 1);
      }
    } else {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const isLastUnitOfLastModule =
    module === modules.length - 1 && selectedIndex === units.length - 1;
  const isFirstUnitOfFirstModule = module === 0 && selectedIndex === 0;

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

  // Show loading state while fetching modules - full page loader
  if (isLoading) {
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
              Fetching modules and content...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no modules are available
  if (!isLoading && modules.length === 0) {
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
                        {`Unit ${unitNumber}: ${
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
              <div className="md:flex items-center justify-between sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-2">
                <p className=" text-xl  md:text-3xl text-sidebar-foreground font-bold">
                  {`${currentUnit?.title || "Unknown Unit"}`}
                </p>
                <div className="flex items-center gap-2 px-0 md:px-5  md:place-self-end text-[10px] md:text-sm text-sidebar-foreground font-bold">
                  {!isFirstUnitOfFirstModule && (
                    <Button
                      variant="link"
                      className="gap-2"
                      onClick={handlePrevious}
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Previous
                    </Button>
                  )}
                  {!isLastUnitOfLastModule && (
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
              {currentUnit ? (
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
                          currentUnit?.content || "No lesson content available",
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
                      Discussion functionality will be implemented when endpoint
                      is available
                    </p>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-lg text-gray-500">
                    No unit content available
                  </p>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Unit;
