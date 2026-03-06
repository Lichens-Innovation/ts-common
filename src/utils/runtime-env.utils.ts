import { isNullish } from "./types.utils";

/**
 * Returns true when running in Node.js.
 * Checks for process.versions.node to avoid false positives in Web Workers.
 */
export const isRuntimeEnvNodeJs = (): boolean => {
  if (typeof window !== "undefined") return false;
  if (typeof process === "undefined") return false;
  if (isNullish(process?.versions?.node)) return false;

  return true;
};
