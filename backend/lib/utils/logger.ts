/* ─── Structured Logger ─────────────────────────────────────────────────────
 *
 * A lightweight, structured logger that outputs JSON lines in production
 * and pretty-prints in development.
 * Logs: prompt_length, token_usage, latency_ms, retry_count, errors.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV !== "production";

function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (isDev) {
    const color =
      level === "error" ? "\x1b[31m" :
      level === "warn"  ? "\x1b[33m" :
      level === "debug" ? "\x1b[36m" : "\x1b[32m";
    const reset = "\x1b[0m";
    console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`, meta);
  } else {
    // Production: structured JSON line
    process.stdout.write(JSON.stringify(entry) + "\n");
  }
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log("info",  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log("warn",  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),

  /** Log AI generation attempt metrics */
  aiCall(meta: {
    endpoint: string;
    prompt_length: number;
    latency_ms: number;
    tokens_used?: number;
    attempt: number;
    success: boolean;
  }) {
    log(meta.success ? "info" : "warn", `[AI] ${meta.endpoint} call`, meta);
  },

  /** Log validation failure details */
  validationFail(meta: {
    endpoint: string;
    issues: string[];
    attempt: number;
  }) {
    log("warn", `[Validation] Failed on ${meta.endpoint}`, meta);
  },
};
