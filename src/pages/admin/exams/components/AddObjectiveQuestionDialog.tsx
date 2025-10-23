import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Api } from "@/api";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface AddObjectiveQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  onQuestionAdded: () => void;
}

interface Option {
  id: string;
  text: string;
}

const AddObjectiveQuestionDialog = ({
  open,
  onOpenChange,
  courseId,
  onQuestionAdded
}: AddObjectiveQuestionDialogProps) => {
  const api = new Api();
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState<"objective" | "theory">("objective");
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState("1");
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [options, setOptions] = useState<Option[]>([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
  ]);

  const handleAddOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length); // A=65
    if (options.length < 10) { // Max 10 options (A-J)
      setOptions([...options, { id: nextLetter, text: "" }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) { // Keep at least 2 options
      const newOptions = options.filter((_, i) => i !== index);
      // Reassign IDs (A, B, C, etc.)
      const updatedOptions = newOptions.map((opt, idx) => ({
        ...opt,
        id: String.fromCharCode(65 + idx)
      }));
      setOptions(updatedOptions);
      
      // Reset correct option if it was removed
      if (correctOption === options[index].id) {
        setCorrectOption("A");
      }
    }
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!questionText.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const marksNum = parseFloat(marks);
    if (isNaN(marksNum) || marksNum <= 0) {
      toast.error("Please enter valid marks");
      return;
    }

    if (questionType === "objective") {
      const filledOptions = options.filter(opt => opt.text.trim());
      if (filledOptions.length < 2) {
        toast.error("Please provide at least 2 options");
        return;
      }

      if (!correctOption) {
        toast.error("Please select the correct option");
        return;
      }
    }

    setLoading(true);
    try {
      if (questionType === "objective") {
        const filledOptions = options.filter(opt => opt.text.trim());
        const payload = {
          course_id: courseId,
          question_text: questionText.trim(),
          options: filledOptions,
          correct_option: correctOption,
          marks: marksNum
        };
        await api.AddObjectiveQuestion(payload);
      } else {
        const payload = {
          course_id: courseId,
          question_text: questionText.trim(),
          max_marks: marksNum,
          difficulty: difficulty,
          topic: topic.trim() || undefined
        };
        await api.AddTheoryQuestion(payload);
      }
      
      toast.success("Question added successfully!");
      
      // Reset form
      resetForm();
      
      onQuestionAdded();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error adding question:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to add question";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuestionText("");
    setMarks("1");
    setDifficulty("medium");
    setTopic("");
    setCorrectOption("A");
    setOptions([
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
    ]);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 px-1">
          {/* Question Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="questionType" className="text-sm font-medium">
              Question Type <span className="text-red-500">*</span>
            </Label>
            <Select value={questionType} onValueChange={(value: "objective" | "theory") => setQuestionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="objective">Objective</SelectItem>
                <SelectItem value="theory">Theory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="questionText" className="text-sm font-medium">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="questionText"
              placeholder="Enter your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              required
              className="resize-none"
            />
          </div>

          {/* Objective-specific fields */}
          {questionType === "objective" && (
            <>
              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Options <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={options.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-9 bg-muted rounded border text-sm font-medium shrink-0">
                        {option.id}
                      </div>
                      <Input
                        placeholder={`Option ${option.id}`}
                        value={option.text}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Option and Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correctOption" className="text-sm font-medium">
                    Correct Option <span className="text-red-500">*</span>
                  </Label>
                  <Select value={correctOption} onValueChange={setCorrectOption}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options.filter(opt => opt.text.trim()).map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          Option {option.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marks" className="text-sm font-medium">
                    Marks <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="marks"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 2.00"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Theory-specific fields */}
          {questionType === "theory" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxMarks" className="text-sm font-medium">
                    Max Marks <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 10.00"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">
                  Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Biology"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddObjectiveQuestionDialog;

