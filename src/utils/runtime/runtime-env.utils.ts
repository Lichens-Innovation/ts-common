import { isNullish } from './types.utils';

/** habit-hooks-disable non-essential-comment
 * Checks `process.versions.node` to avoid false positives in Web Workers.
 */
export const isRuntimeEnvNodeJs = (): boolean => {
  if (typeof window !== 'undefined') return false;
  if (typeof process === 'undefined') return false;
  if (isNullish(process?.versions?.node)) return false;

  return true;
};
