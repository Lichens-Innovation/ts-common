import { customizeValidator, type Localizer } from "@rjsf/validator-ajv8";
import localizer from "ajv-i18n";

const customFormats = {
  "phone-america": /^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
};

type ValidationLanguages = keyof typeof localizer;

/**
 * Builds an AJV validator for the given language. Pure (no React) so the caller
 * can memoize it. Prefer this + `useMemo` in the React layer: RJSF rebuilds its
 * `schemaUtils`/`retrieveSchema` cache from the validator identity, so a fresh
 * validator on every render recompiles every conditional (`allOf`/`if`/`then`)
 * subschema on each keystroke. See `RjsfPaperRenderer` for the memoized usage.
 */
export const createRjsfValidator = (language: string) => {
  const appLanguage = language as ValidationLanguages;
  const localizerFn: Localizer = localizer[appLanguage] ?? localizer.en;

  return customizeValidator({ customFormats }, localizerFn);
};

/**
 * Backward-compatible wrapper around {@link createRjsfValidator}. Not memoized —
 * returns a new validator on every call. Prefer `createRjsfValidator` memoized in
 * the React layer.
 */
export const useRjsfValidator = (language: string) => createRjsfValidator(language);
