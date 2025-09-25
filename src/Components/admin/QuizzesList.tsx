import { Button } from "@/Components/ui/button";
import { Info } from "lucide-react";
import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

interface QuizzesListProps {
  moduleId: string | number;
  quizzes: any[];
  expanded: boolean;
  onToggle: (moduleId: string | number) => void;
  onView: (quiz: any) => void;
  onEdit: (quiz: any) => void;
  onDelete: (quiz: any) => void;
  onStats?: (quiz: any) => void;
}

const QuizzesList = ({
  moduleId,
  quizzes,
  expanded,
  onToggle,
  onView,
  onEdit,
  onDelete,
  onStats,
}: QuizzesListProps) => {
  if (!Array.isArray(quizzes) || quizzes.length === 0) return null;
  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
        onClick={() => onToggle(moduleId)}
      >
        <h3 className="text-base sm:text-lg font-semibold">
          Quizzes ({quizzes.length})
        </h3>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </div>
      {expanded && (
        <div className="space-y-2">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded text-sm font-medium text-gray-700">
                {index + 1}
              </div>
              <div className="flex items-center justify-center w-5 h-5 text-gray-600">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {quiz.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStats?.(quiz)}
                  title="View stats"
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(quiz)}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(quiz)}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(quiz)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizzesList;
