import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
// Using native HTML radio inputs instead of custom radio-group component
import { Label } from "@/Components/ui/label";
import { SecureTextarea } from "@/Components/ui/secure-textarea";
import { Clock, ChevronLeft, ChevronRight, FileText, CheckCircle } from "lucide-react";
import type { ExamStartResponse } from "@/types/admin";
import { Api } from "@/api/index";
import { toast } from "sonner";

interface ExamTakingInterfaceProps {
  examData: ExamStartResponse['data'];
  onBack: () => void;
}

const ExamTakingInterface = ({ examData, onBack }: ExamTakingInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(examData.duration_minutes * 60); // Convert to seconds
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [theoryAnswerTimeout, setTheoryAnswerTimeout] = useState<NodeJS.Timeout | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);
  
  const currentQuestion = examData.questions[currentQuestionIndex];
  const totalQuestions = examData.questions.length;
  const api = new Api();

  // Security measures for exam integrity
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        toast.error("Developer tools are disabled during the exam.");
        return false;
      }
      
      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        toast.error("Developer tools are disabled during the exam.");
        return false;
      }
      
      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        toast.error("Developer tools are disabled during the exam.");
        return false;
      }
      
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        toast.error("View source is disabled during the exam.");
        return false;
      }
      
      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        toast.error("Saving page is disabled during the exam.");
        return false;
      }
      
      // Disable Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        toast.error("Printing is disabled during the exam.");
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Right-click is disabled during the exam.");
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit exam when time runs out
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (theoryAnswerTimeout) {
        clearTimeout(theoryAnswerTimeout);
      }
    };
  }, [theoryAnswerTimeout]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const submitAnswer = async (questionId: number, answerType: "objective" | "theory", value: string) => {
    if (submittingAnswer) return;
    
    setSubmittingAnswer(true);
    try {
      const payload = answerType === "objective" 
        ? {
            exam_item_id: questionId,
            answer_type: "objective" as const,
            selected_option: value
          }
        : {
            exam_item_id: questionId,
            answer_type: "theory" as const,
            answer_text: value
          };

      await api.SubmitExamAnswer(examData.attempt_id, payload);
      // Don't show success toast for every answer to avoid spam
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      toast.error("Failed to save answer. Please try again.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.exam_item_id]: value
    }));

    if (currentQuestion.question_type === "objective") {
      // Submit objective answers immediately when selected
      submitAnswer(currentQuestion.exam_item_id, currentQuestion.question_type, value);
    } else if (currentQuestion.question_type === "theory") {
      // Debounce theory answers to avoid too many API calls
      if (theoryAnswerTimeout) {
        clearTimeout(theoryAnswerTimeout);
      }
      
      const timeout = setTimeout(() => {
        if (value.trim()) { // Only submit if there's actual content
          submitAnswer(currentQuestion.exam_item_id, currentQuestion.question_type, value);
        }
      }, 2000); // Wait 2 seconds after user stops typing
      
      setTheoryAnswerTimeout(timeout);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (submittingExam) return;
    
    // Clear any pending theory answer timeout before submitting
    if (theoryAnswerTimeout) {
      clearTimeout(theoryAnswerTimeout);
      setTheoryAnswerTimeout(null);
    }
    
    setSubmittingExam(true);
    try {
      const response = await api.SubmitExam(examData.attempt_id);
      
      if (response.data && typeof response.data === 'object' && 'status' in response.data && response.data.status) {
        toast.success("Exam submitted successfully!");
        // Go back to exams list after successful submission
        onBack();
      } else {
        toast.error("Failed to submit exam");
      }
    } catch (err: any) {
      console.error("Error submitting exam:", err);
      toast.error(err.response?.data?.message || "Failed to submit exam. Please try again.");
    } finally {
      setSubmittingExam(false);
    }
  };

  const getQuestionTypeIcon = () => {
    return <FileText className="w-4 h-4" />;
  };

  const isQuestionAnswered = (questionId: number) => {
    return answers[questionId] !== undefined && answers[questionId] !== '';
  };

  return (
    <div className="w-full py-4">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Exams
            </Button>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-foreground'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Badge variant="outline">
              {examData.remaining_attempts} attempts left
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="mb-6 pt-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getQuestionTypeIcon()}
                <span className="capitalize">{currentQuestion.question_type} Question</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {currentQuestion.max_marks} marks
                </Badge>
                {isQuestionAnswered(currentQuestion.exam_item_id) && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            {currentQuestion.question_text && (
              <div 
                className="text-lg font-medium select-none"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onCopy={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onDragStart={(e) => {
                  e.preventDefault();
                  return false;
                }}
              >
                {currentQuestion.question_text}
              </div>
            )}

            {/* Question Media */}
            {currentQuestion.image_url && (
              <div className="flex justify-center">
                <img 
                  src={currentQuestion.image_url} 
                  alt="Question image" 
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}

            {currentQuestion.video_url && (
              <div className="flex justify-center">
                <video 
                  src={currentQuestion.video_url} 
                  controls 
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}

            {/* Answer Input */}
            {currentQuestion.question_type === "objective" && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`question-${currentQuestion.exam_item_id}-option-${option.id}`}
                      name={`question-${currentQuestion.exam_item_id}`}
                      value={option.id}
                      checked={answers[currentQuestion.exam_item_id] === option.id}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                    />
                    <Label 
                      htmlFor={`question-${currentQuestion.exam_item_id}-option-${option.id}`} 
                      className="cursor-pointer flex-1"
                    >
                      {option.id}. {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            ) : currentQuestion.question_type === "theory" ? (
              <div className="space-y-2">
                <Label htmlFor="theory-answer">Your Answer:</Label>
                <SecureTextarea
                  id="theory-answer"
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.exam_item_id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  rows={6}
                  className="resize-none"
                  disableCopyPaste={true}
                />
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Copy and paste are disabled during the exam for security purposes.
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground italic">
                Question content not available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {totalQuestions} questions answered
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button 
              onClick={handleSubmitExam} 
              disabled={submittingExam}
              className="bg-green-600 hover:bg-green-700"
            >
              {submittingExam ? "Submitting..." : "Submit Exam"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamTakingInterface;
