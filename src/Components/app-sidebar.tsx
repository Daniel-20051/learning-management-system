import { useNavigate } from "react-router-dom";

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
import { modules } from "@/lib/modulesData";
import { SquarePlay, Lock, CircleCheck } from "lucide-react";

// Array of unit contents

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { selectedIndex, setSelectedIndex, module } = useSidebarSelection();
  const currentModule = modules[module];
  const units = currentModule.units;
  const hasQuiz = currentModule.quiz && currentModule.quiz.length > 0;
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
              {/* Only show the current module */}
              <SidebarMenuItem key={currentModule.title}>
                <SidebarMenuButton asChild>
                  <a href="#" className="font-bold text-xl">
                    {currentModule.title}
                  </a>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {units.map((item, index) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton
                        className="h-auto cursor-pointer py-4 px-2 mb-5 "
                        asChild
                        isActive={selectedIndex === index}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-start gap-2">
                          {item.isCompleted ? (
                            <CircleCheck
                              className="w-4 h-4"
                              strokeWidth={3}
                              color="green"
                            />
                          ) : (
                            <SquarePlay className="w-4 h-4" />
                          )}
                          <div className=" flex  text-wrap ">
                            <a className="font-semibold ">
                              {item.title}:{" "}
                              <span className="font-normal ">{item.topic}</span>
                            </a>
                          </div>
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  {hasQuiz && (
                    <SidebarMenuSubItem key="quiz">
                      <SidebarMenuSubButton
                        className="h-auto cursor-pointer py-4 px-2 mb-5 "
                        asChild
                        isActive={selectedIndex === units.length}
                        onClick={() => setSelectedIndex(units.length)}
                      >
                        <div className="flex items-start gap-2">
                          <Lock className="w-4 h-4" />
                          <div className=" flex  text-wrap ">
                            <a className="font-semibold">Quiz</a>
                          </div>
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
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
