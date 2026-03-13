import { replaceStringParameters } from "@rjsf/utils";
import { i18n } from "i18next";
import { isBlank } from "~/utils/string.utils";

/** Maps RJSF TranslatableString values to our i18n keys (rjsf namespace). */
export const RJSF_STRING_TO_I18N_KEY: Record<string, string> = {
  "Add Item": "rjsf:addItem",
  Add: "rjsf:add",
  Copy: "rjsf:copy",
  "Move down": "rjsf:moveDown",
  "Move up": "rjsf:moveUp",
  Remove: "rjsf:remove",
  "clear input": "rjsf:clear",
  "%1 Key": "rjsf:keyLabel", // TODO: RJSF-001 find a way to dynamicaly resolve the rjsf-i18n.utils "%1 Key" pattern
  Yes: "rjsf:yes",
  No: "rjsf:no",
  Errors: "rjsf:errors",
};

interface TranslateStringArgs {
  i18n: i18n;
  stringToTranslate: string;
  params?: string[];
}

export const translateRjsfString = ({ stringToTranslate, params, i18n }: TranslateStringArgs): string => {
  const i18nKey = RJSF_STRING_TO_I18N_KEY[stringToTranslate];
  if (isBlank(i18nKey)) {
    // eslint-disable-next-line no-console
    console.warn(`[translateRjsfString] RJSF i18n: missing key: "${stringToTranslate}"`);
  }

  const translated = i18nKey ? i18n.t(i18nKey) : stringToTranslate;
  return replaceStringParameters(translated, params);
};
