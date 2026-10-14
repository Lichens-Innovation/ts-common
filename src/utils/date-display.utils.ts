import { format, isValid, parseISO } from 'date-fns';
import { enCA, frCA, type Locale } from 'date-fns/locale';
import { isNullish } from './types.utils';

/**
 * Dates and times as people read them, the same on every screen: day, abbreviated month and year,
 * then the time on a 24-hour clock — never seconds, never AM/PM.
 *
 * - fr: `24 sept. 2026, 13 h 31` · `24 sept. 2026` · `13 h 31` (the Québec style)
 * - en: `Sep 24, 2026, 13:31` · `Sep 24, 2026` · `13:31`
 *
 * Built on date-fns patterns rather than `Intl`, so the output does not depend on the JS engine's
 * locale data or the device's region and 12/24-hour settings.
 */
export type DisplayLocale = 'fr' | 'en';

export type DisplayDateInput = Date | string | number | null | undefined;

type DisplayPatterns = {
  locale: Locale;
  date: string;
  time: string;
  /** The date inside a range, where the year would only repeat what the reader already knows. */
  dayMonth: string;
};

const PATTERNS: Record<DisplayLocale, DisplayPatterns> = {
  fr: { locale: frCA, date: 'd MMM yyyy', time: "H 'h' mm", dayMonth: 'd MMM' },
  en: { locale: enCA, date: 'MMM d, yyyy', time: 'HH:mm', dayMonth: 'MMM d' },
};

/** Any i18next language tag (`fr`, `fr-CA`, `en-US`…) to the locale dates are shown in; French by default. */
export const toDisplayLocale = (language?: string | null): DisplayLocale =>
  language?.toLowerCase().startsWith('en') ? 'en' : 'fr';

/**
 * Strings go through `parseISO`, which reads a date-only `YYYY-MM-DD` as local midnight — `new Date()`
 * would read it as UTC midnight and show the previous day anywhere west of Greenwich.
 */
const toDate = (value: DisplayDateInput): Date | null => {
  if (isNullish(value) || value === '') return null;

  const date = typeof value === 'string' ? parseISO(value.trim()) : new Date(value);
  return isValid(date) ? date : null;
};

const formatWith = (value: DisplayDateInput, locale: DisplayLocale, pick: (p: DisplayPatterns) => string): string => {
  const date = toDate(value);
  if (!date) return '';

  const patterns = PATTERNS[locale];
  return format(date, pick(patterns), { locale: patterns.locale });
};

/** `24 sept. 2026, 13 h 31` / `Sep 24, 2026, 13:31`; empty for a missing or unreadable value. */
export const formatDisplayDateTime = (value: DisplayDateInput, locale: DisplayLocale): string =>
  formatWith(value, locale, (p) => `${p.date}, ${p.time}`);

/** `24 sept. 2026` / `Sep 24, 2026`; empty for a missing or unreadable value. */
export const formatDisplayDate = (value: DisplayDateInput, locale: DisplayLocale): string =>
  formatWith(value, locale, (p) => p.date);

/** `13 h 31` / `13:31`; empty for a missing or unreadable value. */
export const formatDisplayTime = (value: DisplayDateInput, locale: DisplayLocale): string =>
  formatWith(value, locale, (p) => p.time);

/** `24 sept., 13 h 31` / `Sep 24, 13:31`: a moment inside a range, where the year is implied. */
export const formatDisplayDayMonthTime = (value: DisplayDateInput, locale: DisplayLocale): string =>
  formatWith(value, locale, (p) => `${p.dayMonth}, ${p.time}`);
