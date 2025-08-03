// Authentication Flow Debug Utility with TypeScript support
// Add this to your app to debug authentication flow issues

import { Alert } from 'react-native';

// Type definitions
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

interface LogEntry {
  level: LogLevel;
  component: string;
  message: string;
  data: any;
  timestamp: string;
}

interface DebugConfig {
  showAlerts: boolean;
  logToConsole: boolean;
  minAlertLevel: LogLevel;
  trackFlowSteps: boolean;
  flowHistory: LogEntry[];
}

// The main AuthDebug object with proper TypeScript types
export const AuthDebug = {
  // Debug levels
  LEVELS: {
    INFO: 'INFO' as LogLevel,
    WARN: 'WARN' as LogLevel,
    ERROR: 'ERROR' as LogLevel,
    CRITICAL: 'CRITICAL' as LogLevel
  },

  // Configuration
  config: {
    showAlerts: __DEV__, // Only show alerts in development
    logToConsole: true,
    minAlertLevel: 'ERROR' as LogLevel, // Only show alerts for ERROR and CRITICAL
    trackFlowSteps: true,
    flowHistory: [] as LogEntry[]
  } as DebugConfig,

  // Log authentication flow events
  log(level: LogLevel, component: string, message: string, data: any = null): LogEntry {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = { level, component, message, data, timestamp };
    
    // Always log to console in development
    if (this.config.logToConsole) {
      const consoleMethod = level === this.LEVELS.ERROR || level === this.LEVELS.CRITICAL ? 
        console.error : (level === this.LEVELS.WARN ? console.warn : console.log);
      
      consoleMethod(
        `[${timestamp}] [${level}] [${component}]: ${message}`, 
        data ? data : ''
      );
    }
    
    // Show alerts for important messages (in dev only)
    if (this.config.showAlerts && 
        (level === this.LEVELS.ERROR || level === this.LEVELS.CRITICAL)) {
      Alert.alert(
        `Auth Debug: ${level}`,
        `${component}: ${message}${data ? '\n\nSee console for details.' : ''}`
      );
    }
    
    // Track for flow analysis
    if (this.config.trackFlowSteps) {
      this.config.flowHistory.push(logEntry);
      // Keep only last 50 entries
      if (this.config.flowHistory.length > 50) {
        this.config.flowHistory.shift();
      }
    }
    
    return logEntry;
  },
  
  // Helper methods for different log levels
  info(component: string, message: string, data: any = null): LogEntry {
    return this.log(this.LEVELS.INFO, component, message, data);
  },
  
  warn(component: string, message: string, data: any = null): LogEntry {
    return this.log(this.LEVELS.WARN, component, message, data);
  },
  
  error(component: string, message: string, data: any = null): LogEntry {
    return this.log(this.LEVELS.ERROR, component, message, data);
  },
  
  critical(component: string, message: string, data: any = null): LogEntry {
    return this.log(this.LEVELS.CRITICAL, component, message, data);
  },
  
  // Track specific flow steps
  trackFlowStep(flowName: string, stepName: string, data: any = null): LogEntry {
    return this.info(`FLOW:${flowName}`, stepName, data);
  },
  
  // Get flow history for a specific flow
  getFlowHistory(flowName: string): LogEntry[] {
    return this.config.flowHistory.filter(entry => 
      entry.component.startsWith(`FLOW:${flowName}`)
    );
  },
  
  // Clear flow history
  clearFlowHistory(): void {
    this.config.flowHistory = [];
  }
};

// Usage example:
// 
// // Import at the top of your file
// import { AuthDebug } from '@/utils/AuthDebug';
//
// // In your authentication code
// AuthDebug.trackFlowStep('GoogleSignIn', 'Started', { userId });
// 
// try {
//   // Your code here
//   AuthDebug.trackFlowStep('GoogleSignIn', 'Completed', { userId });
// } catch (error) {
//   AuthDebug.error('GoogleSignIn', 'Failed', { error, userId });
// }