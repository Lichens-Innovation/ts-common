export const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Yields to the main thread so the UI can process events and repaint.
 * Use during long-running synchronous work (e.g. report generation) to keep the app responsive.
 */
export const yieldToMainThread = (): Promise<void> => sleep(0);
