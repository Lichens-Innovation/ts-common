import { getMimeType } from '../mime';
import { downloadBlob } from './download.utils';
import type { SaveFilePickerAcceptType, WindowWithSaveFilePicker } from './file-system-access.types';

export type SaveFileHandleResult =
  | { status: 'picked'; handle: FileSystemFileHandle }
  | { status: 'cancelled' }
  | { status: 'unsupported' };

export interface SaveBlobResult {
  method: 'picker' | 'download';
  fileName: string;
}

export const isSaveFilePickerSupported = (): boolean =>
  typeof window !== 'undefined' && 'showSaveFilePicker' in window;

const getDefaultFileTypes = (fileName: string): SaveFilePickerAcceptType[] | undefined => {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === fileName.length - 1) return undefined;

  const extension = fileName.slice(dotIndex + 1).toLowerCase();
  try {
    return [{ accept: { [getMimeType(extension)]: [`.${extension}`] } }];
  } catch {
    return undefined;
  }
};

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

interface RequestSaveFileHandleArgs {
  suggestedName: string;
  types?: SaveFilePickerAcceptType[];
}

/**
 * Opens the native save file picker. Must be called while the user activation is still valid
 * (i.e. right at the start of a click handler, before any slow work).
 */
export const requestSaveFileHandle = async ({
  suggestedName,
  types = getDefaultFileTypes(suggestedName),
}: RequestSaveFileHandleArgs): Promise<SaveFileHandleResult> => {
  if (!isSaveFilePickerSupported()) return { status: 'unsupported' };

  try {
    const handle = await (window as unknown as WindowWithSaveFilePicker).showSaveFilePicker({ suggestedName, types });
    return { status: 'picked', handle };
  } catch (error: unknown) {
    if (isAbortError(error)) return { status: 'cancelled' };

    console.warn('[requestSaveFileHandle] Save file picker failed, falling back', error);
    return { status: 'unsupported' };
  }
};

interface WriteBlobToFileHandleArgs {
  handle: FileSystemFileHandle;
  blob: Blob;
}

export const writeBlobToFileHandle = async ({ handle, blob }: WriteBlobToFileHandleArgs): Promise<void> => {
  let writable: FileSystemWritableFileStream | undefined;

  try {
    writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (error: unknown) {
    await writable?.abort().catch(() => undefined);
    throw error;
  }
};

interface SaveBlobArgs {
  blob: Blob;
  fileName: string;
  handle?: FileSystemFileHandle | null;
}

export const saveBlob = async ({ blob, fileName, handle }: SaveBlobArgs): Promise<SaveBlobResult> => {
  if (handle) {
    try {
      await writeBlobToFileHandle({ handle, blob });
      return { method: 'picker', fileName: handle.name };
    } catch (error: unknown) {
      console.warn('[saveBlob] Writing to file handle failed, falling back to download', error);
    }
  }

  downloadBlob({ blob, fileName });
  return { method: 'download', fileName };
};

interface SaveBlobWithPickerArgs {
  blob: Blob;
  fileName: string;
  types?: SaveFilePickerAcceptType[];
}

/**
 * One-shot save: picker then write. Only suitable when the blob is already available
 * (user activation must still be valid). Returns null when the user cancels the picker.
 */
export const saveBlobWithPicker = async ({
  blob,
  fileName,
  types,
}: SaveBlobWithPickerArgs): Promise<SaveBlobResult | null> => {
  const result = await requestSaveFileHandle({ suggestedName: fileName, types });
  if (result.status === 'cancelled') return null;

  const handle = result.status === 'picked' ? result.handle : null;
  return saveBlob({ blob, fileName, handle });
};
