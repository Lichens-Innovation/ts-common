import pino from "pino";

/**
 * True when running in Node.js (no window).
 * Used to choose stdout vs browser console.
 */
const isNode = typeof window === "undefined";

const LEVEL_LABELS: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

const LEVEL_COLORS: Record<string, string> = {
  trace: "color: #94a3b8",
  debug: "color: #22d3ee",
  info: "color: #4ade80",
  warn: "color: #fbbf24",
  error: "color: #f87171",
  fatal: "color: #dc2626; font-weight: bold",
};

const MESSAGE_KEY = "msg";

type LogObject = Record<string, unknown> & { level?: number; time?: string; [MESSAGE_KEY]?: string };

const getLevelLabel = (levelNum: number): string => LEVEL_LABELS[levelNum] ?? "info";

const getLevelColor = (label: string): string => LEVEL_COLORS[label] ?? LEVEL_COLORS.info;

const getLogTimestamp = ({ time }: LogObject): string => (typeof time === "string" ? time : new Date().toISOString());

type ConsoleMethod = "log" | "warn" | "error";
const getConsoleMethod = (levelNum: number): ConsoleMethod => {
  if (levelNum >= 50) return "error";
  if (levelNum >= 40) return "warn";
  return "log";
};

const getRestPayload = (obj: LogObject): Record<string, unknown> =>
  Object.keys(obj)
    .filter((k) => k !== "level" && k !== "time" && k !== MESSAGE_KEY)
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});

type BuildMainArgsParams = {
  timestamp: string;
  label: string;
  color: string;
  msg: unknown;
  extraArgs: unknown[];
  rest: Record<string, unknown>;
};

const buildMainArgs = ({ timestamp, label, color, msg, extraArgs, rest }: BuildMainArgsParams): unknown[] => {
  const prefix = `[${timestamp}]`;
  const levelPart = ` ${label.toUpperCase()} `;
  const hasRest = Object.keys(rest).length > 0;
  const mainArgs: unknown[] = [`${prefix}%c${levelPart}%c`, color, "color: inherit"];

  if (msg != null) mainArgs.push(msg);
  if (extraArgs.length > 0) mainArgs.push(...extraArgs);
  if (hasRest) mainArgs.push(rest);

  return mainArgs;
};

const baseOptions: pino.LoggerOptions = {
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: MESSAGE_KEY,
};

const browserOptions: pino.LoggerOptions = {
  ...baseOptions,
  browser: {
    write: (logObj: object, ...args: unknown[]) => {
      const obj = logObj as LogObject;
      const levelNum = obj.level ?? 30;
      const label = getLevelLabel(levelNum);
      const color = getLevelColor(label);
      const timestamp = getLogTimestamp(obj);
      const msg = obj[MESSAGE_KEY];
      const rest = getRestPayload(obj);
      const consoleMethod = getConsoleMethod(levelNum);
      const mainArgs = buildMainArgs({
        timestamp,
        label,
        color,
        msg,
        extraArgs: args,
        rest,
      });
      (console[consoleMethod] as (...a: unknown[]) => void)(...mainArgs);
    },
  },
};

const createPinoLogger = (): pino.Logger => {
  if (isNode) {
    const transport = pino.transport({ target: "pino-pretty", options: { colorize: true } });
    return pino(baseOptions, transport);
  }

  return pino(browserOptions);
};

const pinoLogger = createPinoLogger();

export type Level = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export const setLoggerMinimumLevel = (level: Level) => {
  pinoLogger.level = level;
};

const consoleMethodToPinoMethod = (level: Level) => (message: string, payload?: Record<string, unknown>) => {
  if (payload == null) {
    pinoLogger[level](message);
  } else {
    pinoLogger[level](payload, message);
  }
};

export const logger = {
  trace: consoleMethodToPinoMethod("trace"),
  debug: consoleMethodToPinoMethod("debug"),
  info: consoleMethodToPinoMethod("info"),
  warn: consoleMethodToPinoMethod("warn"),
  error: consoleMethodToPinoMethod("error"),
  fatal: consoleMethodToPinoMethod("fatal"),
  log: consoleMethodToPinoMethod("info"),
};
