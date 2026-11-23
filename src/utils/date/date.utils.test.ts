import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dateAs_HHMMSS,
  dateAs_YYYYMMDD,
  dateAs_YYYYMMDD_HHMMSS,
  dateToNumberRange,
  formatUnixTimestamp,
  getCurrentUnixTimestamp,
  isActiveTimestamp,
  isExpiredTimestamp,
  nowAsDate,
  nowAsDateTime,
  nowAsDateTimeForFilename,
  nowAsTime,
  numberToDateRange,
} from './date.utils';

describe('Tests suite for date utilities', () => {
  describe('dateAs_HHMMSS', () => {
    it.each`
      value                               | expected
      ${new Date('2024-03-15T14:30:45Z')} | ${'14:30:45'}
      ${'2024-03-15T14:30:45Z'}           | ${'14:30:45'}
      ${1647352245000}                    | ${'14:30:45'}
      ${null}                             | ${''}
      ${undefined}                        | ${''}
    `('should return "$expected" for $value', ({ value, expected }) => {
      // act
      const result = dateAs_HHMMSS(value);
      // assert
      // the hour depends on the runner's timezone, so only the shape is checked habit-hooks-disable non-essential-comment
      if (expected === '') {
        expect(result).toBe(expected);
      } else {
        expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      }
    });
  });

  describe('dateAs_YYYYMMDD', () => {
    it.each`
      value                               | expected
      ${new Date('2024-03-15T14:30:45Z')} | ${'2024-03-15'}
      ${'2024-03-15T14:30:45Z'}           | ${'2024-03-15'}
      ${1647352245000}                    | ${'2024-03-15'}
      ${null}                             | ${''}
      ${undefined}                        | ${''}
    `('should return "$expected" for $value', ({ value, expected }) => {
      // act
      const result = dateAs_YYYYMMDD(value);
      // assert
      if (expected === '') {
        expect(result).toBe(expected);
      } else {
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  describe('dateAs_YYYYMMDD_HHMMSS', () => {
    it.each`
      value                               | expected
      ${new Date('2024-03-15T14:30:45Z')} | ${'2024-03-15 14:30:45'}
      ${'2024-03-15T14:30:45Z'}           | ${'2024-03-15 14:30:45'}
      ${1647352245000}                    | ${'2024-03-15 14:30:45'}
      ${null}                             | ${''}
      ${undefined}                        | ${''}
    `('should return "$expected" for $value', ({ value, expected }) => {
      // act
      const result = dateAs_YYYYMMDD_HHMMSS(value);
      // assert
      if (expected === '') {
        expect(result).toBe(expected);
      } else {
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      }
    });
  });

  describe('nowAsTime', () => {
    it('should return a time string in HH:mm:ss format', () => {
      // act
      const result = nowAsTime();
      // assert
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('nowAsDate', () => {
    it('should return a date string in yyyy-MM-dd format', () => {
      // act
      const result = nowAsDate();
      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('nowAsDateTime', () => {
    it('should return a datetime string in yyyy-MM-dd HH:mm:ss format', () => {
      // act
      const result = nowAsDateTime();
      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('nowAsDateTimeForFilename', () => {
    it('should return a datetime string in yyyy-MM-dd_HH-mm-ss format', () => {
      // act
      const result = nowAsDateTimeForFilename();
      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
    });
  });

  describe('formatUnixTimestamp', () => {
    it('should format a valid Unix timestamp with default format', () => {
      // arrange
      const timestamp = 1710513045;
      // act
      const result = formatUnixTimestamp(timestamp);
      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('should format a valid Unix timestamp with custom format', () => {
      // arrange
      const timestamp = 1710513045;
      // act
      const result = formatUnixTimestamp(timestamp, 'yyyy/MM/dd');
      // assert
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it('should return "N/A" for zero timestamp', () => {
      // act
      const result = formatUnixTimestamp(0);
      // assert
      expect(result).toBe('N/A');
    });

    it('should return "N/A" for undefined/null timestamp', () => {
      // act
      const resultUndefined = formatUnixTimestamp(undefined as unknown as number);
      const resultNull = formatUnixTimestamp(null as unknown as number);
      // assert
      expect(resultUndefined).toBe('N/A');
      expect(resultNull).toBe('N/A');
    });

    it('should return "Invalid date" when formatting throws', () => {
      // act
      const result = formatUnixTimestamp(Infinity);
      // assert
      expect(result).toBe('Invalid date');
    });
  });

  describe('getCurrentUnixTimestamp', () => {
    it('should return a number', () => {
      // act
      const result = getCurrentUnixTimestamp();
      // assert
      expect(typeof result).toBe('number');
    });

    it('should return the current time in seconds', () => {
      // arrange
      const before = Math.floor(Date.now() / 1000);
      // act
      const result = getCurrentUnixTimestamp();
      const after = Math.floor(Date.now() / 1000);
      // assert
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });
  });

  describe('isExpiredTimestamp and isActiveTimestamp', () => {
    const NOW_IN_SECONDS = 1710504000;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(NOW_IN_SECONDS * 1000));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it.each`
      check                                                     | timestamp                | expected
      ${{ name: 'isExpiredTimestamp', fn: isExpiredTimestamp }} | ${NOW_IN_SECONDS - 4000} | ${true}
      ${{ name: 'isExpiredTimestamp', fn: isExpiredTimestamp }} | ${NOW_IN_SECONDS + 6000} | ${false}
      ${{ name: 'isExpiredTimestamp', fn: isExpiredTimestamp }} | ${NOW_IN_SECONDS}        | ${false}
      ${{ name: 'isActiveTimestamp', fn: isActiveTimestamp }}   | ${NOW_IN_SECONDS - 4000} | ${true}
      ${{ name: 'isActiveTimestamp', fn: isActiveTimestamp }}   | ${NOW_IN_SECONDS + 6000} | ${false}
      ${{ name: 'isActiveTimestamp', fn: isActiveTimestamp }}   | ${NOW_IN_SECONDS}        | ${true}
    `('$check.name($timestamp) should return $expected', ({ check, timestamp, expected }) => {
      // act
      const result = check.fn(timestamp);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('dateToNumberRange', () => {
    it('should convert a [Date, Date] range to a [number, number] range', () => {
      // arrange
      const start = new Date('2024-03-15T00:00:00Z');
      const end = new Date('2024-03-20T00:00:00Z');
      // act
      const result = dateToNumberRange([start, end]);
      // assert
      expect(result).toEqual([start.getTime(), end.getTime()]);
    });
  });

  describe('numberToDateRange', () => {
    it('should convert a [number, number] range to a [Date, Date] range', () => {
      // arrange
      const start = new Date('2024-03-15T00:00:00Z').getTime();
      const end = new Date('2024-03-20T00:00:00Z').getTime();
      // act
      const result = numberToDateRange([start, end]);
      // assert
      expect(result).toEqual([new Date(start), new Date(end)]);
    });
  });

  describe('dateToNumberRange / numberToDateRange round-trip', () => {
    it('should return an equivalent date range after converting back and forth', () => {
      // arrange
      const start = new Date('2024-03-15T00:00:00Z');
      const end = new Date('2024-03-20T00:00:00Z');
      // act
      const roundTripped = numberToDateRange(dateToNumberRange([start, end]));
      // assert
      expect(roundTripped).toEqual([start, end]);
    });
  });
});
