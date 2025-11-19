import { describe, expect, it } from 'vitest';
import {
  isHttpClientErrorStatus,
  isHttpServerErrorStatus,
  isHttpSuccessStatus,
} from './http.utils';

describe('Tests suite for HTTP utilities', () => {
  describe('isHttpSuccessStatus', () => {
    it.each`
      status     | expected
      ${200}     | ${true}
      ${201}     | ${true}
      ${204}     | ${true}
      ${299}     | ${true}
      ${199}     | ${false}
      ${300}     | ${false}
      ${400}     | ${false}
      ${500}     | ${false}
      ${null}    | ${false}
      ${undefined}| ${false}
      ${0}       | ${false}
      ${100}     | ${false}
    `('should return $expected for status=$status', ({ status, expected }) => {
      expect(isHttpSuccessStatus(status)).toBe(expected);
    });
  });

  describe('isHttpClientErrorStatus', () => {
    it.each`
      status     | expected
      ${400}     | ${true}
      ${401}     | ${true}
      ${403}     | ${true}
      ${404}     | ${true}
      ${499}     | ${true}
      ${399}     | ${false}
      ${500}     | ${false}
      ${200}     | ${false}
      ${300}     | ${false}
      ${null}    | ${false}
      ${undefined}| ${false}
      ${0}       | ${false}
    `('should return $expected for status=$status', ({ status, expected }) => {
      expect(isHttpClientErrorStatus(status)).toBe(expected);
    });
  });

  describe('isHttpServerErrorStatus', () => {
    it.each`
      status     | expected
      ${500}     | ${true}
      ${501}     | ${true}
      ${502}     | ${true}
      ${503}     | ${true}
      ${599}     | ${true}
      ${600}     | ${true}
      ${499}     | ${false}
      ${400}     | ${false}
      ${200}     | ${false}
      ${300}     | ${false}
      ${null}    | ${false}
      ${undefined}| ${false}
      ${0}       | ${false}
    `('should return $expected for status=$status', ({ status, expected }) => {
      expect(isHttpServerErrorStatus(status)).toBe(expected);
    });
  });
});

