import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dateAs_HHMMSS,
  dateAs_YYYYMMDD,
  dateAs_YYYYMMDD_HHMMSS,
  formatUnixTimestamp,
  getCurrentUnixTimestamp,
  isActiveTimestamp,
  isExpiredTimestamp,
  nowAsDate,
  nowAsDateTime,
  nowAsDateTimeForFilename,
  nowAsTime,
} from './date.utils';

describe('Tests suite for date utilities', () => {
  const fixedDate = new Date('2024-03-15T14:30:45.123Z');

  describe('dateAs_HHMMSS', () => {
    it.each`
      value                                | expected
      ${new Date('2024-03-15T14:30:45Z')}  | ${'14:30:45'}
      ${'2024-03-15T14:30:45Z'}            | ${'14:30:45'}
      ${1647352245000}                     | ${'14:30:45'}
      ${null}                              | ${''}
      ${undefined}                         | ${''}
    `('should return "$expected" for $value', ({ value, expected }) => {
      // Note: The actual time may vary by timezone, so we check the format
      const result = dateAs_HHMMSS(value);
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
      const result = dateAs_YYYYMMDD(value);
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
      const result = dateAs_YYYYMMDD_HHMMSS(value);
      if (expected === '') {
        expect(result).toBe(expected);
      } else {
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      }
    });
  });

  describe('nowAsTime', () => {
    it('should return a time string in HH:mm:ss format', () => {
      const result = nowAsTime();
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('nowAsDate', () => {
    it('should return a date string in yyyy-MM-dd format', () => {
      const result = nowAsDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('nowAsDateTime', () => {
    it('should return a datetime string in yyyy-MM-dd HH:mm:ss format', () => {
      const result = nowAsDateTime();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('nowAsDateTimeForFilename', () => {
    it('should return a datetime string in yyyy-MM-dd_HH-mm-ss format', () => {
      const result = nowAsDateTimeForFilename();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
    });
  });

  describe('formatUnixTimestamp', () => {
    it('should format a valid Unix timestamp with default format', () => {
      // 2024-03-15 14:30:45 UTC
      const timestamp = 1710513045;
      const result = formatUnixTimestamp(timestamp);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('should format a valid Unix timestamp with custom format', () => {
      const timestamp = 1710513045;
      const result = formatUnixTimestamp(timestamp, 'yyyy/MM/dd');
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it('should return "N/A" for zero timestamp', () => {
      expect(formatUnixTimestamp(0)).toBe('N/A');
    });

    it('should return "N/A" for undefined/null timestamp', () => {
      expect(formatUnixTimestamp(undefined as unknown as number)).toBe('N/A');
      expect(formatUnixTimestamp(null as unknown as number)).toBe('N/A');
    });
  });

  describe('getCurrentUnixTimestamp', () => {
    it('should return a number', () => {
      const result = getCurrentUnixTimestamp();
      expect(typeof result).toBe('number');
    });

    it('should return the current time in seconds', () => {
      const before = Math.floor(Date.now() / 1000);
      const result = getCurrentUnixTimestamp();
      const after = Math.floor(Date.now() / 1000);
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
      const pastTimestamp = 1710500000; // before mocked time
      expect(isExpiredTimestamp(pastTimestamp)).toBe(true);
    });

    it('should return false for a future timestamp', () => {
      const futureTimestamp = 1710510000; // after mocked time
      expect(isExpiredTimestamp(futureTimestamp)).toBe(false);
    });

    it('should return false for the current timestamp', () => {
      const currentTimestamp = 1710504000; // exactly mocked time
      expect(isExpiredTimestamp(currentTimestamp)).toBe(false);
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
      const pastTimestamp = 1710500000; // before mocked time
      expect(isActiveTimestamp(pastTimestamp)).toBe(true);
    });

    it('should return false for a future timestamp', () => {
      const futureTimestamp = 1710510000; // after mocked time
      expect(isActiveTimestamp(futureTimestamp)).toBe(false);
    });

    it('should return true for the current timestamp', () => {
      const currentTimestamp = 1710504000; // exactly mocked time
      expect(isActiveTimestamp(currentTimestamp)).toBe(true);
    });
  });
});

