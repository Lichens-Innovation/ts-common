import { customizeValidator, type Localizer } from "@rjsf/validator-ajv8";
import localizer from "ajv-i18n";
import { useMemo } from "react";

const customFormats = {
  "phone-america": /^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
};

type ValidationLanguages = keyof typeof localizer;

/**
 * Returns a memoized AJV validator, rebuilt only when the language changes.
 *
 * `customizeValidator` spins up a fresh AJV instance with a cold schema cache.
 * RJSF resolves conditional (`allOf`/`if`/`then`) visibility by running the
 * validator against the schema on every change, and builds its own
 * `schemaUtils` (with the `retrieveSchema` cache) from the validator identity.
 * Recreating the validator each render therefore recompiles every conditional
 * subschema and discards RJSF's resolution cache on every keystroke. Memoizing
 * keeps both caches warm across changes.
 */
export const useRjsfValidator = (language: string) => {
  return useMemo(() => {
    const appLanguage = language as ValidationLanguages;
    const localizerFn: Localizer = localizer[appLanguage] ?? localizer.en;
    return customizeValidator({ customFormats }, localizerFn);
  }, [language]);
};
