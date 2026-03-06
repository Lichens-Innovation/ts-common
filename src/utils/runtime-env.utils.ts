import { isNullish } from "./types.utils";

/**
 * Returns true when running in Node.js.
 * Checks for process.versions.node to avoid false positives in Web Workers.
 */
export const isRuntimeEnvNodeJs = (): boolean =>
  typeof window === "undefined" &&
  !isNullish(process?.versions?.node);
