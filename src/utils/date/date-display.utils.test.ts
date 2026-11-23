import { describe, expect, it } from 'vitest';
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayDayMonthTime,
  formatDisplayTime,
  toDisplayLocale,
  type DisplayDateInput,
  type DisplayLocale,
} from './date-display.utils';

interface UnreadableCase {
  value: DisplayDateInput;
}

const LOCAL_MOMENT = new Date(2026, 8, 24, 13, 31, 45);

describe('toDisplayLocale', () => {
  it.each([
    { language: 'en', expected: 'en' },
    { language: 'en-US', expected: 'en' },
    { language: 'EN-ca', expected: 'en' },
    { language: 'fr', expected: 'fr' },
    { language: 'fr-CA', expected: 'fr' },
    { language: 'es', expected: 'fr' },
    { language: '', expected: 'fr' },
    { language: null, expected: 'fr' },
    { language: undefined, expected: 'fr' },
  ])('maps language "$language" to "$expected"', ({ language, expected }) => {
    // act
    const result = toDisplayLocale(language);

    // assert
    expect(result).toBe(expected);
  });
});

describe('date display formatters', () => {
  it.each([
    { locale: 'fr', expected: '24 sept. 2026, 13 h 31' },
    { locale: 'en', expected: 'Sep 24, 2026, 13:31' },
  ])('formatDisplayDateTime renders "$expected" for locale "$locale"', ({ locale, expected }) => {
    // act
    const result = formatDisplayDateTime(LOCAL_MOMENT, locale as DisplayLocale);

    // assert
    expect(result).toBe(expected);
  });

  it.each([
    { locale: 'fr', expected: '24 sept. 2026' },
    { locale: 'en', expected: 'Sep 24, 2026' },
  ])('formatDisplayDate renders "$expected" for locale "$locale"', ({ locale, expected }) => {
    // act
    const result = formatDisplayDate(LOCAL_MOMENT, locale as DisplayLocale);

    // assert
    expect(result).toBe(expected);
  });

  it.each([
    { locale: 'fr', expected: '13 h 31' },
    { locale: 'en', expected: '13:31' },
  ])('formatDisplayTime renders "$expected" for locale "$locale"', ({ locale, expected }) => {
    // act
    const result = formatDisplayTime(LOCAL_MOMENT, locale as DisplayLocale);

    // assert
    expect(result).toBe(expected);
  });

  it.each([
    { locale: 'fr', expected: '24 sept., 13 h 31' },
    { locale: 'en', expected: 'Sep 24, 13:31' },
  ])('formatDisplayDayMonthTime renders "$expected" for locale "$locale"', ({ locale, expected }) => {
    // act
    const result = formatDisplayDayMonthTime(LOCAL_MOMENT, locale as DisplayLocale);

    // assert
    expect(result).toBe(expected);
  });

  it.each([
    { label: 'Date', value: LOCAL_MOMENT },
    { label: 'epoch millis', value: LOCAL_MOMENT.getTime() },
    { label: 'local ISO string', value: '2026-09-24T13:31:45' },
    { label: 'padded local ISO string', value: '  2026-09-24T13:31:45  ' },
  ])('accepts a $label input', ({ value }) => {
    // act
    const result = formatDisplayDateTime(value, 'en');

    // assert
    expect(result).toBe('Sep 24, 2026, 13:31');
  });

  it('reads a date-only string as local midnight', () => {
    // act
    const result = formatDisplayDateTime('2026-09-24', 'en');

    // assert
    expect(result).toBe('Sep 24, 2026, 00:00');
  });

  it.each<UnreadableCase>([
    { value: null },
    { value: undefined },
    { value: '' },
    { value: 'not a date' },
    { value: Number.NaN },
    { value: new Date(Number.NaN) },
  ])('returns an empty string for unreadable value $value', ({ value }) => {
    // act
    const result = formatDisplayDate(value, 'fr');

    // assert
    expect(result).toBe('');
  });
});
