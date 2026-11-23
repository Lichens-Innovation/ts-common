/* eslint-disable no-console -- this module bridges pino to the browser/Node console: console output is its purpose */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import pino from 'pino';
import { isRuntimeEnvNodeJs } from '../utils/runtime/runtime-env.utils';
import { isNullish } from '../utils/runtime/types.utils';

const LEVEL_LABELS: Record<number, string> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

const LEVEL_COLORS: Record<string, string> = {
  trace: 'color: #94a3b8',
  debug: 'color: #22d3ee',
  info: 'color: #4ade80',
  warn: 'color: #fbbf24',
  error: 'color: #f87171',
  fatal: 'color: #dc2626; font-weight: bold',
};

const MESSAGE_KEY = 'msg';

interface LogObject extends Record<string, unknown> {
  level?: number;
  time?: string;
  [MESSAGE_KEY]?: string;
}

const getLevelLabel = (levelNum: number): string => LEVEL_LABELS[levelNum] ?? 'info';

const getLevelColor = (label: string): string => LEVEL_COLORS[label] ?? LEVEL_COLORS.info;

const getLogTimestamp = ({ time }: LogObject): string => (typeof time === 'string' ? time : new Date().toISOString());

type ConsoleMethod = 'log' | 'warn' | 'error';
const getConsoleMethod = (levelNum: number): ConsoleMethod => {
  if (levelNum >= 50) return 'error';
  if (levelNum >= 40) return 'warn';
  return 'log';
};

const getRestPayload = (obj: LogObject): Record<string, unknown> =>
  Object.keys(obj)
    .filter((k) => k !== 'level' && k !== 'time' && k !== MESSAGE_KEY)
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});

interface BuildMainArgsParams {
  timestamp: string;
  label: string;
  color: string;
  msg: unknown;
  extraArgs: unknown[];
  rest: Record<string, unknown>;
}

const buildMainArgs = ({ timestamp, label, color, msg, extraArgs, rest }: BuildMainArgsParams): unknown[] => {
  const prefix = `[${timestamp}]`;
  const levelPart = ` ${label.toUpperCase()} `;
  const hasRest = Object.keys(rest).length > 0;
  const mainArgs: unknown[] = [`${prefix}%c${levelPart}%c`, color, 'color: inherit'];

  if (!isNullish(msg)) mainArgs.push(msg);
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

const createPrettyTransport = (): pino.DestinationStream => {
  try {
    return pino.transport({ target: 'pino-pretty', options: { colorize: true } });
  } catch (e: unknown) {
    console.warn('pino-pretty not installed, using default pino output', e);
    return pino.destination(1);
  }
};

const createNodePinoLogger = (): pino.Logger => pino(baseOptions, createPrettyTransport());

const createPinoLogger = (): pino.Logger => {
  if (isRuntimeEnvNodeJs()) {
    return createNodePinoLogger();
  }

  return pino(browserOptions);
};

export interface CreateLoggerOptions {
  logFile?: string;
  console?: boolean;
}

const createFileDestination = (logFile: string): pino.DestinationStream => {
  mkdirSync(path.dirname(logFile), { recursive: true });
  return pino.destination({ dest: logFile, append: true, mkdir: true });
};

const createNodePinoWithOptions = ({ logFile, console: useConsole = true }: CreateLoggerOptions): pino.Logger => {
  const streams: pino.StreamEntry[] = [];

  if (!isNullish(logFile)) {
    streams.push({ stream: createFileDestination(logFile) });
  }

  if (useConsole) {
    streams.push({ stream: createPrettyTransport() });
  }

  const [firstStream, ...otherStreams] = streams;
  if (isNullish(firstStream)) {
    return pino(baseOptions);
  }

  if (otherStreams.length === 0) {
    return pino(baseOptions, firstStream.stream);
  }

  return pino(baseOptions, pino.multistream(streams));
};

export interface Logger {
  trace: (message: string, payload?: Record<string, unknown>) => void;
  debug: (message: string, payload?: Record<string, unknown>) => void;
  info: (message: string, payload?: Record<string, unknown>) => void;
  warn: (message: string, payload?: Record<string, unknown>) => void;
  error: (message: string, payload?: Record<string, unknown>) => void;
  fatal: (message: string, payload?: Record<string, unknown>) => void;
  log: (message: string, payload?: Record<string, unknown>) => void;
}

type LogMethod = Logger['info'];

const toPinoMethod =
  (pinoInstance: pino.Logger, level: Level): LogMethod =>
  (message, payload) => {
    if (isNullish(payload)) {
      pinoInstance[level](message);
    } else {
      pinoInstance[level](payload, message);
    }
  };

const buildLoggerApi = (pinoInstance: pino.Logger): Logger => ({
  trace: toPinoMethod(pinoInstance, 'trace'),
  debug: toPinoMethod(pinoInstance, 'debug'),
  info: toPinoMethod(pinoInstance, 'info'),
  warn: toPinoMethod(pinoInstance, 'warn'),
  error: toPinoMethod(pinoInstance, 'error'),
  fatal: toPinoMethod(pinoInstance, 'fatal'),
  log: toPinoMethod(pinoInstance, 'info'),
});

export const createLogger = (options?: CreateLoggerOptions): Logger => {
  if (!isRuntimeEnvNodeJs()) {
    return buildLoggerApi(pino(browserOptions));
  }

  const hasFile = !isNullish(options?.logFile);
  const useConsole = options?.console ?? true;

  if (!hasFile && useConsole) {
    return buildLoggerApi(createNodePinoLogger());
  }

  return buildLoggerApi(createNodePinoWithOptions({ logFile: options?.logFile, console: useConsole }));
};

const pinoLogger = createPinoLogger();

export type Level = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const setLoggerMinimumLevel = (level: Level) => {
  pinoLogger.level = level;
};

export const logger = buildLoggerApi(pinoLogger);
