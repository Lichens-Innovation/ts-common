export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface RgbaColor extends RgbColor {
  a: number;
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  if (r > 255 || g > 255 || b > 255) {
    throw new Error("Invalid color component");
  }

  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
};

export const hexToRgb = (hex: string): RgbColor => {
  const cleanHex = hex.replace("#", "");

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
};

export const rgbaToHex = (color: RgbaColor): string => {
  return "#" + rgbToHex(color.r, color.g, color.b);
};

export const getOpacityHexValue = (opacity: number): string => {
  if (opacity < 0 || opacity > 1) {
    throw new Error("Invalid opacity value");
  }

  return Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
};

export const rgbaToHexWithAlpha = (color: RgbaColor): string => {
  return rgbaToHex(color) + getOpacityHexValue(color.a);
};

export const rgbToString = (color: RgbColor): string => {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
};

export const rgbaToString = (color: RgbaColor): string => {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};

export const getLuminance = (r: number, g: number, b: number): number => {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export const getContrastTextColor = (hexColor: string): string => {
  const { r, g, b } = hexToRgb(hexColor);
  return getLuminance(r, g, b) > 0.5 ? "#000000" : "#ffffff";
};
