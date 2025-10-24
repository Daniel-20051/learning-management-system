import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { Badge } from "@/Components/ui/badge";
import { Card } from "@/Components/ui/card";
import { Api } from "@/api";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface QuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  examType: "objective-only" | "theory-only" | "mixed";
  onQuestionsSelected: (questions: any[]) => void;
}

const QuestionBankDialog = ({
  open,
  onOpenChange,
  courseId,
  examType,
  onQuestionsSelected
}: QuestionBankDialogProps) => {
  const api = useMemo(() => new Api(), []);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Load questions from bank
  useEffect(() => {
    if (!open || !courseId) return;

    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await api.GetBankQuestions(courseId);
        
        const data = (response as any)?.data?.data ?? (response as any)?.data ?? [];
        
        // Filter based on exam type
        let filteredQuestions = data;
        if (examType === "objective-only") {
          filteredQuestions = data.filter((q: any) => 
            q.question_type === "multiple_choice" || q.question_type === "true_false"
          );
        } else if (examType === "theory-only") {
          filteredQuestions = data.filter((q: any) => 
            q.question_type === "essay" || q.question_type === "short_answer"
          );
        }
        
        setQuestions(Array.isArray(filteredQuestions) ? filteredQuestions : []);
      } catch (err) {
        console.error("Error loading bank questions:", err);
        toast.error("Failed to load questions from bank");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [api, courseId, open, filterType, examType]);

  const handleToggleQuestion = (questionId: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleConfirm = () => {
    const selected = questions.filter(q => selectedQuestions.has(q.id));
    onQuestionsSelected(selected);
    setSelectedQuestions(new Set());
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedQuestions(new Set());
    onOpenChange(false);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "true_false":
        return "True/False";
      case "essay":
        return "Essay";
      case "short_answer":
        return "Short Answer";
      default:
        return type;
    }
  };

  const getQuestionTypeBadgeColor = (type: string) => {
    switch (type) {
      case "multiple_choice":
      case "true_false":
        return "bg-blue-100 text-blue-800";
      case "essay":
      case "short_answer":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter questions by search term
  const filteredQuestions = questions.filter(q => {
    if (!searchTerm.trim()) return true;
    return q.question_text?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Questions from Bank</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search Questions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by question text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filterType">Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selection controls */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedQuestions.size} of {filteredQuestions.length} selected
            </div>
          </div>

          {/* Questions list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading questions...</span>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No questions found in the bank.</p>
                <p className="text-sm mt-2">Try adjusting your filters or add questions to the bank first.</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <Card
                  key={question.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedQuestions.has(question.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => handleToggleQuestion(question.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() => handleToggleQuestion(question.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium line-clamp-2">
                          {question.question_text}
                        </p>
                        <Badge className={getQuestionTypeBadgeColor(question.question_type)}>
                          {getQuestionTypeLabel(question.question_type)}
                        </Badge>
                      </div>
                      {question.options && question.options.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {question.options.slice(0, 2).map((opt: any, idx: number) => (
                            <div key={idx} className="truncate">
                              {String.fromCharCode(65 + idx)}. {opt.option_text}
                            </div>
                          ))}
                          {question.options.length > 2 && (
                            <div className="italic">
                              +{question.options.length - 2} more option(s)
                            </div>
                          )}
                        </div>
                      )}
                      {question.points && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Points: {question.points}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedQuestions.size === 0}
          >
            Add {selectedQuestions.size} Question{selectedQuestions.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionBankDialog;

