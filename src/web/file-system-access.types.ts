// Minimal File System Access API declarations (not yet in TS DOM lib).
// Kept local on purpose: no global augmentation leaking to consumers.

export interface SaveFilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

export interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: SaveFilePickerAcceptType[];
}

export type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
};
