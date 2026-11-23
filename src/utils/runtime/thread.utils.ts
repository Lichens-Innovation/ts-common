export const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

/** habit-hooks-disable non-essential-comment
 * Lets the UI process events and repaint.
 * Use during long-running synchronous work (e.g. report generation) to keep the app responsive.
 */
export const yieldToMainThread = (): Promise<void> => sleep(0);
