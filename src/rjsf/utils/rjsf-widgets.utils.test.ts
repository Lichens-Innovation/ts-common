import type { WidgetProps } from '@rjsf/utils';
import { describe, expect, it } from 'vitest';
import {
  dateToDateOnlyString,
  formatDateOnlyForDisplay,
  formatDateTimeForDisplay,
  formatTimeOnlyForDisplay,
  getFormLayoutCols,
  getRjsfDisplayLabel,
  getRjsfLabelColor,
  getRjsfTextChangeValue,
  hasRjsfErrors,
  mapEnumOptions,
  parseDateOnlyToLocalDate,
  parseDateOrNull,
  parseTimeOnlyToLocalDate,
  timeToTimeOnlyString,
  toStringOrEmpty,
  toStringOrUndefined,
  type GetRjsfDisplayLabelArgs,
} from './rjsf-widgets.utils';
import type { DisplayLocale } from '../../utils/date/date-display.utils';

const EMPTY_VALUE = Symbol('empty');

interface DisplayCase {
  value?: string;
  locale?: DisplayLocale;
  expected: string;
}

interface DisplayLabelCase {
  args: GetRjsfDisplayLabelArgs;
  expected?: string;
}

interface ClockReading {
  hours: number;
  minutes: number;
  seconds: number;
}

const toClockReading = (date: Date | null): ClockReading | null =>
  date ? { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() } : null;

describe('getRjsfTextChangeValue', () => {
  it.each([
    { text: '', expected: EMPTY_VALUE },
    { text: '   ', expected: EMPTY_VALUE },
    { text: ' a ', expected: ' a ' },
    { text: 'abc', expected: 'abc' },
  ])('maps "$text" to its change value', ({ text, expected }) => {
    // act
    const result = getRjsfTextChangeValue({ text, emptyValue: EMPTY_VALUE });

    // assert
    expect(result).toBe(expected);
  });
});

describe('hasRjsfErrors', () => {
  it.each([
    { rawErrors: undefined, expected: false },
    { rawErrors: null, expected: false },
    { rawErrors: 'error', expected: false },
    { rawErrors: [], expected: false },
    { rawErrors: ['required'], expected: true },
  ])('returns $expected for $rawErrors', ({ rawErrors, expected }) => {
    // act
    const result = hasRjsfErrors(rawErrors);

    // assert
    expect(result).toBe(expected);
  });
});

describe('getRjsfDisplayLabel', () => {
  it.each<DisplayLabelCase>([
    { args: { label: 'Name', hideLabel: true }, expected: undefined },
    { args: { label: undefined }, expected: undefined },
    { args: { label: '   ' }, expected: undefined },
    { args: { label: 'Name' }, expected: 'Name' },
    { args: { label: 'Name', required: false }, expected: 'Name' },
    { args: { label: 'Name', required: true }, expected: 'Name *' },
  ])('returns $expected for $args', ({ args, expected }) => {
    // act
    const result = getRjsfDisplayLabel(args);

    // assert
    expect(result).toBe(expected);
  });
});

describe('getRjsfLabelColor', () => {
  it.each([
    { options: undefined, expected: undefined },
    { options: null, expected: undefined },
    { options: {}, expected: undefined },
    { options: { labelColor: 123 }, expected: undefined },
    { options: { labelColor: 'red' }, expected: undefined },
    { options: { labelColor: '#12345' }, expected: undefined },
    { options: { labelColor: '#abc' }, expected: '#abc' },
    { options: { labelColor: ' #A1B2C3 ' }, expected: '#A1B2C3' },
  ])('returns $expected for $options', ({ options, expected }) => {
    // act
    const result = getRjsfLabelColor(options);

    // assert
    expect(result).toBe(expected);
  });
});

describe('mapEnumOptions', () => {
  it.each([
    { options: undefined, expected: [] },
    { options: {}, expected: [] },
    { options: { enumOptions: 'nope' }, expected: [] },
    {
      options: { enumOptions: [{ value: 'a', label: 'Alpha' }] },
      expected: [{ value: 'a', label: 'Alpha' }],
    },
    { options: { enumOptions: [{ value: 2 }] }, expected: [{ value: '2', label: '2' }] },
    { options: { enumOptions: [{}] }, expected: [{ value: '', label: '' }] },
    { options: { enumOptions: [null] }, expected: [{ value: '', label: '' }] },
  ])('maps $options to display options', ({ options, expected }) => {
    // act
    const result = mapEnumOptions(options as WidgetProps['options']);

    // assert
    expect(result).toEqual(expected);
  });
});

describe('toStringOrEmpty and toStringOrUndefined', () => {
  it.each([
    { value: null, expectedEmpty: '', expectedUndefined: undefined },
    { value: undefined, expectedEmpty: '', expectedUndefined: undefined },
    { value: 0, expectedEmpty: '0', expectedUndefined: '0' },
    { value: false, expectedEmpty: 'false', expectedUndefined: 'false' },
    { value: 'x', expectedEmpty: 'x', expectedUndefined: 'x' },
  ])('stringifies $value', ({ value, expectedEmpty, expectedUndefined }) => {
    // act
    const orEmpty = toStringOrEmpty(value);
    const orUndefined = toStringOrUndefined(value);

    // assert
    expect(orEmpty).toBe(expectedEmpty);
    expect(orUndefined).toBe(expectedUndefined);
  });
});

describe('parseDateOrNull', () => {
  it.each([{ value: undefined }, { value: '' }, { value: '  ' }, { value: 'not a date' }])(
    'returns null for "$value"',
    ({ value }) => {
      // act
      const result = parseDateOrNull(value);

      // assert
      expect(result).toBeNull();
    }
  );

  it('parses a valid ISO string', () => {
    // arrange
    const iso = '2026-09-24T13:31:00.000Z';

    // act
    const result = parseDateOrNull(iso);

    // assert
    expect(result?.toISOString()).toBe(iso);
  });
});

describe('dateToDateOnlyString', () => {
  it.each([
    { date: new Date(2026, 8, 24, 23, 59), expected: '2026-09-24' },
    { date: new Date(2026, 0, 5), expected: '2026-01-05' },
  ])('formats a local date as $expected', ({ date, expected }) => {
    // act
    const result = dateToDateOnlyString(date);

    // assert
    expect(result).toBe(expected);
  });
});

describe('parseDateOnlyToLocalDate', () => {
  it.each([{ value: undefined }, { value: '' }, { value: '2026/09/24' }, { value: 'garbage' }])(
    'returns null for "$value"',
    ({ value }) => {
      // act
      const result = parseDateOnlyToLocalDate(value);

      // assert
      expect(result).toBeNull();
    }
  );

  it.each([{ value: '2026-09-24' }, { value: ' 2026-09-24T22:00:00.000Z ' }])(
    'builds local midnight from "$value"',
    ({ value }) => {
      // act
      const result = parseDateOnlyToLocalDate(value);

      // assert
      expect(result).toEqual(new Date(2026, 8, 24));
    }
  );
});

describe('formatDateOnlyForDisplay', () => {
  it.each<DisplayCase>([
    { value: undefined, expected: '' },
    { value: '', expected: '' },
    { value: 'garbage', expected: '' },
    { value: '2026-09-24T13:31:00Z', expected: '2026-09-24' },
    { value: '2026-09-24', locale: 'en', expected: 'Sep 24, 2026' },
    { value: '2026-09-24', locale: 'fr', expected: '24 sept. 2026' },
  ])('renders "$value" with locale $locale as "$expected"', ({ value, locale, expected }) => {
    // act
    const result = formatDateOnlyForDisplay(value, locale);

    // assert
    expect(result).toBe(expected);
  });
});

describe('formatDateTimeForDisplay', () => {
  it.each([{ value: undefined }, { value: 'garbage' }])('returns an empty string for "$value"', ({ value }) => {
    // act
    const result = formatDateTimeForDisplay(value, 'en');

    // assert
    expect(result).toBe('');
  });

  it('formats with the display locale when one is given', () => {
    // arrange
    const value = new Date(2026, 8, 24, 13, 31).toISOString();

    // act
    const result = formatDateTimeForDisplay(value, 'en');

    // assert
    expect(result).toBe('Sep 24, 2026, 13:31');
  });

  it('falls back to toLocaleString without a locale', () => {
    // arrange
    const value = new Date(2026, 8, 24, 13, 31).toISOString();

    // act
    const result = formatDateTimeForDisplay(value);

    // assert
    expect(result).toBe(new Date(value).toLocaleString());
  });
});

describe('timeToTimeOnlyString', () => {
  it.each([
    { date: new Date(2026, 8, 24, 13, 31, 45), expected: '13:31:00' },
    { date: new Date(2026, 8, 24, 7, 5), expected: '07:05:00' },
  ])('formats the local clock as $expected', ({ date, expected }) => {
    // act
    const result = timeToTimeOnlyString(date);

    // assert
    expect(result).toBe(expected);
  });
});

describe('parseTimeOnlyToLocalDate', () => {
  it.each([
    { value: undefined, expected: null },
    { value: '', expected: null },
    { value: '24:00', expected: null },
    { value: '12:60', expected: null },
    { value: '7:05', expected: null },
    { value: '13:31', expected: { hours: 13, minutes: 31, seconds: 0 } },
    { value: ' 07:05:09 ', expected: { hours: 7, minutes: 5, seconds: 9 } },
  ])('parses "$value"', ({ value, expected }) => {
    // act
    const result = parseTimeOnlyToLocalDate(value);

    // assert
    expect(toClockReading(result)).toEqual(expected);
  });

  it('anchors the time on today', () => {
    // arrange
    const today = new Date();

    // act
    const result = parseTimeOnlyToLocalDate('08:00');

    // assert
    expect(result && dateToDateOnlyString(result)).toBe(dateToDateOnlyString(today));
  });
});

describe('formatTimeOnlyForDisplay', () => {
  it.each<DisplayCase>([
    { value: undefined, expected: '' },
    { value: '', expected: '' },
    { value: '25:00', expected: '' },
    { value: '13:31:45', expected: '13:31' },
    { value: ' 07:05 ', expected: '07:05' },
    { value: '13:31:00', locale: 'en', expected: '13:31' },
    { value: '13:31', locale: 'fr', expected: '13 h 31' },
  ])('renders "$value" with locale $locale as "$expected"', ({ value, locale, expected }) => {
    // act
    const result = formatTimeOnlyForDisplay(value, locale);

    // assert
    expect(result).toBe(expected);
  });
});

describe('getFormLayoutCols', () => {
  it.each([
    { formContext: undefined, expected: { labelCol: { span: 24 }, wrapperCol: { span: 24 } } },
    { formContext: null, expected: { labelCol: { span: 24 }, wrapperCol: { span: 24 } } },
    { formContext: {}, expected: { labelCol: { span: 24 }, wrapperCol: { span: 24 } } },
    {
      formContext: { labelCol: { span: 8 }, wrapperCol: { span: 16 } },
      expected: { labelCol: { span: 8 }, wrapperCol: { span: 16 } },
    },
    { formContext: { labelCol: { span: 6 } }, expected: { labelCol: { span: 6 }, wrapperCol: { span: 24 } } },
  ])('resolves columns for $formContext', ({ formContext, expected }) => {
    // act
    const result = getFormLayoutCols(formContext);

    // assert
    expect(result).toEqual(expected);
  });
});
