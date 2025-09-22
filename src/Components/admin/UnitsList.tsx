import { Button } from "@/Components/ui/button";
import { Eye, Edit, Trash2, Clock } from "lucide-react";
import type React from "react";

interface UnitsListProps {
  units: any[];
  getUnitIcon: (type: string) => React.ReactNode;
  onPreviewUnit: (unit: any) => void;
  onEditUnit: (unit: any) => void;
  onDeleteUnit: (unit: any) => void;
}

const UnitsList = ({
  units,
  getUnitIcon,
  onPreviewUnit,
  onEditUnit,
  onDeleteUnit,
}: UnitsListProps) => {
  return (
    <div className="space-y-3">
      {(Array.isArray(units) ? units : []).map(
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
                onClick={() => onPreviewUnit(unit)}
                title="Preview unit"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10"
                onClick={() => onEditUnit(unit)}
                title="Edit unit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDeleteUnit(unit)}
                title="Delete unit"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default UnitsList;
