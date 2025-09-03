import { useState } from "react";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { BookOpen, ChevronDown, ChevronRight, Plus } from "lucide-react";

interface ModuleListProps {
  modules: any[];
  renderUnits: (module: any) => React.ReactElement;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/20">
    <div className="p-4 bg-primary/10 rounded-full mb-4">
      <BookOpen className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">No Modules Found</h3>
    <p className="text-muted-foreground max-w-md">
      This course doesn't have any modules yet. When modules are added, they
      will appear here.
    </p>
  </div>
);

const ModuleList = ({ modules, renderUnits }: ModuleListProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  if (modules.length === 0) return <EmptyState />;

  return (
    <div className="space-y-6">
      {modules.map((module: any, index: number) => (
        <Card key={module.id} className="border-1 border-gray-300 pt-4 ">
          <CardHeader className="pb-4">
            <div className="flex pt-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl text-primary font-bold text-lg">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-xl ">{module.title}</CardTitle>
                  <CardDescription className="uppercase text-base">
                    {module.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggle(module.id)}
                  className="hover:bg-primary/10"
                >
                  {expanded.has(module.id) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {expanded.has(module.id) && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Units</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="shadow-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Unit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Unit</DialogTitle>
                        <DialogDescription>
                          Add a new unit to {module.title}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>

                {renderUnits(module)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModuleList;
