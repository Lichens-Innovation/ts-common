import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blobToDataUri, fetchUrlAsDataUri } from './fetch.utils';

interface FileReaderOutcome {
  result?: string | ArrayBuffer;
  error?: DOMException;
}

const stubFileReader = ({ result, error }: FileReaderOutcome): ReturnType<typeof vi.fn> => {
  const readAsDataURLSpy = vi.fn();

  class FakeFileReader {
    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;
    onloadend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    readAsDataURL = (blob: Blob): void => {
      readAsDataURLSpy(blob);
      setTimeout(() => {
        this.result = result ?? null;
        this.error = error ?? null;
        if (error) {
          this.onerror?.();
        } else {
          this.onloadend?.();
        }
      }, 0);
    };
  }

  vi.stubGlobal('FileReader', FakeFileReader);
  return readAsDataURLSpy;
};

describe('Fetch utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('blobToDataUri', () => {
    it('resolves with data URI when FileReader succeeds', async () => {
      // arrange
      const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
      const blob = new Blob(['fake'], { type: 'image/png' });
      const readAsDataURL = stubFileReader({ result: dataUri });

      // act
      const result = await blobToDataUri(blob);

      // assert
      expect(result).toBe(dataUri);
      expect(readAsDataURL).toHaveBeenCalledWith(blob);
    });

    it('resolves with null when FileReader result is not a string', async () => {
      // arrange
      const blob = new Blob(['fake'], { type: 'image/png' });
      stubFileReader({ result: new ArrayBuffer(0) });

      // act
      const result = await blobToDataUri(blob);

      // assert
      expect(result).toBeNull();
    });

    it('rejects when FileReader fails', async () => {
      // arrange
      const blob = new Blob(['fake']);
      const err = new DOMException('read failed');
      stubFileReader({ error: err });

      // act
      const promise = blobToDataUri(blob);

      // assert
      await expect(promise).rejects.toBe(err);
    });
  });

  describe('fetchUrlAsDataUri', () => {
    const mockUrl = 'https://example.com/image.png';

    beforeEach(() => {
      stubFileReader({ result: 'data:image/png;base64,abc' });
    });

    it('returns data URI when fetch succeeds and response is ok', async () => {
      // arrange
      const blob = new Blob(['x'], { type: 'image/png' });
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve({
            ok: true,
            blob: () => Promise.resolve(blob),
          } as Response)
        )
      );

      // act
      const result = await fetchUrlAsDataUri(mockUrl);
      // assert
      expect(result).toBe('data:image/png;base64,abc');
    });

    it('returns null when response is not ok', async () => {
      // arrange
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 404,
          } as Response)
        )
      );

      // act
      const result = await fetchUrlAsDataUri(mockUrl);
      // assert
      expect(result).toBeNull();
      warn.mockRestore();
    });

    it('returns null when fetch throws', async () => {
      // arrange
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new Error('Network error')))
      );

      // act
      const result = await fetchUrlAsDataUri(mockUrl);
      // assert
      expect(result).toBeNull();
      error.mockRestore();
    });
  });
});
