import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
// Using native HTML radio inputs instead of custom radio-group component
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Clock, ChevronLeft, ChevronRight, FileText, CheckCircle } from "lucide-react";
import type { ExamQuestion, ExamStartResponse } from "@/types/admin";

interface ExamTakingInterfaceProps {
  examData: ExamStartResponse['data'];
  onBack: () => void;
}

const ExamTakingInterface = ({ examData, onBack }: ExamTakingInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(examData.duration_minutes * 60); // Convert to seconds
  
  const currentQuestion = examData.questions[currentQuestionIndex];
  const totalQuestions = examData.questions.length;

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.exam_item_id]: value
    }));
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

  const handleSubmitExam = () => {
    // TODO: Implement exam submission
    console.log("Submitting exam with answers:", answers);
  };

  const getQuestionTypeIcon = (type: string) => {
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getQuestionTypeIcon(currentQuestion.question_type)}
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
              <div className="text-lg font-medium">
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
                <Textarea
                  id="theory-answer"
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.exam_item_id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
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
            <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
              Submit Exam
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
