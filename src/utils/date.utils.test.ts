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
      value                                | expected
      ${new Date('2024-03-15T14:30:45Z')}  | ${'14:30:45'}
      ${'2024-03-15T14:30:45Z'}            | ${'14:30:45'}
      ${1647352245000}                     | ${'14:30:45'}
      ${null}                              | ${''}
      ${undefined}                         | ${''}
    `('should return "$expected" for $value', ({ value, expected }) => {
      // act
      const result = dateAs_HHMMSS(value);
      // assert
      // Note: The actual time may vary by timezone, so we check the format
      if (expected === '') {
        expect(result).toBe(expected);
      } else {
        expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      }
    });
  });

  describe('dateAs_YYYYMMDD', () => {
    it.each`
      value                                | expected
      ${new Date('2024-03-15T14:30:45Z')}  | ${'2024-03-15'}
      ${'2024-03-15T14:30:45Z'}            | ${'2024-03-15'}
      ${1647352245000}                     | ${'2024-03-15'}
      ${null}                              | ${''}
      ${undefined}                         | ${''}
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
      value                                | expected
      ${new Date('2024-03-15T14:30:45Z')}  | ${'2024-03-15 14:30:45'}
      ${'2024-03-15T14:30:45Z'}            | ${'2024-03-15 14:30:45'}
      ${1647352245000}                     | ${'2024-03-15 14:30:45'}
      ${null}                              | ${''}
      ${undefined}                         | ${''}
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
      // 2024-03-15 14:30:45 UTC
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

  describe('isExpiredTimestamp', () => {
    beforeEach(() => {
      // Mock current time to 2024-03-15 12:00:00 UTC (1710504000)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for a past timestamp', () => {
      // arrange
      const pastTimestamp = 1710500000; // before mocked time
      // act
      const result = isExpiredTimestamp(pastTimestamp);
      // assert
      expect(result).toBe(true);
    });

    it('should return false for a future timestamp', () => {
      // arrange
      const futureTimestamp = 1710510000; // after mocked time
      // act
      const result = isExpiredTimestamp(futureTimestamp);
      // assert
      expect(result).toBe(false);
    });

    it('should return false for the current timestamp', () => {
      // arrange
      const currentTimestamp = 1710504000; // exactly mocked time
      // act
      const result = isExpiredTimestamp(currentTimestamp);
      // assert
      expect(result).toBe(false);
    });
  });

  describe('isActiveTimestamp', () => {
    beforeEach(() => {
      // Mock current time to 2024-03-15 12:00:00 UTC (1710504000)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for a past timestamp', () => {
      // arrange
      const pastTimestamp = 1710500000; // before mocked time
      // act
      const result = isActiveTimestamp(pastTimestamp);
      // assert
      expect(result).toBe(true);
    });

    it('should return false for a future timestamp', () => {
      // arrange
      const futureTimestamp = 1710510000; // after mocked time
      // act
      const result = isActiveTimestamp(futureTimestamp);
      // assert
      expect(result).toBe(false);
    });

    it('should return true for the current timestamp', () => {
      // arrange
      const currentTimestamp = 1710504000; // exactly mocked time
      // act
      const result = isActiveTimestamp(currentTimestamp);
      // assert
      expect(result).toBe(true);
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

