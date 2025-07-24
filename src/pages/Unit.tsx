import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Button } from "@/Components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import UserCard from "@/Components/user-card";
import { useSidebarSelection } from "@/context/SidebarSelectionContext";
import { useState } from "react";
import { modules } from "@/lib/modulesData";
import React from "react";
import { getAdminConfig } from "@/lib/adminConfig";
import {
  getQuizResult,
  canAccessModule,
  canTakeQuiz,
  getRemainingAttempts,
} from "@/lib/quizResults";
import { toast } from "sonner";
import VideoControl from "@/Components/video-control";
import QuizOverview from "@/Components/quiz-overview";
import QuizTimer from "@/Components/quiz-timer";
import QuizResults from "@/Components/quiz-results";
import QuizQuestions from "@/Components/quiz-questions";
import AccessDenied from "@/Components/access-denied";

const Unit = () => {
  const { selectedIndex, setSelectedIndex, module, setModule } =
    useSidebarSelection();
  const currentModule = modules[module];
  const units = currentModule.units;
  const unitNumber = selectedIndex + 1;
  const currentUnit = units[unitNumber - 1];
  const hasQuiz = currentModule.quiz && currentModule.quiz.length > 0;
  const isQuizSelected = hasQuiz && selectedIndex === units.length;
  const isQuizActive = hasQuiz && selectedIndex === units.length + 1;

  // Admin configuration
  const adminConfig = getAdminConfig();

  // Check if user can access current module
  const canAccessCurrentModule = canAccessModule(module, adminConfig, modules);
  const previousModuleResult = getQuizResult(module - 1);

  // Quiz state
  const [selectedQuizOptions, setSelectedQuizOptions] = useState<
    (string | null)[]
  >([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    correct: number;
    total: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isQuizTimerActive, setIsQuizTimerActive] = useState(false);

  const quiz = hasQuiz ? currentModule.quiz[0] : null;
  const totalQuestions = quiz ? quiz.questions.length : 0;
  const existingQuizResult = getQuizResult(module);

  // Navigation logic
  const handleNext = () => {
    if (isQuizSelected) {
      if (module < modules.length - 1) {
        const canAccessNextModule = canAccessModule(
          module + 1,
          adminConfig,
          modules
        );
        if (canAccessNextModule) {
          setModule(module + 1);
          setSelectedIndex(0);
        } else {
          showQuizRequirementError(module);
        }
      }
      return;
    }
    const isLastUnit = selectedIndex === units.length - 1;
    if (isLastUnit) {
      if (hasQuiz) {
        setSelectedIndex(units.length);
      } else if (module < modules.length - 1) {
        const canAccessNextModule = canAccessModule(
          module + 1,
          adminConfig,
          modules
        );
        if (canAccessNextModule) {
          setModule(module + 1);
          setSelectedIndex(0);
        } else {
          showQuizRequirementError(module);
        }
      }
    } else {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (isQuizSelected) {
      setSelectedIndex(units.length - 1);
      return;
    }
    const isFirstUnit = selectedIndex === 0;
    if (isFirstUnit) {
      if (module > 0) {
        const prevModule = module - 1;
        const prevUnits = modules[prevModule].units;
        const prevHasQuiz =
          modules[prevModule].quiz && modules[prevModule].quiz.length > 0;
        setModule(prevModule);
        setSelectedIndex(prevHasQuiz ? prevUnits.length : prevUnits.length - 1);
      }
    } else {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const isLastUnitOfLastModule =
    module === modules.length - 1 &&
    ((hasQuiz && isQuizSelected) ||
      (!hasQuiz && selectedIndex === units.length - 1));
  const isFirstUnitOfFirstModule = module === 0 && selectedIndex === 0;

  // Quiz logic
  React.useEffect(() => {
    if (quiz) {
      setSelectedQuizOptions(new Array(totalQuestions).fill(null));
      setQuizSubmitted(false);
      setQuizResults(null);
    }
  }, [quiz, totalQuestions]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQuizTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (quiz && !quizSubmitted) {
              handleQuizSubmit();
            }
            setIsQuizTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isQuizTimerActive, timeRemaining, quiz, quizSubmitted]);

  const canTakeCurrentQuiz = canTakeQuiz(module, adminConfig);
  const remainingAttempts = getRemainingAttempts(module, adminConfig);
  const displayRemainingAttempts = isQuizActive
    ? Math.max(0, remainingAttempts - 1)
    : remainingAttempts;

  const showQuizRequirementError = (moduleIndex: number) => {
    const moduleHasQuiz =
      modules[moduleIndex] &&
      modules[moduleIndex].quiz &&
      modules[moduleIndex].quiz.length > 0;

    if (!moduleHasQuiz) {
      return;
    }

    toast.error(
      `You need to attempt the quiz for Module ${moduleIndex + 1} to continue.`,
      {
        duration: 5000,
        description: "Please attempt the quiz to proceed to the next module.",
      }
    );
  };

  const handleQuizOptionChange = (questionIndex: number, option: string) => {
    const newOptions = [...selectedQuizOptions];
    newOptions[questionIndex] = option;
    setSelectedQuizOptions(newOptions);
  };

  const handleQuizSubmit = () => {
    if (!quiz) return;

    const isAutoSubmit = timeRemaining === 0;
    if (
      !isAutoSubmit &&
      selectedQuizOptions.some((option) => option === null)
    ) {
      return;
    }

    let correctAnswers = 0;
    quiz.questions.forEach((question: any, index: number) => {
      if (selectedQuizOptions[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = adminConfig.requireQuizPass ? percentage >= 70 : true;

    const currentResult = getQuizResult(module);
    if (currentResult) {
      const results = JSON.parse(localStorage.getItem("quizResults") || "{}");
      results[module] = {
        ...currentResult,
        score: correctAnswers,
        percentage,
        passed,
        lastAttemptDate: new Date().toISOString(),
      };
      localStorage.setItem("quizResults", JSON.stringify(results));
    }

    setQuizResults({
      correct: correctAnswers,
      total: totalQuestions,
      percentage,
      passed,
    });
    setQuizSubmitted(true);
    setIsQuizTimerActive(false);

    if (isAutoSubmit) {
      toast.info("Time's up! Quiz has been auto-submitted.", {
        duration: 3000,
      });
    }
  };

  const handleRetakeQuiz = () => {
    setQuizSubmitted(false);
    setQuizResults(null);
    setSelectedQuizOptions(new Array(totalQuestions).fill(null));
    setTimeRemaining(adminConfig.testDuration * 60);
    setIsQuizTimerActive(true);
  };

  const handleStartQuiz = () => {
    setSelectedIndex(units.length + 1);
    setTimeRemaining(adminConfig.testDuration * 60);
    setIsQuizTimerActive(true);
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  const handleGoBackToQuiz = () => {
    setModule(module - 1);
    const prevUnits = modules[module - 1].units;
    setSelectedIndex(prevUnits.length);
  };

  const isAllQuestionsAnswered = selectedQuizOptions.every(
    (option) => option !== null
  );

  // Show access denied message if user can't access current module
  if (!canAccessCurrentModule) {
    return (
      <div>
        <SidebarProvider style={{} as React.CSSProperties}>
          <AppSidebar />
          <SidebarInset>
            <AccessDenied
              module={module}
              previousModuleResult={previousModuleResult}
              totalQuestions={totalQuestions}
              onGoBackToQuiz={handleGoBackToQuiz}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div>
      <SidebarProvider style={{} as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 ">
            <div className="flex  px-5 justify-between w-full">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Breadcrumb className="hidden md:block">
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Module {module + 1}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {isQuizSelected || isQuizActive
                          ? "Quiz"
                          : `Unit ${unitNumber}: ${
                              currentUnit?.topic || "Unknown Unit"
                            }`}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <UserCard sidebar={false} />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-1 md:gap-2  p-3">
            <div className="flex flex-col gap-1 md:gap-3">
              <div className="md:flex items-center justify-between">
                <p className=" text-xl  md:text-3xl text-sidebar-foreground font-bold">
                  {isQuizSelected || isQuizActive
                    ? "Quiz"
                    : `${currentUnit?.topic || "Unknown Unit"}`}
                </p>
                <div className="flex items-center gap-2 px-0 md:px-5  md:place-self-end text-[10px] md:text-sm text-sidebar-foreground font-bold">
                  {!isFirstUnitOfFirstModule && !isQuizActive && (
                    <Button
                      variant="link"
                      className="gap-2"
                      onClick={handlePrevious}
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Previous
                    </Button>
                  )}
                  {!isLastUnitOfLastModule && !isQuizActive && (
                    <Button
                      variant="link"
                      className="gap-2"
                      onClick={handleNext}
                    >
                      Next <ArrowRightIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {!isQuizSelected &&
                  currentUnit?.videoSrc &&
                  currentUnit.videoSrc !== "" && (
                    <VideoControl
                      src={currentUnit.videoSrc}
                      maxWidth="max-w-[100vw]"
                      maxHeight="max-h-135"
                      className="mx-auto"
                    />
                  )}
              </div>
              {isQuizSelected ? (
                quiz && (
                  <QuizOverview
                    module={module}
                    adminConfig={adminConfig}
                    canTakeCurrentQuiz={canTakeCurrentQuiz}
                    displayRemainingAttempts={displayRemainingAttempts}
                    existingQuizResult={existingQuizResult}
                    onStartQuiz={handleStartQuiz}
                  />
                )
              ) : isQuizActive ? (
                quiz && (
                  <div className="flex flex-col gap-3">
                    <div className="md:flex justify-between items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedIndex(units.length);
                          setIsQuizTimerActive(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="mb-2 md:mb-0"
                      >
                        Back to Quiz Overview
                      </Button>
                      <QuizTimer
                        timeRemaining={timeRemaining}
                        testDuration={adminConfig.testDuration}
                        isQuizTimerActive={isQuizTimerActive}
                      />
                    </div>
                    <QuizResults
                      quizResults={quizResults}
                      adminConfig={adminConfig}
                      canTakeCurrentQuiz={canTakeCurrentQuiz}
                      onRetakeQuiz={handleRetakeQuiz}
                    />
                    <QuizQuestions
                      quiz={quiz}
                      selectedQuizOptions={selectedQuizOptions}
                      quizSubmitted={quizSubmitted}
                      isAllQuestionsAnswered={isAllQuestionsAnswered}
                      onQuizOptionChange={handleQuizOptionChange}
                      onSubmitQuiz={handleQuizSubmit}
                    />
                  </div>
                )
              ) : currentUnit ? (
                <Tabs
                  defaultValue="lesson"
                  className="flex w-[100%] p-5 h-auto max-h-[80vh] md:max-h-[75vh]  "
                >
                  <TabsList className="mb-3">
                    <TabsTrigger value="lesson">Lesson</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  </TabsList>
                  <TabsContent value="lesson">
                    {currentUnit?.lesson || "No lesson content available"}
                  </TabsContent>
                  <TabsContent value="notes">
                    {currentUnit?.notes || "No notes available"}
                  </TabsContent>
                  <TabsContent value="discussion">
                    {currentUnit?.discussion ||
                      "No discussion content available"}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-lg text-gray-500">
                    No unit content available
                  </p>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Unit;
