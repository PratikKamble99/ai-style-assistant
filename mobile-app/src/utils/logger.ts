/**
 * Enhanced logging utility for AI Stylist Mobile App
 * Provides structured logging with different levels and performance tracking
 */

export interface LogData {
  [key: string]: any;
}

export interface PerformanceLog {
  action: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: LogData;
}

class Logger {
  private performanceLogs: PerformanceLog[] = [];
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = __DEV__ ? 'debug' : 'info';

  constructor(private context: string) {}

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.context}] ${level} ${message}`;
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  debug(message: string, data?: LogData): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('🐛 DEBUG', message), data ? JSON.stringify(data, null, 2) : '');
    }
  }

  info(message: string, data?: LogData): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('ℹ️ INFO', message), data ? JSON.stringify(data, null, 2) : '');
    }
  }

  success(message: string, data?: LogData): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('✅ SUCCESS', message), data ? JSON.stringify(data, null, 2) : '');
    }
  }

  warn(message: string, data?: LogData): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('⚠️ WARN', message), data ? JSON.stringify(data, null, 2) : '');
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('❌ ERROR', message), error);
      
      if (error?.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
      if (error?.request) {
        console.error('Request config:', error.config);
      }
    }
  }

  performance(action: string, startTime: number, metadata?: LogData): void {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const perfLog: PerformanceLog = {
      action,
      startTime,
      endTime,
      duration,
      metadata
    };
    
    this.performanceLogs.push(perfLog);
    
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('⏱️ PERF', `${action} completed in ${duration}ms`), metadata);
    }
    
    // Keep only last 100 performance logs to prevent memory issues
    if (this.performanceLogs.length > 100) {
      this.performanceLogs = this.performanceLogs.slice(-100);
    }
  }

  getPerformanceLogs(): PerformanceLog[] {
    return [...this.performanceLogs];
  }

  getAveragePerformance(action: string): number | null {
    const actionLogs = this.performanceLogs.filter(log => log.action === action);
    if (actionLogs.length === 0) return null;
    
    const totalDuration = actionLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    return totalDuration / actionLogs.length;
  }

  clearPerformanceLogs(): void {
    this.performanceLogs = [];
    this.info('Performance logs cleared');
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
    this.info(`Log level set to ${level}`);
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, duration: number): void {
    this.info(`API Response: ${method.toUpperCase()} ${url} - ${status} (${duration}ms)`);
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error);
  }

  userAction(action: string, data?: LogData): void {
    this.info(`User Action: ${action}`, data);
  }

  screenView(screenName: string, params?: LogData): void {
    this.info(`Screen View: ${screenName}`, params);
  }
}

// Create logger instances for different parts of the app
export const createLogger = (context: string): Logger => new Logger(context);

// Pre-configured loggers for common use cases
export const apiLogger = createLogger('API');
export const navigationLogger = createLogger('Navigation');
export const uiLogger = createLogger('UI');
export const performanceLogger = createLogger('Performance');

export default Logger;