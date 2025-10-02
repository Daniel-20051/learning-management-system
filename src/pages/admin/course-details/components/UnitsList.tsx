import { Button } from "@/Components/ui/button";
import { Eye, Pencil, Trash2, Clock } from "lucide-react";
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
    <div className="space-y-2">
      {(Array.isArray(units) ? units : []).map(
        (unit: any, unitIndex: number) => (
          <div
            key={unit.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded text-sm font-medium text-gray-700">
              {unitIndex + 1}
            </div>
            <div className="flex items-center justify-center w-5 h-5 text-gray-600">
              {getUnitIcon(unit.type)}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                {unit.title}
              </span>
              {unit.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  {unit.duration}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreviewUnit(unit)}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                title="Preview unit"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditUnit(unit)}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                title="Edit unit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
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
