import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clipboardImageToDataUrl,
  clipboardImageToFile,
  getImageFileFromClipboard,
  readFileAsArrayBuffer,
  readFileAsBase64,
  readFileAsDataUrl,
  readFileAsText,
} from './file-reader.utils';

interface FakeReaderOutcome {
  behavior: 'load' | 'error';
  result?: unknown;
}

interface FakeLoadEvent {
  target: unknown;
}

const stubFileReader = ({ behavior, result = null }: FakeReaderOutcome): void => {
  class FakeFileReader {
    result: unknown = null;
    onload: ((ev: FakeLoadEvent) => void) | null = null;
    onerror: (() => void) | null = null;

    private settle = (): void => {
      setTimeout(() => {
        if (behavior === 'error') {
          this.onerror?.();
          return;
        }
        this.result = result;
        this.onload?.({ target: this });
      }, 0);
    };

    readAsDataURL = this.settle;
    readAsText = this.settle;
    readAsArrayBuffer = this.settle;
  }

  vi.stubGlobal('FileReader', FakeFileReader);
};

const stubFileReaderWithDataUri = (dataUri: string): void => stubFileReader({ behavior: 'load', result: dataUri });

interface FakeClipboardItem {
  type: string;
  file: File | null;
}

const toItemList = (items: FakeClipboardItem[]): DataTransferItemList => {
  const list = items.map(({ type, file }) => ({ type, getAsFile: () => file }));
  return list as unknown as DataTransferItemList;
};

const IMAGE_FILE = { name: 'shot.png', type: 'image/png' } as File;
const TEXT_FILE = { name: 'note.txt', type: 'text/plain' } as File;
const DATA_URI = 'data:image/png;base64,YWJj';

describe('readFileAsBase64', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { type: 'image/png', expectedMimeType: 'image/png' },
    { type: '', expectedMimeType: 'application/octet-stream' },
    { type: '   ', expectedMimeType: 'application/octet-stream' },
  ])('uses "$expectedMimeType" for file type "$type"', async ({ type, expectedMimeType }) => {
    // arrange
    stubFileReaderWithDataUri('data:application/octet-stream;base64,YWJj');
    const file = { type } as File;

    // act
    const result = await readFileAsBase64(file);

    // assert
    expect(result).toEqual({ base64: 'YWJj', mimeType: expectedMimeType });
  });
});

describe('readers resolving with the loaded result', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const buffer = new ArrayBuffer(4);

  it.each([
    { name: 'readFileAsDataUrl', read: readFileAsDataUrl, result: DATA_URI },
    { name: 'readFileAsText', read: readFileAsText, result: 'hello' },
    { name: 'readFileAsArrayBuffer', read: readFileAsArrayBuffer, result: buffer },
  ])('$name resolves with the reader result', async ({ read, result }) => {
    // arrange
    stubFileReader({ behavior: 'load', result });

    // act
    const output = await read(TEXT_FILE);

    // assert
    expect(output).toBe(result);
  });
});

describe('readers rejecting', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { name: 'readFileAsDataUrl', read: readFileAsDataUrl, result: 42, message: 'Failed to read file' },
    { name: 'readFileAsText', read: readFileAsText, result: 42, message: 'Failed to read file as text' },
    {
      name: 'readFileAsArrayBuffer',
      read: readFileAsArrayBuffer,
      result: 'text',
      message: 'Failed to read file as ArrayBuffer',
    },
  ])('$name rejects when the result has the wrong type', async ({ read, result, message }) => {
    // arrange
    stubFileReader({ behavior: 'load', result });

    // act
    const promise = read(TEXT_FILE);

    // assert
    await expect(promise).rejects.toThrow(message);
  });

  it.each([
    { name: 'readFileAsDataUrl', read: readFileAsDataUrl },
    { name: 'readFileAsBase64', read: readFileAsBase64 },
    { name: 'readFileAsText', read: readFileAsText },
    { name: 'readFileAsArrayBuffer', read: readFileAsArrayBuffer },
  ])('$name rejects when the reader errors', async ({ read }) => {
    // arrange
    stubFileReader({ behavior: 'error' });

    // act
    const promise = read(TEXT_FILE);

    // assert
    await expect(promise).rejects.toThrow('Failed to read file');
  });
});

describe('getImageFileFromClipboard', () => {
  it.each([
    { label: 'no items', items: [], expected: null },
    { label: 'only text items', items: [{ type: 'text/plain', file: TEXT_FILE }], expected: null },
    { label: 'an image item without a file', items: [{ type: 'image/png', file: null }], expected: null },
    {
      label: 'a text item before an image',
      items: [
        { type: 'text/plain', file: TEXT_FILE },
        { type: 'image/png', file: IMAGE_FILE },
      ],
      expected: IMAGE_FILE,
    },
    {
      label: 'an empty image item before a real one',
      items: [
        { type: 'image/jpeg', file: null },
        { type: 'image/png', file: IMAGE_FILE },
      ],
      expected: IMAGE_FILE,
    },
  ])('returns $expected for $label', ({ items, expected }) => {
    // act
    const result = getImageFileFromClipboard(toItemList(items));

    // assert
    expect(result).toBe(expected);
  });

  it('returns null when items are missing', () => {
    // arrange
    const items = undefined as unknown as DataTransferItemList;

    // act
    const result = getImageFileFromClipboard(items);

    // assert
    expect(result).toBeNull();
  });
});

describe('clipboardImageToFile', () => {
  it.each([
    { label: 'an image', items: [{ type: 'image/png', file: IMAGE_FILE }], expectedCalls: [[IMAGE_FILE]] },
    { label: 'no image', items: [{ type: 'text/plain', file: TEXT_FILE }], expectedCalls: [] },
  ])('calls onFile accordingly for $label', ({ items, expectedCalls }) => {
    // arrange
    const onFile = vi.fn();

    // act
    clipboardImageToFile({ items: toItemList(items), onFile });

    // assert
    expect(onFile.mock.calls).toEqual(expectedCalls);
  });
});

describe('clipboardImageToDataUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { outcome: { behavior: 'load', result: DATA_URI }, expectedLoads: [[DATA_URI]], expectedErrors: [] },
    { outcome: { behavior: 'error' }, expectedLoads: [], expectedErrors: [[new Error('Failed to read file')]] },
  ] as const)(
    'reports a $outcome.behavior to the matching callback',
    async ({ outcome, expectedLoads, expectedErrors }) => {
      // arrange
      stubFileReader(outcome);
      const onLoad = vi.fn();
      const onError = vi.fn();

      // act
      clipboardImageToDataUrl({ items: toItemList([{ type: 'image/png', file: IMAGE_FILE }]), onLoad, onError });

      // assert
      await vi.waitFor(() => expect(onLoad.mock.calls.length + onError.mock.calls.length).toBe(1));
      expect(onLoad.mock.calls).toEqual(expectedLoads);
      expect(onError.mock.calls).toEqual(expectedErrors);
    }
  );

  it('does not read anything without an image', () => {
    // arrange
    const readAsDataURL = vi.fn();
    vi.stubGlobal(
      'FileReader',
      vi.fn(() => ({ readAsDataURL }))
    );
    const onLoad = vi.fn();

    // act
    clipboardImageToDataUrl({ items: toItemList([]), onLoad });

    // assert
    expect(readAsDataURL).not.toHaveBeenCalled();
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('swallows the read error when no onError is given', async () => {
    // arrange
    stubFileReader({ behavior: 'error' });
    const onLoad = vi.fn();
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);

    // act
    clipboardImageToDataUrl({ items: toItemList([{ type: 'image/png', file: IMAGE_FILE }]), onLoad });
    await new Promise((resolve) => setTimeout(resolve, 10));
    process.off('unhandledRejection', unhandled);

    // assert
    expect(onLoad).not.toHaveBeenCalled();
    expect(unhandled).not.toHaveBeenCalled();
  });
});
