import { describe, expect, it } from 'vitest';
import {
  fromHzToRpm,
  fromM3psToGPM,
  fromMToInches,
  fromPaToFt,
  fromWToHp,
  HZ_TO_RPM,
  M3PS_TO_GPM,
  M_TO_INCHES,
  PA_TO_FT,
  W_TO_HP,
} from './units.utils';

describe('Tests suite for units utilities', () => {
  describe('fromM3psToGPM', () => {
    it.each`
      value      | expected
      ${1}       | ${15850.3}
      ${0}       | ${0}
      ${0.5}     | ${7925.15}
      ${2}       | ${31700.6}
      ${null}    | ${0}
      ${undefined}| ${0}
    `('should return $expected for value=$value', ({ value, expected }) => {
      expect(fromM3psToGPM(value)).toBeCloseTo(expected, 5);
    });
  });

  describe('fromPaToFt', () => {
    it.each`
      value      | expected
      ${1000}    | ${0.334553}
      ${0}       | ${0}
      ${5000}    | ${1.672765}
      ${10000}   | ${3.34553}
      ${null}    | ${0}
      ${undefined}| ${0}
    `('should return $expected for value=$value', ({ value, expected }) => {
      expect(fromPaToFt(value)).toBeCloseTo(expected, 10);
    });
  });

  describe('fromWToHp', () => {
    it.each`
      value      | expected
      ${1000}    | ${1.34102}
      ${0}       | ${0}
      ${500}     | ${0.67051}
      ${746}     | ${1.00040092}
      ${null}    | ${0}
      ${undefined}| ${0}
    `('should return $expected for value=$value', ({ value, expected }) => {
      expect(fromWToHp(value)).toBeCloseTo(expected, 10);
    });
  });

  describe('fromMToInches', () => {
    it.each`
      value      | expected
      ${1}       | ${39.3701}
      ${0}       | ${0}
      ${0.5}     | ${19.68505}
      ${2}       | ${78.7402}
      ${null}    | ${0}
      ${undefined}| ${0}
    `('should return $expected for value=$value', ({ value, expected }) => {
      expect(fromMToInches(value)).toBeCloseTo(expected, 10);
    });
  });

  describe('fromHzToRpm', () => {
    it.each`
      value      | expected
      ${1}       | ${60}
      ${0}       | ${0}
      ${50}      | ${3000}
      ${60}      | ${3600}
      ${null}    | ${0}
      ${undefined}| ${0}
    `('should return $expected for value=$value', ({ value, expected }) => {
      expect(fromHzToRpm(value)).toBe(expected);
    });
  });

  describe('Constants', () => {
    it.each`
      constant      | expected
      ${M3PS_TO_GPM}| ${15850.3}
      ${PA_TO_FT}   | ${0.000334553}
      ${W_TO_HP}    | ${0.00134102}
      ${M_TO_INCHES}| ${39.3701}
      ${HZ_TO_RPM}  | ${60}
    `('should have correct value for $constant', ({ constant, expected }) => {
      expect(constant).toBe(expected);
    });
  });
});

