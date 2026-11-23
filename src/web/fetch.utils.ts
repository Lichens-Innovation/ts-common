import { getErrorMessage } from '../utils/runtime/errors.utils';

export const blobToDataUri = (blob: Blob): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const { result } = reader;
      resolve(typeof result === 'string' ? result : null);
    };

    reader.readAsDataURL(blob);
  });
};

/** habit-hooks-disable non-essential-comment
 * Never throws: network errors and non-2xx responses are logged and resolve to null.
 */
export const fetchUrlAsDataUri = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // eslint-disable-next-line no-console -- diagnostic for a swallowed failure: the caller only receives null
      console.warn(`[fetchUrlAsDataUri] Response not ok (${response.status}). url: "${url}"`);
      return null;
    }

    const blob = await response.blob();
    return blobToDataUri(blob);
  } catch (e: unknown) {
    const message = getErrorMessage(e);
    // eslint-disable-next-line no-console -- diagnostic for a swallowed failure: the caller only receives null
    console.error(`[fetchUrlAsDataUri] "${message}". url: "${url}"`, e);
    return null;
  }
};
