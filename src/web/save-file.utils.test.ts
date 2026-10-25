import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from './download.utils';
import {
  isSaveFilePickerSupported,
  requestSaveFileHandle,
  saveBlob,
  saveBlobWithPicker,
  writeBlobToFileHandle,
} from './save-file.utils';

vi.mock('./download.utils', () => ({ downloadBlob: vi.fn() }));

const createWritable = () => ({
  write: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  abort: vi.fn().mockResolvedValue(undefined),
});

const createHandle = (writable = createWritable(), name = 'picked.pdf') =>
  ({
    name,
    createWritable: vi.fn().mockResolvedValue(writable),
  }) as unknown as FileSystemFileHandle;

const stubPicker = (showSaveFilePicker: ReturnType<typeof vi.fn>) => {
  vi.stubGlobal('window', { showSaveFilePicker });
};

describe('Save file utilities', () => {
  const blob = new Blob(['content'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.mocked(downloadBlob).mockClear();
  });

  describe('isSaveFilePickerSupported', () => {
    it('returns true when showSaveFilePicker exists', () => {
      // arrange
      stubPicker(vi.fn());

      // act & assert
      expect(isSaveFilePickerSupported()).toBe(true);
    });

    it('returns false when showSaveFilePicker is missing', () => {
      // arrange
      vi.stubGlobal('window', {});

      // act & assert
      expect(isSaveFilePickerSupported()).toBe(false);
    });

    it('returns false when window is undefined', () => {
      // arrange
      vi.stubGlobal('window', undefined);

      // act & assert
      expect(isSaveFilePickerSupported()).toBe(false);
    });
  });

  describe('requestSaveFileHandle', () => {
    it('returns picked with the handle', async () => {
      // arrange
      const handle = createHandle();
      const showSaveFilePicker = vi.fn().mockResolvedValue(handle);
      stubPicker(showSaveFilePicker);

      // act
      const result = await requestSaveFileHandle({ suggestedName: 'report.pdf' });

      // assert
      expect(result).toEqual({ status: 'picked', handle });
    });

    it('derives default types from the file extension', async () => {
      // arrange
      const showSaveFilePicker = vi.fn().mockResolvedValue(createHandle());
      stubPicker(showSaveFilePicker);

      // act
      await requestSaveFileHandle({ suggestedName: 'report.PDF' });

      // assert
      expect(showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'report.PDF',
        types: [{ accept: { 'application/pdf': ['.pdf'] } }],
      });
    });

    it.each(['report', 'report.unknownext', '.pdf', 'report.'])('omits types for "%s"', async (suggestedName) => {
      // arrange
      const showSaveFilePicker = vi.fn().mockResolvedValue(createHandle());
      stubPicker(showSaveFilePicker);

      // act
      await requestSaveFileHandle({ suggestedName });

      // assert
      expect(showSaveFilePicker).toHaveBeenCalledWith({ suggestedName, types: undefined });
    });

    it('uses provided types over defaults', async () => {
      // arrange
      const showSaveFilePicker = vi.fn().mockResolvedValue(createHandle());
      stubPicker(showSaveFilePicker);
      const types = [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }];

      // act
      await requestSaveFileHandle({ suggestedName: 'report.pdf', types });

      // assert
      expect(showSaveFilePicker).toHaveBeenCalledWith({ suggestedName: 'report.pdf', types });
    });

    it('returns cancelled on AbortError', async () => {
      // arrange
      stubPicker(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')));

      // act
      const result = await requestSaveFileHandle({ suggestedName: 'report.pdf' });

      // assert
      expect(result).toEqual({ status: 'cancelled' });
    });

    it('returns unsupported and warns on other errors', async () => {
      // arrange
      stubPicker(vi.fn().mockRejectedValue(new DOMException('no activation', 'SecurityError')));

      // act
      const result = await requestSaveFileHandle({ suggestedName: 'report.pdf' });

      // assert
      expect(result).toEqual({ status: 'unsupported' });
      expect(console.warn).toHaveBeenCalled();
    });

    it('returns unsupported when the API is missing', async () => {
      // arrange
      vi.stubGlobal('window', {});

      // act
      const result = await requestSaveFileHandle({ suggestedName: 'report.pdf' });

      // assert
      expect(result).toEqual({ status: 'unsupported' });
    });
  });

  describe('writeBlobToFileHandle', () => {
    it('writes then closes the writable', async () => {
      // arrange
      const writable = createWritable();
      const handle = createHandle(writable);

      // act
      await writeBlobToFileHandle({ handle, blob });

      // assert
      expect(writable.write).toHaveBeenCalledWith(blob);
      expect(writable.close).toHaveBeenCalled();
      expect(writable.abort).not.toHaveBeenCalled();
    });

    it('aborts the writable and rethrows on write error', async () => {
      // arrange
      const writable = createWritable();
      const error = new Error('disk full');
      writable.write.mockRejectedValue(error);
      const handle = createHandle(writable);

      // act & assert
      await expect(writeBlobToFileHandle({ handle, blob })).rejects.toBe(error);
      expect(writable.abort).toHaveBeenCalled();
      expect(writable.close).not.toHaveBeenCalled();
    });

    it('rethrows when createWritable fails', async () => {
      // arrange
      const error = new Error('denied');
      const handle = { name: 'x.pdf', createWritable: vi.fn().mockRejectedValue(error) } as unknown as FileSystemFileHandle;

      // act & assert
      await expect(writeBlobToFileHandle({ handle, blob })).rejects.toBe(error);
    });
  });

  describe('saveBlob', () => {
    it('writes to the handle and returns picker method with handle name', async () => {
      // arrange
      const handle = createHandle(createWritable(), 'chosen.pdf');

      // act
      const result = await saveBlob({ blob, fileName: 'report.pdf', handle });

      // assert
      expect(result).toEqual({ method: 'picker', fileName: 'chosen.pdf' });
      expect(downloadBlob).not.toHaveBeenCalled();
    });

    it('falls back to download when writing fails', async () => {
      // arrange
      const writable = createWritable();
      writable.write.mockRejectedValue(new Error('disk full'));
      const handle = createHandle(writable);

      // act
      const result = await saveBlob({ blob, fileName: 'report.pdf', handle });

      // assert
      expect(result).toEqual({ method: 'download', fileName: 'report.pdf' });
      expect(downloadBlob).toHaveBeenCalledWith({ blob, fileName: 'report.pdf' });
    });

    it.each([undefined, null])('downloads when handle is %s', async (handle) => {
      // act
      const result = await saveBlob({ blob, fileName: 'report.pdf', handle });

      // assert
      expect(result).toEqual({ method: 'download', fileName: 'report.pdf' });
      expect(downloadBlob).toHaveBeenCalledWith({ blob, fileName: 'report.pdf' });
    });
  });

  describe('saveBlobWithPicker', () => {
    it('returns null when the user cancels', async () => {
      // arrange
      stubPicker(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')));

      // act
      const result = await saveBlobWithPicker({ blob, fileName: 'report.pdf' });

      // assert
      expect(result).toBeNull();
      expect(downloadBlob).not.toHaveBeenCalled();
    });

    it('writes to the picked file', async () => {
      // arrange
      stubPicker(vi.fn().mockResolvedValue(createHandle(createWritable(), 'chosen.pdf')));

      // act
      const result = await saveBlobWithPicker({ blob, fileName: 'report.pdf' });

      // assert
      expect(result).toEqual({ method: 'picker', fileName: 'chosen.pdf' });
    });

    it('downloads when the picker is unsupported', async () => {
      // arrange
      vi.stubGlobal('window', {});

      // act
      const result = await saveBlobWithPicker({ blob, fileName: 'report.pdf' });

      // assert
      expect(result).toEqual({ method: 'download', fileName: 'report.pdf' });
      expect(downloadBlob).toHaveBeenCalledWith({ blob, fileName: 'report.pdf' });
    });
  });
});
