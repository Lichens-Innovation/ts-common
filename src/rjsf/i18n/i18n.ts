import type { i18n } from "i18next";

import en from "./en/rjsf.json";
import fr from "./fr/rjsf.json";

const RJSF_NAMESPACE = "rjsf";

export const addResourceBundleForRjsf = (instance: i18n): void => {
  if (!instance?.isInitialized) {
    throw new Error("[addResourceBundleForRjsf] i18next must be initialized prior to calling this method. Call initI18N() or i18next.init() first.");
  }

  if (instance.hasResourceBundle("en", RJSF_NAMESPACE)) return;

  const isDeep = true;
  const isOverwrite = true;

  instance.addResourceBundle("en", RJSF_NAMESPACE, en.rjsf, isDeep, isOverwrite);
  instance.addResourceBundle("fr", RJSF_NAMESPACE, fr.rjsf, isDeep, isOverwrite);

  // Note: if ever we get duplicated instances of react-i18next, we will need to register the
  // instance provided by this ts-common package like so:
  // import { initReactI18next } from 'react-i18next'
  // instance.use(initReactI18next);

  // eslint-disable-next-line no-console
  console.info('[addResourceBundleForRjsf] RJSF i18n initialized');  
};
