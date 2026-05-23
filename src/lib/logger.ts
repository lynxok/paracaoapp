
export type LogType = 'info' | 'error' | 'warning';

interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  module: string;
  details?: string;
  user: string;
}

class AuditLogger {
  private logs: LogEntry[] = [];
  private static instance: AuditLogger;

  private constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audit_logs');
      if (saved) {
        try {
          this.logs = JSON.parse(saved);
        } catch (e) {
          this.logs = [];
        }
      }
    }
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public log(message: string, type: LogType = 'info', module: string = 'Sistema', details?: string, user: string = 'Usuario') {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
      type,
      message,
      module,
      details,
      user
    };

    this.logs.unshift(entry);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('audit_logs', JSON.stringify(this.logs));
      // Dispatch custom event to notify listeners (like Settings page)
      window.dispatchEvent(new CustomEvent('audit_log_updated', { detail: entry }));
    }

    if (type === 'error') {
      console.error(`[AUDIT ERROR] ${module}: ${message}`, details);
    } else {
      console.log(`[AUDIT INFO] ${module}: ${message}`);
    }
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }
}

export const logger = AuditLogger.getInstance();

// Catch global errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.log(
      event.message,
      'error',
      'Runtime',
      `${event.filename}:${event.lineno}:${event.colno}`,
      'Sistema'
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.log(
      'Unhandled promise rejection',
      'error',
      'Async',
      String(event.reason),
      'Sistema'
    );
  });
}
