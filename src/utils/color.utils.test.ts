import { describe, expect, it } from 'vitest';
import {
  getColorForPercentage,
  getContrastTextColor,
  getLuminance,
  getOpacityHexValue,
  hexToNormalizedRgb,
  hexToRgb,
  isLightColor,
  rgbaToHex,
  rgbaToHexWithAlpha,
  rgbaToString,
  rgbToHex,
  rgbToString,
} from './color.utils';

describe('Tests suite for color utilities', () => {
  describe('rgbToHex', () => {
    it.each`
      r      | g      | b      | expected
      ${0}   | ${0}   | ${0}   | ${'000000'}
      ${255} | ${255} | ${255} | ${'ffffff'}
      ${255} | ${0}   | ${0}   | ${'ff0000'}
      ${0}   | ${255} | ${0}   | ${'00ff00'}
      ${0}   | ${0}   | ${255} | ${'0000ff'}
      ${128} | ${128} | ${128} | ${'808080'}
      ${15}  | ${15}  | ${15}  | ${'0f0f0f'}
      ${1}   | ${2}   | ${3}   | ${'010203'}
    `('should return "$expected" for r=$r, g=$g, b=$b', ({ r, g, b, expected }) => {
      expect(rgbToHex(r, g, b)).toBe(expected);
    });

    it('should throw error when r > 255', () => {
      expect(() => rgbToHex(256, 0, 0)).toThrow('Invalid color component');
    });

    it('should throw error when g > 255', () => {
      expect(() => rgbToHex(0, 256, 0)).toThrow('Invalid color component');
    });

    it('should throw error when b > 255', () => {
      expect(() => rgbToHex(0, 0, 256)).toThrow('Invalid color component');
    });
  });

  describe('hexToRgb', () => {
    it.each`
      hex          | expected
      ${'000000'}  | ${{ r: 0, g: 0, b: 0 }}
      ${'#000000'} | ${{ r: 0, g: 0, b: 0 }}
      ${'ffffff'}  | ${{ r: 255, g: 255, b: 255 }}
      ${'#ffffff'} | ${{ r: 255, g: 255, b: 255 }}
      ${'ff0000'}  | ${{ r: 255, g: 0, b: 0 }}
      ${'#ff0000'} | ${{ r: 255, g: 0, b: 0 }}
      ${'00ff00'}  | ${{ r: 0, g: 255, b: 0 }}
      ${'0000ff'}  | ${{ r: 0, g: 0, b: 255 }}
      ${'808080'}  | ${{ r: 128, g: 128, b: 128 }}
      ${'0f0f0f'}  | ${{ r: 15, g: 15, b: 15 }}
    `('should return $expected for hex="$hex"', ({ hex, expected }) => {
      expect(hexToRgb(hex)).toEqual(expected);
    });
  });

  describe('rgbaToHex', () => {
    it.each`
      color                                    | expected
      ${{ r: 0, g: 0, b: 0, a: 1 }}            | ${'#000000'}
      ${{ r: 255, g: 255, b: 255, a: 1 }}      | ${'#ffffff'}
      ${{ r: 255, g: 0, b: 0, a: 0.5 }}        | ${'#ff0000'}
      ${{ r: 0, g: 255, b: 0, a: 0 }}          | ${'#00ff00'}
      ${{ r: 128, g: 64, b: 32, a: 0.75 }}     | ${'#804020'}
    `('should return "$expected" for color=$color', ({ color, expected }) => {
      expect(rgbaToHex(color)).toBe(expected);
    });
  });

  describe('getOpacityHexValue', () => {
    it.each`
      opacity | expected
      ${0}    | ${'00'}
      ${1}    | ${'ff'}
      ${0.5}  | ${'80'}
      ${0.25} | ${'40'}
      ${0.75} | ${'bf'}
    `('should return "$expected" for opacity=$opacity', ({ opacity, expected }) => {
      expect(getOpacityHexValue(opacity)).toBe(expected);
    });

    it('should throw error when opacity < 0', () => {
      expect(() => getOpacityHexValue(-0.1)).toThrow('Invalid opacity value');
    });

    it('should throw error when opacity > 1', () => {
      expect(() => getOpacityHexValue(1.1)).toThrow('Invalid opacity value');
    });
  });

  describe('rgbaToHexWithAlpha', () => {
    it.each`
      color                                    | expected
      ${{ r: 0, g: 0, b: 0, a: 1 }}            | ${'#000000ff'}
      ${{ r: 255, g: 255, b: 255, a: 0 }}      | ${'#ffffff00'}
      ${{ r: 255, g: 0, b: 0, a: 0.5 }}        | ${'#ff000080'}
      ${{ r: 0, g: 255, b: 0, a: 0.25 }}       | ${'#00ff0040'}
      ${{ r: 128, g: 64, b: 32, a: 0.75 }}     | ${'#804020bf'}
    `('should return "$expected" for color=$color', ({ color, expected }) => {
      expect(rgbaToHexWithAlpha(color)).toBe(expected);
    });
  });

  describe('rgbToString', () => {
    it.each`
      color                                    | expected
      ${{ r: 0, g: 0, b: 0, a: 1 }}            | ${'rgb(0, 0, 0)'}
      ${{ r: 255, g: 255, b: 255, a: 1 }}      | ${'rgb(255, 255, 255)'}
      ${{ r: 255, g: 0, b: 0, a: 0.5 }}        | ${'rgb(255, 0, 0)'}
      ${{ r: 128, g: 64, b: 32, a: 0.75 }}     | ${'rgb(128, 64, 32)'}
    `('should return "$expected" for color=$color', ({ color, expected }) => {
      expect(rgbToString(color)).toBe(expected);
    });
  });

  describe('rgbaToString', () => {
    it.each`
      color                                    | expected
      ${{ r: 0, g: 0, b: 0, a: 1 }}            | ${'rgba(0, 0, 0, 1)'}
      ${{ r: 255, g: 255, b: 255, a: 0 }}      | ${'rgba(255, 255, 255, 0)'}
      ${{ r: 255, g: 0, b: 0, a: 0.5 }}        | ${'rgba(255, 0, 0, 0.5)'}
      ${{ r: 128, g: 64, b: 32, a: 0.75 }}     | ${'rgba(128, 64, 32, 0.75)'}
    `('should return "$expected" for color=$color', ({ color, expected }) => {
      expect(rgbaToString(color)).toBe(expected);
    });
  });

  describe('getLuminance', () => {
    it.each`
      r      | g      | b      | expected
      ${0}   | ${0}   | ${0}   | ${0}
      ${255} | ${255} | ${255} | ${1}
      ${255} | ${0}   | ${0}   | ${0.299}
      ${0}   | ${255} | ${0}   | ${0.587}
      ${0}   | ${0}   | ${255} | ${0.114}
    `('should return $expected for r=$r, g=$g, b=$b', ({ r, g, b, expected }) => {
      expect(getLuminance(r, g, b)).toBeCloseTo(expected, 5);
    });
  });

  describe('getContrastTextColor', () => {
    it.each`
      hexColor     | expected
      ${'#ffffff'} | ${'#000000'}
      ${'#000000'} | ${'#ffffff'}
      ${'#ffff00'} | ${'#000000'}
      ${'#0000ff'} | ${'#ffffff'}
      ${'#808080'} | ${'#000000'}
      ${'#333333'} | ${'#ffffff'}
    `('should return "$expected" for hexColor="$hexColor"', ({ hexColor, expected }) => {
      expect(getContrastTextColor(hexColor)).toBe(expected);
    });
  });

  describe('hexToNormalizedRgb', () => {
    it.each`
      hex          | expected
      ${'#000000'} | ${{ r: 0, g: 0, b: 0 }}
      ${'000000'}  | ${{ r: 0, g: 0, b: 0 }}
      ${'#ffffff'} | ${{ r: 1, g: 1, b: 1 }}
      ${'ffffff'}  | ${{ r: 1, g: 1, b: 1 }}
      ${'#ff0000'} | ${{ r: 1, g: 0, b: 0 }}
      ${'#00ff00'} | ${{ r: 0, g: 1, b: 0 }}
      ${'#0000ff'} | ${{ r: 0, g: 0, b: 1 }}
      ${'#808080'} | ${{ r: 128 / 255, g: 128 / 255, b: 128 / 255 }}
    `('should return normalized RGB for hex="$hex"', ({ hex, expected }) => {
      const result = hexToNormalizedRgb(hex);
      expect(result.r).toBeCloseTo(expected.r, 5);
      expect(result.g).toBeCloseTo(expected.g, 5);
      expect(result.b).toBeCloseTo(expected.b, 5);
    });

    it('should return black for invalid hex', () => {
      expect(hexToNormalizedRgb('invalid')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToNormalizedRgb('')).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('isLightColor', () => {
    it.each`
      hex          | expected
      ${'#ffffff'} | ${true}
      ${'#000000'} | ${false}
      ${'#ffff00'} | ${true}
      ${'#0000ff'} | ${false}
      ${'#ff0000'} | ${false}
      ${'#00ff00'} | ${true}
      ${'#808080'} | ${true}
      ${'#777777'} | ${false}
      ${'#cccccc'} | ${true}
    `('should return $expected for hex="$hex"', ({ hex, expected }) => {
      expect(isLightColor(hex)).toBe(expected);
    });
  });

  describe('getColorForPercentage', () => {
    it('should return red for 0%', () => {
      expect(getColorForPercentage(0)).toBe('rgb(255,0,0)');
    });

    it('should return yellow for 50%', () => {
      expect(getColorForPercentage(0.5)).toBe('rgb(255,255,0)');
    });

    it('should return green for 100%', () => {
      expect(getColorForPercentage(1)).toBe('rgb(0,255,0)');
    });

    it('should return orange-ish for 25%', () => {
      // Interpolation between red (0%) and yellow (50%)
      // At 25%, we're halfway between red and yellow
      expect(getColorForPercentage(0.25)).toBe('rgb(255,127,0)');
    });

    it('should return yellow-green for 75%', () => {
      // Interpolation between yellow (50%) and green (100%)
      // At 75%, we're halfway between yellow and green
      expect(getColorForPercentage(0.75)).toBe('rgb(127,255,0)');
    });

    it('should handle values close to boundaries', () => {
      // Very small value - should be close to red
      const verySmall = getColorForPercentage(0.01);
      expect(verySmall).toMatch(/^rgb\(255,\d+,0\)$/);

      // Very close to 1 - should be close to green
      const nearOne = getColorForPercentage(0.99);
      expect(nearOne).toMatch(/^rgb\(\d+,255,0\)$/);
    });
  });
});
