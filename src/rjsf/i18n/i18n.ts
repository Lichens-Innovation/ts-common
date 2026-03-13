import type { i18n } from "i18next";

import en from "./en/rjsf.json";
import fr from "./fr/rjsf.json";

const NAMESPACE = "rjsf";

export const initRjsf = (i18next: i18n): void => {
  if (!i18next.isInitialized) {
    throw new Error("[initRjsf] i18next must be initialized before calling initRjsf. Call initI18N() or i18next.init() first.");
  }

  if (i18next.hasResourceBundle("en", NAMESPACE)) return;

  const isDeep = true;
  const isOverwrite = true;

  i18next.addResourceBundle("en", NAMESPACE, en.rjsf, isDeep, isOverwrite);
  i18next.addResourceBundle("fr", NAMESPACE, fr.rjsf, isDeep, isOverwrite);

  // eslint-disable-next-line no-console
  console.info('[initRjsf] RJSF i18n initialized');  
};
