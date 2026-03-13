import { customizeValidator, type Localizer } from "@rjsf/validator-ajv8";
import localizer from "ajv-i18n";

const customFormats = {
  "phone-america": /^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
};

type ValidationLanguages = keyof typeof localizer;

export const useRjsfValidator = (language: string) => {
  const appLanguage = language as ValidationLanguages;
  const localizerFn: Localizer = localizer[appLanguage] ?? localizer.en;

  return customizeValidator({ customFormats }, localizerFn);
};
