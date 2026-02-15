import mime from "mime";

export const getMimeType = (extension: string): string => {
  const mimeType = mime.getType(extension);
  if (!mimeType) {
    throw new Error(`[getMimeType] Mime type not found for extension: "${extension}"`);
  }

  return mimeType;
};
