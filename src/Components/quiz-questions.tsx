import { Button } from "@/Components/ui/button";

interface QuizQuestionsProps {
  quiz: any;
  selectedQuizOptions: (string | null)[];
  quizSubmitted: boolean;
  isAllQuestionsAnswered: boolean;
  onQuizOptionChange: (questionIndex: number, option: string) => void;
  onSubmitQuiz: () => void;
}

const QuizQuestions = ({
  quiz,
  selectedQuizOptions,
  quizSubmitted,
  isAllQuestionsAnswered,
  onQuizOptionChange,
  onSubmitQuiz,
}: QuizQuestionsProps) => {
  if (quizSubmitted) return null;

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full md:w-[70%] flex flex-col gap-4">
        {quiz.questions.map((question: any, index: number) => (
          <div
            key={index}
            className="flex flex-col gap-3 p-4 bg-card border border-border rounded-lg shadow-sm"
          >
            <div className="font-semibold text-lg text-foreground">
              Question {index + 1}: {question.question}
            </div>
            <div className="flex flex-col gap-2">
              {question.options.map((option: string) => (
                <label
                  key={option}
                  className="flex items-center gap-2 p-2 rounded border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`quiz-option-${index}`}
                    value={option}
                    checked={selectedQuizOptions[index] === option}
                    onChange={() => onQuizOptionChange(index, option)}
                    disabled={quizSubmitted}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="text-foreground text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button
          onClick={onSubmitQuiz}
          disabled={!isAllQuestionsAnswered || quizSubmitted}
          className="px-6 py-2 self-end text-base"
          size="default"
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizQuestions;
