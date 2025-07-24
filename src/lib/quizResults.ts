export interface QuizResult {
  moduleIndex: number;
  score: number;
  percentage: number;
  passed: boolean;
  attempts: number;
  lastAttemptDate: string;
}

export interface QuizResults {
  [moduleIndex: number]: QuizResult;
}

// Get quiz results for all modules
export const getQuizResults = (): QuizResults => {
  const stored = localStorage.getItem('quizResults');
  if (stored) {
    return JSON.parse(stored);
  }
  return {};
};

// Save quiz result for a specific module
export const saveQuizResult = (moduleIndex: number, score: number, percentage: number, passed: boolean) => {
  const results = getQuizResults();
  const existing = results[moduleIndex];
  
  results[moduleIndex] = {
    moduleIndex,
    score,
    percentage,
    passed,
    attempts: existing ? existing.attempts + 1 : 1,
    lastAttemptDate: new Date().toISOString(),
  };
  
  localStorage.setItem('quizResults', JSON.stringify(results));
};

// Get quiz result for a specific module
export const getQuizResult = (moduleIndex: number): QuizResult | null => {
  const results = getQuizResults();
  return results[moduleIndex] || null;
};

// Check if user can access a specific module (based on previous quiz results)
export const canAccessModule = (moduleIndex: number, adminConfig: any, modules?: any[]): boolean => {
  if (!adminConfig.requireQuizAttempt) {
    return true; // No quiz attempt requirement
  }
  
  if (moduleIndex === 0) {
    return true; // First module is always accessible
  }
  
  // Check if previous module has a quiz
  const previousModule = modules && modules[moduleIndex - 1];
  const previousModuleHasQuiz = previousModule && previousModule.quiz && previousModule.quiz.length > 0;
  
  // If previous module doesn't have a quiz, allow access
  if (!previousModuleHasQuiz) {
    return true;
  }
  
  // Check if previous module's quiz was attempted
  const previousModuleResult = getQuizResult(moduleIndex - 1);
  if (!previousModuleResult) {
    return false; // Haven't attempted the quiz yet
  }
  
  // If requireQuizPass is also enabled, check if passed
  if (adminConfig.requireQuizPass) {
    return previousModuleResult.passed;
  }
  
  // Just require attempt, not necessarily pass
  return true; // If they attempted the quiz, they can proceed
};

// Check if user can take a quiz (based on attempt limits)
export const canTakeQuiz = (moduleIndex: number, adminConfig: any): boolean => {
  const result = getQuizResult(moduleIndex);
  if (!result) {
    return true; // No previous attempts, can take quiz
  }
  
  return result.attempts < adminConfig.maxAttempts;
};

// Get remaining attempts for a module
export const getRemainingAttempts = (moduleIndex: number, adminConfig: any): number => {
  const result = getQuizResult(moduleIndex);
  if (!result) {
    return adminConfig.maxAttempts;
  }
  
  return Math.max(0, adminConfig.maxAttempts - result.attempts);
};

// Clear all quiz results (for testing or reset)
export const clearQuizResults = () => {
  localStorage.removeItem('quizResults');
};

// Reset quiz attempts for a specific module (for testing or admin purposes)
export const resetQuizAttempts = (moduleIndex: number) => {
  const results = getQuizResults();
  if (results[moduleIndex]) {
    delete results[moduleIndex];
    localStorage.setItem('quizResults', JSON.stringify(results));
  }
}; 