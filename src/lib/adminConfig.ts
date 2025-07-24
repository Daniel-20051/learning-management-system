export interface AdminConfig {
  requireQuizPass: boolean;
  requireQuizAttempt: boolean; // whether quiz attempt is required to proceed
  allowRetake: boolean;
  maxAttempts: number; // maximum number of quiz attempts allowed
  testDuration: number; // test duration in minutes
  passingScore: number; // minimum score required for certificate
}

// Default configuration - admin can modify these values
export const defaultAdminConfig: AdminConfig = {
  requireQuizPass: false,
  requireQuizAttempt: true, // require quiz attempt by default
  allowRetake: true,
  maxAttempts: 2, // 2 attempts allowed by default
  testDuration: 2, // 10 minutes by default
  passingScore: 75, // 75% required for certificate
};

// In a real app, this would be stored in a database or config file
// For now, we'll use localStorage to persist admin settings
export const getAdminConfig = (): AdminConfig => {
  const stored = localStorage.getItem('adminConfig');
  if (stored) {
    return JSON.parse(stored);
  }
  return defaultAdminConfig;
};

export const setAdminConfig = (config: AdminConfig) => {
  localStorage.setItem('adminConfig', JSON.stringify(config));
};

export const resetAdminConfig = () => {
  localStorage.removeItem('adminConfig');
}; 