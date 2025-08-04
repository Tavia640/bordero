// Password security utilities
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use pelo menos 8 caracteres');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos uma letra maiúscula');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos uma letra minúscula');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos um número');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos um caractere especial (!@#$%...)');
  }

  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Evite sequências comuns ou palavras óbvias');
  }

  // Repetitive characters
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Evite repetir o mesmo caractere consecutivamente');
  }

  return {
    score: Math.min(4, score),
    feedback,
    isStrong: score >= 4 && feedback.length === 0
  };
};

export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Muito fraca';
    case 2:
      return 'Fraca';
    case 3:
      return 'Média';
    case 4:
      return 'Forte';
    default:
      return 'Muito fraca';
  }
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-600';
    case 2:
      return 'text-orange-600';
    case 3:
      return 'text-yellow-600';
    case 4:
      return 'text-green-600';
    default:
      return 'text-red-600';
  }
};

// Rate limiting for login attempts
interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

export class LoginRateLimit {
  private static getAttempts(): LoginAttempt[] {
    const stored = localStorage.getItem('login_attempts');
    return stored ? JSON.parse(stored) : [];
  }

  private static saveAttempts(attempts: LoginAttempt[]): void {
    localStorage.setItem('login_attempts', JSON.stringify(attempts));
  }

  private static cleanupOldAttempts(attempts: LoginAttempt[]): LoginAttempt[] {
    const now = Date.now();
    return attempts.filter(attempt => now - attempt.timestamp < ATTEMPT_WINDOW);
  }

  static recordAttempt(email: string, success: boolean): void {
    const attempts = this.getAttempts();
    const cleanAttempts = this.cleanupOldAttempts(attempts);
    
    cleanAttempts.push({
      email: email.toLowerCase(),
      timestamp: Date.now(),
      success
    });

    this.saveAttempts(cleanAttempts);
  }

  static checkRateLimit(email: string): { 
    allowed: boolean; 
    attemptsLeft: number; 
    lockoutUntil?: number;
    requiresCaptcha: boolean;
  } {
    const attempts = this.getAttempts();
    const cleanAttempts = this.cleanupOldAttempts(attempts);
    const emailAttempts = cleanAttempts.filter(
      attempt => attempt.email === email.toLowerCase() && !attempt.success
    );

    const failedAttempts = emailAttempts.length;
    const lastFailedAttempt = emailAttempts[emailAttempts.length - 1];

    // Check if locked out
    if (lastFailedAttempt && failedAttempts >= MAX_ATTEMPTS) {
      const lockoutUntil = lastFailedAttempt.timestamp + LOCKOUT_DURATION;
      if (Date.now() < lockoutUntil) {
        return {
          allowed: false,
          attemptsLeft: 0,
          lockoutUntil,
          requiresCaptcha: true
        };
      }
    }

    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - failedAttempts);
    
    return {
      allowed: attemptsLeft > 0,
      attemptsLeft,
      requiresCaptcha: failedAttempts >= 3
    };
  }

  static getRemainingLockoutTime(lockoutUntil: number): number {
    return Math.max(0, lockoutUntil - Date.now());
  }

  static clearAttempts(email: string): void {
    const attempts = this.getAttempts();
    const filteredAttempts = attempts.filter(
      attempt => attempt.email !== email.toLowerCase()
    );
    this.saveAttempts(filteredAttempts);
  }

  static clearRateLimit(email: string): void {
    this.clearAttempts(email);
  }
}

// Simple math CAPTCHA
export class SimpleCaptcha {
  static generate(): { question: string; answer: number } {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer: number;
    let question: string;

    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '*':
        // Use smaller numbers for multiplication
        const small1 = Math.floor(Math.random() * 5) + 1;
        const small2 = Math.floor(Math.random() * 5) + 1;
        answer = small1 * small2;
        question = `${small1} × ${small2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }

    return { question, answer };
  }
}

// Session timeout management
export class SessionManager {
  private static readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
  
  private static timeoutId: NodeJS.Timeout | null = null;
  private static warningId: NodeJS.Timeout | null = null;
  private static onWarning: (() => void) | null = null;
  private static onTimeout: (() => void) | null = null;

  static start(onWarning: () => void, onTimeout: () => void): void {
    this.onWarning = onWarning;
    this.onTimeout = onTimeout;
    this.resetTimer();
    
    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this), true);
    });
  }

  static resetTimer(): void {
    // Clear existing timers
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);

    // Set warning timer
    this.warningId = setTimeout(() => {
      if (this.onWarning) this.onWarning();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      if (this.onTimeout) this.onTimeout();
    }, this.INACTIVITY_TIMEOUT);
  }

  static stop(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.removeEventListener(event, this.resetTimer.bind(this), true);
    });
  }
}

// Email validation with security considerations
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // Check for suspicious patterns
  if (email.length > 254) {
    return { isValid: false, error: 'Email muito longo' };
  }

  // Check for dangerous characters
  const dangerousChars = /[<>\"']/;
  if (dangerousChars.test(email)) {
    return { isValid: false, error: 'Email contém caracteres inválidos' };
  }

  return { isValid: true };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove dangerous characters
    .slice(0, 255); // Limit length
};
