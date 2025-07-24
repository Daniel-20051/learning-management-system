interface QuizTimerProps {
  timeRemaining: number;
  testDuration: number;
  isQuizTimerActive: boolean;
}

const QuizTimer = ({
  timeRemaining,
  testDuration,
  isQuizTimerActive,
}: QuizTimerProps) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!isQuizTimerActive) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-base font-semibold">
        <span className="text-foreground">Time:</span>
        <span
          className={`px-3 py-1 rounded font-mono text-base ${
            timeRemaining <= 60
              ? "bg-red-500 text-white animate-pulse shadow-lg"
              : timeRemaining <= 300
              ? "bg-orange-500/20 text-orange-500 border border-orange-500/30"
              : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
          }`}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 shadow-sm ${
            timeRemaining <= 60
              ? "bg-red-500"
              : timeRemaining <= 300
              ? "bg-orange-500"
              : "bg-blue-500"
          }`}
          style={{
            width: `${(timeRemaining / (testDuration * 60)) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default QuizTimer;
