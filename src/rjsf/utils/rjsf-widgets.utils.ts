import type { WidgetProps } from '@rjsf/utils';
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayTime,
  type DisplayLocale,
} from '../../utils/date/date-display.utils';
import { isBlank } from '../../utils/string/string.utils';
import { isNullish } from '../../utils/runtime/types.utils';

export const hasRjsfErrors = (rawErrors: unknown): boolean => Array.isArray(rawErrors) && rawErrors.length > 0;

export interface GetRjsfDisplayLabelArgs {
  label?: string;
  required?: boolean;
  hideLabel?: boolean;
}

export const getRjsfDisplayLabel = ({ label, required, hideLabel }: GetRjsfDisplayLabelArgs): string | undefined => {
  if (hideLabel) return undefined;
  if (isBlank(label)) return undefined;

  const requiredSuffix = required ? ' *' : '';
  return `${label}${requiredSuffix}`;
};

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** habit-hooks-disable non-essential-comment
 * Reads `labelColor` from `ui:options`. Only #RGB / #RRGGBB hex is accepted; anything else yields
 * undefined so the widget keeps its default color.
 */
export const getRjsfLabelColor = (options?: Record<string, unknown> | null): string | undefined => {
  const color = options?.labelColor;
  if (typeof color !== 'string') return undefined;
  const trimmed = color.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : undefined;
};

interface EnumOption {
  value: string;
  label: string;
}

export interface EnumOptionDisplay {
  label: string;
  value: string;
}

const toEnumOptionDisplay = (o: EnumOption): EnumOptionDisplay => ({
  label: o?.label ?? String(o?.value ?? ''),
  value: String(o?.value ?? ''),
});

export const mapEnumOptions = (options: WidgetProps['options']): EnumOptionDisplay[] => {
  const enumOptions = options?.enumOptions as EnumOption[] | undefined;
  if (!Array.isArray(enumOptions)) return [];
  return enumOptions.map(toEnumOptionDisplay);
};

export const toStringOrEmpty = (value: unknown): string => (isNullish(value) ? '' : String(value));

export const toStringOrUndefined = (value: unknown): string | undefined =>
  isNullish(value) ? undefined : String(value);

export interface GetRjsfTextChangeValueArgs {
  text: string;
  emptyValue?: unknown;
}

export const getRjsfTextChangeValue = ({ text, emptyValue }: GetRjsfTextChangeValueArgs): unknown => {
  if (isBlank(text)) return emptyValue;
  return text;
};

export const parseDateOrNull = (value?: string): Date | null => {
  if (isBlank(value)) return null;

  const date = new Date(value);
  const isValid = !Number.isNaN(date.getTime());
  return isValid ? date : null;
};

export const dateToDateOnlyString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** habit-hooks-disable non-essential-comment
 * Keeps only the date part of a full ISO string and builds the Date at LOCAL midnight, so the picker
 * never shows the previous day in timezones behind UTC.
 */
export const parseDateOnlyToLocalDate = (value?: string): Date | null => {
  if (isBlank(value)) return null;

  const trimmed = String(value).trim();
  const dateOnly = trimmed.slice(0, 10);
  if (!DATE_ONLY_REGEX.test(dateOnly)) return null;

  const [y, m, d] = dateOnly.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** habit-hooks-disable non-essential-comment
 * The date of a full ISO or date-only string, for display. With a locale it reads `24 sept. 2026`;
 * without one it stays the raw YYYY-MM-DD.
 */
export const formatDateOnlyForDisplay = (value?: string, locale?: DisplayLocale): string => {
  if (isBlank(value)) return '';

  const trimmed = String(value).trim();
  const dateOnly = trimmed.slice(0, 10);
  if (!DATE_ONLY_REGEX.test(dateOnly)) return '';
  return locale ? formatDisplayDate(parseDateOnlyToLocalDate(dateOnly), locale) : dateOnly;
};

/** habit-hooks-disable non-essential-comment
 * A full ISO or date string for date-time display. With a locale it reads `24 sept. 2026, 13 h 31`;
 * without one it falls back to the engine's `toLocaleString()`.
 */
export const formatDateTimeForDisplay = (value?: string, locale?: DisplayLocale): string => {
  const date = parseDateOrNull(value);
  if (!date) return '';
  return locale ? formatDisplayDateTime(date, locale) : date.toLocaleString();
};

/** habit-hooks-disable non-essential-comment
 * Time-only fields : a clock reading with no day behind it — the date is entered once in
 * the form header and each reading row carries only HH:MM.
 *
 * Stored as HH:MM:SS because that is what JSON Schema's "time" format accepts; ajv-formats rejects a
 * bare HH:MM. The offset is deliberately omitted, which that format allows: a time-only value must
 * survive sync and display untouched by any timezone, so it is read and written through the LOCAL
 * clock fields, never through toISOString(). Seconds are always :00 — the native iOS and Android
 * pickers cannot enter them, and seconds were dropped from the feature for that reason — but they
 * are parsed when present so a value entered on web round-trips.
 */
const TIME_ONLY_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

export const timeToTimeOnlyString = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}:00`;
};

/** habit-hooks-disable non-essential-comment
 * Parses HH:MM or HH:MM:SS into a Date for the picker to open on.
 *
 * Anchored on TODAY rather than a fixed epoch date: the picker needs a Date, and a time that does
 * not exist on the anchor day — 02:30 on a spring-forward date — would be silently shifted by an
 * hour. Today is the one day the reading is being taken on, so it always exists.
 */
export const parseTimeOnlyToLocalDate = (value?: string): Date | null => {
  if (isBlank(value)) return null;

  const matches = TIME_ONLY_REGEX.exec(String(value).trim());
  if (!matches) return null;

  const [, h, m, s] = matches;
  const anchor = new Date();
  anchor.setHours(Number(h), Number(m), Number(s ?? 0), 0);
  return anchor;
};

/** habit-hooks-disable non-essential-comment
 * A stored time-only string for display. Seconds are never shown. With a locale it reads `13 h 31` /
 * `13:31`; without one it stays the raw HH:MM.
 */
export const formatTimeOnlyForDisplay = (value?: string, locale?: DisplayLocale): string => {
  if (isBlank(value)) return '';

  const trimmed = String(value).trim();
  if (!TIME_ONLY_REGEX.test(trimmed)) return '';
  return locale ? formatDisplayTime(parseTimeOnlyToLocalDate(trimmed), locale) : trimmed.slice(0, 5);
};

export interface FormLayoutColSpan {
  span: number;
}

export interface FormLayoutContext {
  labelCol?: FormLayoutColSpan;
  wrapperCol?: FormLayoutColSpan;
}

const DEFAULT_SPAN = 24;

export const getFormLayoutCols = (formContext?: unknown): FormLayoutContext => {
  if (isNullish(formContext)) {
    return {
      labelCol: { span: DEFAULT_SPAN },
      wrapperCol: { span: DEFAULT_SPAN },
    };
  }

  const { labelCol, wrapperCol } = formContext as FormLayoutContext;
  return {
    labelCol: labelCol ?? { span: DEFAULT_SPAN },
    wrapperCol: wrapperCol ?? { span: DEFAULT_SPAN },
  };
};
