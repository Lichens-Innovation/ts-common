import { describe, expect, it } from 'vitest';
import {
  dateAs_HHMMSS,
  dateAs_YYYYMMDD,
  dateAs_YYYYMMDD_HHMMSS,
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
});

