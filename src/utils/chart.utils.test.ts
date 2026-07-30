import { describe, expect, it } from 'vitest';
import {
  buildTicksForChart,
  getTickDomain,
  roundToNiceNumber,
  tickFormatter,
  toToleranceLabel,
  tooltipValueFormatter,
} from './chart.utils';

describe('chart.utils', () => {
  describe('getTickDomain', () => {
    it.each`
      ticks              | expected
      ${[0, 10, 20, 30]} | ${[0, 30]}
      ${[0, 5, 10]}      | ${[0, 10]}
      ${[0]}             | ${[0, 0]}
      ${[]}              | ${[0, 0]}
      ${[0, 100]}        | ${[0, 100]}
    `('returns $expected for ticks $ticks', ({ ticks, expected }) => {
      // act
      const result = getTickDomain(ticks);
      // assert
      expect(result).toEqual(expected);
    });
  });

  describe('tickFormatter', () => {
    it.each`
      value   | expected
      ${0}    | ${'0'}
      ${10}   | ${'10'}
      ${10.4} | ${'10'}
      ${10.5} | ${'11'}
      ${10.6} | ${'11'}
      ${99.9} | ${'100'}
      ${1000} | ${'1000'}
    `('formats $value as $expected', ({ value, expected }) => {
      // act
      const result = tickFormatter(value);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('toToleranceLabel', () => {
    it.each`
      value  | expected
      ${0}   | ${'±0%'}
      ${0.1} | ${'±10%'}
      ${0.15}| ${'±15%'}
      ${0.5} | ${'±50%'}
      ${1}   | ${'±100%'}
    `('returns $expected for $value', ({ value, expected }) => {
      // act
      const result = toToleranceLabel(value);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('tooltipValueFormatter', () => {
    describe('with single number', () => {
      it.each`
        value     | expected
        ${0}      | ${'0.00'}
        ${10}     | ${'10.00'}
        ${10.123} | ${'10.12'}
        ${10.126} | ${'10.13'}
        ${99.999} | ${'100.00'}
      `('formats $value as $expected', ({ value, expected }) => {
        // act
        const result = tooltipValueFormatter(value);
        // assert
        expect(result).toBe(expected);
      });
    });

    describe('with tolerance range array', () => {
      it.each`
        range             | expected
        ${[10, 20]}       | ${'[10.00 … 20.00]'}
        ${[0, 100]}       | ${'[0.00 … 100.00]'}
        ${[5.5, 10.5]}    | ${'[5.50 … 10.50]'}
        ${[1.234, 5.678]} | ${'[1.23 … 5.68]'}
      `('formats range $range as $expected', ({ range, expected }) => {
        // act
        const result = tooltipValueFormatter(range);
        // assert
        expect(result).toBe(expected);
      });
    });

    describe('fallback for non-numeric / invalid input', () => {
      it('returns string as-is for string input', () => {
        // act
        const helloResult = tooltipValueFormatter('hello');
        const numericStringResult = tooltipValueFormatter('42');
        // assert
        expect(helloResult).toBe('hello');
        expect(numericStringResult).toBe('42');
      });

      it('returns empty string for null and undefined', () => {
        // act
        const nullResult = tooltipValueFormatter(null);
        const undefinedResult = tooltipValueFormatter(undefined);
        // assert
        expect(nullResult).toBe('');
        expect(undefinedResult).toBe('');
      });

      it('returns string representation for object input', () => {
        // act
        const emptyObjectResult = tooltipValueFormatter({});
        const objectResult = tooltipValueFormatter({ foo: 1 });
        // assert
        expect(emptyObjectResult).toBe('[object Object]');
        expect(objectResult).toBe('[object Object]');
      });

      it('returns string representation for array with non-numeric elements', () => {
        // act
        const multiElementResult = tooltipValueFormatter(['a', 'b']);
        const singleElementResult = tooltipValueFormatter(['x']);
        // assert
        expect(multiElementResult).toBe('a,b');
        expect(singleElementResult).toBe('x');
      });
    });
  });

  describe('roundToNiceNumber', () => {
    describe('edge cases', () => {
      it.each`
        value   | expected
        ${0}    | ${0}
        ${-1}   | ${0}
        ${-100} | ${0}
      `('returns $expected for $value', ({ value, expected }) => {
        // act
        const result = roundToNiceNumber(value);
        // assert
        expect(result).toBe(expected);
      });
    });

    describe('values < 1', () => {
      it.each`
        value   | expected
        ${0.1}  | ${0.1}
        ${0.15} | ${0.2}
        ${0.3}  | ${0.5}
        ${0.7}  | ${1}
        ${0.9}  | ${1}
      `('rounds $value to $expected', ({ value, expected }) => {
        // act
        const result = roundToNiceNumber(value);
        // assert
        expect(result).toBe(expected);
      });
    });

    describe('values 1-10', () => {
      it.each`
        value  | expected
        ${1}   | ${1}
        ${1.5} | ${2}
        ${2}   | ${2}
        ${2.3} | ${2.5}
        ${2.5} | ${2.5}
        ${3}   | ${5}
        ${4}   | ${5}
        ${5}   | ${5}
        ${6}   | ${10}
        ${8}   | ${10}
      `('rounds $value to $expected', ({ value, expected }) => {
        // act
        const result = roundToNiceNumber(value);
        // assert
        expect(result).toBe(expected);
      });
    });

    describe('values 10-100', () => {
      it.each`
        value | expected
        ${10} | ${10}
        ${17} | ${20}
        ${25} | ${25}
        ${30} | ${50}
        ${50} | ${50}
        ${60} | ${100}
        ${80} | ${100}
      `('rounds $value to $expected', ({ value, expected }) => {
        // act
        const result = roundToNiceNumber(value);
        // assert
        expect(result).toBe(expected);
      });
    });

    describe('large values', () => {
      it.each`
        value   | expected
        ${100}  | ${100}
        ${150}  | ${200}
        ${700}  | ${1000}
        ${1500} | ${2000}
        ${8000} | ${10000}
      `('rounds $value to $expected', ({ value, expected }) => {
        // act
        const result = roundToNiceNumber(value);
        // assert
        expect(result).toBe(expected);
      });
    });
  });

  describe('buildTicksForChart', () => {
    describe('edge cases', () => {
      it.each`
        max    | expected
        ${0}   | ${[0]}
        ${-10} | ${[0]}
      `('returns $expected for max=$max', ({ max, expected }) => {
        // act
        const result = buildTicksForChart(max);
        // assert
        expect(result).toEqual(expected);
      });
    });

    describe('generates appropriate ticks', () => {
      it.each`
        max     | expectedFirst | expectedLast | description
        ${100}  | ${0}          | ${100}       | ${'exact nice max'}
        ${95}   | ${0}          | ${100}       | ${'slightly below nice max'}
        ${50}   | ${0}          | ${50}        | ${'half of 100'}
        ${1000} | ${0}          | ${1000}      | ${'large value'}
      `(
        'for max=$max: starts at $expectedFirst, ends at >= $expectedLast ($description)',
        ({ max, expectedFirst, expectedLast }) => {
          // act
          const ticks = buildTicksForChart(max);

          // assert
          expect(ticks[0]).toBe(expectedFirst);
          expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(expectedLast);
        }
      );
    });

    describe('tick count approximation', () => {
      it.each`
        max     | targetCount | minExpected | maxExpected
        ${100}  | ${10}       | ${8}        | ${12}
        ${100}  | ${5}        | ${4}        | ${7}
        ${1000} | ${10}       | ${8}        | ${12}
      `(
        'for max=$max with target=$targetCount: produces between $minExpected and $maxExpected ticks',
        ({ max, targetCount, minExpected, maxExpected }) => {
          // act
          const ticks = buildTicksForChart(max, targetCount);

          // assert
          expect(ticks.length).toBeGreaterThanOrEqual(minExpected);
          expect(ticks.length).toBeLessThanOrEqual(maxExpected);
        }
      );
    });

    describe('ticks are sorted and start at 0', () => {
      it.each`
        max
        ${50}
        ${100}
        ${250}
        ${1000}
      `('for max=$max: ticks are ascending from 0', ({ max }) => {
        // act
        const ticks = buildTicksForChart(max);

        // assert
        expect(ticks[0]).toBe(0);
        for (let i = 1; i < ticks.length; i++) {
          expect(ticks[i]).toBeGreaterThan(ticks[i - 1]);
        }
      });
    });

    describe('ticks are nice numbers', () => {
      it('all ticks should be divisible by the increment', () => {
        // act
        const ticks = buildTicksForChart(100);
        const increment = ticks[1] - ticks[0];

        // assert
        for (const tick of ticks) {
          expect(tick % increment).toBe(0);
        }
      });
    });
  });
});
