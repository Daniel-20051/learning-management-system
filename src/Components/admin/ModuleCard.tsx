import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import AddUnitDialog from "@/pages/admin/course-details/components/AddUnitDialog";
import type React from "react";

interface ModuleCardProps {
  module: any;
  index: number;
  expanded: boolean;
  loadingUnits: boolean;
  onToggleExpand: (moduleId: string) => void;
  onDeleteModule: (module: any) => void;
  onAddUnit: (moduleId: string, data: any) => Promise<void>;
  onOpenQuizDialog: (module: any) => void;
  renderUnits: (module: any) => React.ReactNode;
  renderQuizzes: (module: any) => React.ReactNode;
}

const ModuleCard = ({
  module,
  index,
  expanded,
  loadingUnits,
  onToggleExpand,
  onDeleteModule,
  onAddUnit,
  onOpenQuizDialog,
  renderUnits,
  renderQuizzes,
}: ModuleCardProps) => {
  return (
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
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl">
                {module.title}
              </CardTitle>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(module.id)}
              className="hover:bg-primary/10"
            >
              {expanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDeleteModule(module)}
              aria-label="Delete module"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out overflow-hidden ${
            expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold">Units</h3>
                {loadingUnits && (
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-auto">
                  <AddUnitDialog
                    moduleTitle={module.title}
                    moduleId={module.id}
                    existingUnits={module.units || []}
                    onAddUnit={onAddUnit}
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
                <div className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-sm w-full"
                    onClick={() => onOpenQuizDialog(module)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quiz
                  </Button>
                </div>
              </div>
            </div>

            {renderUnits(module)}

            {renderQuizzes(module)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
