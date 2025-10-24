import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/Components/ui/sidebar";

import { useSidebarSelection } from "@/context/SidebarSelectionContext";
import {
  SquarePlay,
  Lock,
  CircleCheck,
  FileText,
  ChevronDown,
  ChevronRight,
  ListChecks,
  ClipboardList,
} from "lucide-react";

// Array of unit contents

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const {
    selectedIndex,
    setSelectedIndex,
    module,
    setModule,
    modules,
    selectedQuiz,
    setSelectedQuiz,
    quizzes,
    selectedExams,
    setSelectedExams,
  } = useSidebarSelection();

  // State to track which module is expanded (only one at a time)
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  // Auto-expand the active module when it changes and on initial load
  useEffect(() => {
    setExpandedModule(module);
  }, [module]);

  const toggleModule = (moduleIndex: number) => {
    // If clicking on the currently expanded module, collapse it
    // If clicking on a different module, expand it (accordion behavior)
    setExpandedModule((prev) => (prev === moduleIndex ? null : moduleIndex));
  };

  // Quizzes are now loaded in the Unit component and shared via context
  return (
    <div className="flex">
      <Sidebar className="" variant="sidebar" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <p
                onClick={() => navigate("/")}
                className="text-3xl cursor-pointer font-bold"
              >
                <img src="/assets/logo.png" alt="Logo" className="w-50 h-15" />
              </p>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="pt-3">
          <SidebarGroup>
            <SidebarMenu>
              {/* Show all modules */}
              {modules.map((moduleItem, moduleIndex) => {
                const units = moduleItem?.units
                  ? [...moduleItem.units].sort((a, b) => a.order - b.order)
                  : [];
                const isActiveModule = module === moduleIndex && !selectedExams;
                const isExpanded = expandedModule === moduleIndex;

                return (
                  <SidebarMenuItem key={moduleItem.id}>
                    <SidebarMenuButton asChild>
                      <div
                        className={`font-bold h-auto text-lg cursor-pointer flex items-center justify-between w-full p-2 rounded-md hover:bg-accent ${
                          isActiveModule ? "text-primary" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          // Clear exams selection when selecting a module
                          setSelectedExams(false);
                          // If clicking on a different module, switch to it and expand
                          if (!isActiveModule) {
                            setModule(moduleIndex);
                            setSelectedIndex(0);
                          } else {
                            // If clicking on the active module, just toggle expand/collapse
                            toggleModule(moduleIndex);
                          }
                        }}
                      >
                        <span>
                          Module {moduleIndex + 1}:{" "}
                          <span className="font-normal">
                            {moduleItem.title}
                          </span>
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </div>
                    </SidebarMenuButton>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out overflow-hidden ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0">
                        <SidebarMenuSub>
                          {units.map((item, unitIndex) => (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton
                                className="h-auto cursor-pointer py-4 px-2 mb-5 "
                                asChild
                                isActive={
                                  isActiveModule &&
                                  selectedIndex === unitIndex &&
                                  !selectedQuiz &&
                                  !selectedExams
                                }
                                onClick={() => {
                                  setModule(moduleIndex);
                                  setSelectedIndex(unitIndex);
                                  setSelectedQuiz(null);
                                  setSelectedExams(false);
                                  // Ensure the parent module is expanded when selecting a unit
                                  setExpandedModule(moduleIndex);
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  {item.status === "completed" ? (
                                    <CircleCheck
                                      className="w-4 h-4"
                                      strokeWidth={3}
                                      color="green"
                                    />
                                  ) : item.video_url &&
                                    item.video_url.trim() !== "" ? (
                                    <SquarePlay className="w-4 h-4" />
                                  ) : (
                                    <FileText className="w-4 h-4" />
                                  )}
                                  <div className=" flex  text-wrap ">
                                    <a className="font-semibold ">
                                      Unit {item.order}:{" "}
                                      <span className="font-normal">
                                        {item.title}
                                      </span>
                                    </a>
                                  </div>
                                </div>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                          {/* Module Quizzes */}
                          {(() => {
                            const moduleQuizzes = (quizzes || []).filter(
                              (q: any) =>
                                String(q.module_id) === String(moduleItem.id) &&
                                String((q.status || "").toLowerCase()) ===
                                  "published"
                            );
                            if (moduleQuizzes.length === 0) return null;
                            return (
                              <div className="mt-2 w-full">
                                <div className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                                  Quiz
                                </div>
                                {moduleQuizzes.map((quiz: any) => (
                                  <SidebarMenuSubItem key={quiz.id}>
                                    <SidebarMenuSubButton
                                      className="h-auto cursor-pointer py-3 px-2"
                                      isActive={Boolean(
                                        selectedQuiz?.id === quiz.id && !selectedExams
                                      )}
                                      onClick={() => {
                                        setSelectedQuiz(quiz);
                                        setSelectedExams(false);
                                        setExpandedModule(moduleIndex);
                                      }}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                          <ListChecks className="w-4 h-4" />
                                          <span className="text-sm font-medium">
                                            {quiz.title}
                                          </span>
                                        </div>
                                        {quiz.duration_minutes ? (
                                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            {quiz.duration_minutes}m
                                          </span>
                                        ) : null}
                                      </div>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </div>
                            );
                          })()}
                        </SidebarMenuSub>
                      </div>
                    </div>
                  </SidebarMenuItem>
                  
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`cursor-pointer ${selectedExams ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => {
                    setSelectedExams(true);
                    setSelectedQuiz(null);
                    setModule(0);
                    setSelectedIndex(0);
                  }}
                >
                  <div className="flex gap-2 items-center">
                  <ClipboardList className="w-4 h-4" />
                    <p className="font-bold">Exams</p>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
        <SidebarFooter>
          <div
            className="flex flex-col gap-1 w-full p-2 cursor-pointer"
            onClick={() => navigate("/certificate")}
          >
            <div className="flex items-center  gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-base">Certificate</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Score above 75 to get certificate
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
