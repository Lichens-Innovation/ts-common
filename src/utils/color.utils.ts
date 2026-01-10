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

/**
 * Normalized RGB color with values between 0 and 1.
 * Useful for graphics libraries like Three.js.
 */
export interface NormalizedRgb {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert a hex color string to normalized RGB values (0-1 range).
 * @param hex - Hex color string (with or without # prefix)
 * @returns Normalized RGB object with values between 0 and 1
 */
export const hexToNormalizedRgb = (hex: string): NormalizedRgb => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
};

/**
 * Determine if a color is light or dark based on relative luminance.
 * Useful for choosing contrasting text colors.
 * @param hex - Hex color string
 * @returns True if the color is considered light (luminance > 0.5)
 */
export const isLightColor = (hex: string): boolean => {
  const rgb = hexToNormalizedRgb(hex);
  // Calculate relative luminance using standard coefficients
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return luminance > 0.5;
};
