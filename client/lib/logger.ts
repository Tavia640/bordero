// Simple logging utility for debugging authentication issues
class Logger {
  private static isDevelopment = import.meta.env.DEV;
  
  static log(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[AUTH] ${message}`, data || '');
    }
  }

  static warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(`[AUTH WARNING] ${message}`, data || '');
    }
  }

  static error(message: string, error?: any) {
    if (this.isDevelopment) {
      console.error(`[AUTH ERROR] ${message}`, error || '');
    }
    
    // In production, you might want to send this to an error tracking service
    if (!this.isDevelopment && error) {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, { extra: { message } });
    }
  }

  static info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.info(`[AUTH INFO] ${message}`, data || '');
    }
  }

  // Log authentication events
  static authEvent(event: string, details?: any) {
    this.log(`Auth Event: ${event}`, details);
  }

  // Log rate limiting events
  static rateLimitEvent(email: string, allowed: boolean, attemptsLeft?: number) {
    if (allowed) {
      this.log(`Rate limit check passed for ${email}`);
    } else {
      this.warn(`Rate limit exceeded for ${email}`, { attemptsLeft });
    }
  }

  // Log email events
  static emailEvent(event: string, email: string, success: boolean, error?: any) {
    if (success) {
      this.log(`Email ${event} successful for ${email}`);
    } else {
      this.error(`Email ${event} failed for ${email}`, error);
    }
  }

  // Log validation errors
  static validationError(field: string, value: string, error: string) {
    this.warn(`Validation error for ${field}`, { value, error });
  }
}

export default Logger;
