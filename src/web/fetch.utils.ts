import { getErrorMessage } from "../utils";

/**
 * Converts a Blob to a data URI string.
 */
export const blobToDataUri = (blob: Blob): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const { result } = reader;
      resolve(typeof result === "string" ? result : null);
    };

    reader.readAsDataURL(blob);
  });
};

/**
 * Fetches a resource by URL and returns its content as a data URI.
 * Content type is inferred from the response Content-Type header when possible.
 */
export const fetchUrlAsDataUri = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[fetchUrlAsDataUri] Response not ok (${response.status}). url: "${url}"`);
      return null;
    }

    const blob = await response.blob();
    return blobToDataUri(blob);
  } catch (e: unknown) {
    const message = getErrorMessage(e);
    console.error(`[fetchUrlAsDataUri] "${message}". url: "${url}"`, e);
    return null;
  }
};
