import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blobToDataUri, fetchUrlAsDataUri } from './fetch.utils';

describe('Fetch utilities', () => {
  describe('blobToDataUri', () => {
    it('resolves with data URI when FileReader succeeds', async () => {
      // arrange
      const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
      const blob = new Blob(['fake'], { type: 'image/png' });

      const readAsDataURL = vi.fn(function (
        this: { result: string | null; onloadend: ((ev: ProgressEvent<FileReader>) => void) | null }
      ) {
        setTimeout(() => {
          this.result = dataUri;
          this.onloadend?.({} as ProgressEvent<FileReader>);
        }, 0);
      });

      vi.stubGlobal(
        'FileReader',
        class {
          result: string | null = null;
          error: DOMException | null = null;
          onloadend: ((ev: ProgressEvent<FileReader>) => void) | null = null;
          onerror: (() => void) | null = null;
          readAsDataURL = readAsDataURL;
        }
      );

      // act
      const result = await blobToDataUri(blob);
      // assert
      expect(result).toBe(dataUri);
      expect(readAsDataURL).toHaveBeenCalledWith(blob);
    });

    it('rejects when FileReader fails', async () => {
      // arrange
      const blob = new Blob(['fake']);
      const err = new DOMException('read failed');

      vi.stubGlobal(
        'FileReader',
        class {
          result: string | ArrayBuffer | null = null;
          error: DOMException | null = null;
          onloadend: ((ev: ProgressEvent<FileReader>) => void) | null = null;
          onerror: (() => void) | null = null;
          readAsDataURL = vi.fn(function (this: { error: DOMException | null; onerror: (() => void) | null }) {
            this.error = err;
            setTimeout(() => {
              this.onerror?.({} as ProgressEvent<FileReader>);
            }, 0);
          });
        }
      );

      // act
      const promise = blobToDataUri(blob);
      // assert
      await expect(promise).rejects.toBe(err);
    });
  });

  describe('fetchUrlAsDataUri', () => {
    const mockUrl = 'https://example.com/image.png';

    beforeEach(() => {
      vi.stubGlobal(
        'FileReader',
        class {
          readAsDataURL = vi.fn(function (this: FileReader) {
            setTimeout(() => {
              Object.defineProperty(this, 'result', { value: 'data:image/png;base64,abc' });
              this.onloadend?.({} as ProgressEvent<FileReader>);
            }, 0);
          });
          result = null;
          error = null;
          onloadend = null;
          onerror = null;
        }
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
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
      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

      // act
      const result = await fetchUrlAsDataUri(mockUrl);
      // assert
      expect(result).toBeNull();
      error.mockRestore();
    });
  });
});
