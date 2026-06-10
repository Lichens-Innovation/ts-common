import type { WidgetProps } from "@rjsf/utils";
import { isBlank } from "../../utils/string.utils";
import { isNullish } from "../../utils/types.utils";

/**
 * Returns true when the widget has at least one validation error from RJSF.
 *
 * @param rawErrors - The rawErrors from WidgetProps (often `unknown`).
 * @returns true if rawErrors is a non-empty array.
 */
export const hasRjsfErrors = (rawErrors: unknown): boolean => Array.isArray(rawErrors) && rawErrors.length > 0;

export interface GetRjsfDisplayLabelArgs {
  label?: string;
  required?: boolean;
  hideLabel?: boolean;
}

/**
 * Returns the label to display for an RJSF widget, with optional required asterisk and
 * hideLabel support.
 *
 * @param label - The label to display for the widget.
 * @param required - Whether the field is required.
 * @param hideLabel - Whether to hide the label.
 *
 * @returns The label to display for the widget.
 */
export const getRjsfDisplayLabel = ({ label, required, hideLabel }: GetRjsfDisplayLabelArgs): string | undefined => {
  if (hideLabel) return undefined;
  if (isBlank(label)) return undefined;

  const requiredSuffix = required ? " *" : "";
  return `${label}${requiredSuffix}`;
};

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Reads the `labelColor` from a widget/field `ui:options` object.
 *
 * @param options - The `ui:options` object (e.g. WidgetProps.options or uiSchema["ui:options"]).
 * @returns A validated hex color string (#RGB or #RRGGBB), or undefined when missing/invalid (default color).
 */
export const getRjsfLabelColor = (options?: Record<string, unknown> | null): string | undefined => {
  const color = options?.labelColor;
  if (typeof color !== "string") return undefined;
  const trimmed = color.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : undefined;
};

interface EnumOption {
  value: string;
  label: string;
}

export type EnumOptionDisplay = { label: string; value: string };

const toEnumOptionDisplay = (o: EnumOption): EnumOptionDisplay => ({
  label: o?.label ?? String(o?.value ?? ""),
  value: String(o?.value ?? ""),
});

export const mapEnumOptions = (options: WidgetProps["options"]): EnumOptionDisplay[] => {
  const enumOptions = options?.enumOptions as EnumOption[] | undefined;
  if (!Array.isArray(enumOptions)) return [];
  return enumOptions.map(toEnumOptionDisplay);
};

/**
 * Converts a value to display string, or empty string when null/undefined.
 */
export const toStringOrEmpty = (value: unknown): string => (isNullish(value) ? "" : String(value));

/**
 * Converts a value to display string, or undefined when null/undefined (e.g. for select placeholder).
 */
export const toStringOrUndefined = (value: unknown): string | undefined =>
  isNullish(value) ? undefined : String(value);

export interface GetRjsfTextChangeValueArgs {
  text: string;
  emptyValue?: unknown;
}

/**
 * Returns the value to pass to onChange for a text input.
 *
 * @param args.text - The current text input value.
 * @param args.emptyValue - The value to use when text is empty (e.g. options.emptyValue from WidgetProps).
 * @returns emptyValue when text is empty, otherwise text.
 */
export const getRjsfTextChangeValue = ({ text, emptyValue }: GetRjsfTextChangeValueArgs): unknown => {
  if (text === "") return emptyValue;
  return text;
};

export const parseDateOrNull = (value?: string): Date | null => {
  if (isBlank(value)) return null;

  const date = new Date(value);
  const isValid = !Number.isNaN(date.getTime());
  return isValid ? date : null;
};

/** Returns YYYY-MM-DD for JSON Schema "date" format (form storage). */
export const dateToDateOnlyString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a date-only or full ISO string into a Date at local midnight (for date picker display). */
export const parseDateOnlyToLocalDate = (value?: string): Date | null => {
  if (isBlank(value)) return null;

  const trimmed = String(value).trim();
  const dateOnly = trimmed.slice(0, 10);
  if (!DATE_ONLY_REGEX.test(dateOnly)) return null;

  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Extracts date-only YYYY-MM-DD for display from a full ISO or date-only string. */
export const formatDateOnlyForDisplay = (value?: string): string => {
  if (isBlank(value)) return "";

  const trimmed = String(value).trim();
  const dateOnly = trimmed.slice(0, 10);
  return DATE_ONLY_REGEX.test(dateOnly) ? dateOnly : "";
};

/** Formats a full ISO or date string for date-time display (locale string). */
export const formatDateTimeForDisplay = (value?: string): string => {
  const date = parseDateOrNull(value);
  return date ? date.toLocaleString() : "";
};

type FormLayoutContext = {
  labelCol?: { span: number };
  wrapperCol?: { span: number };
};

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
