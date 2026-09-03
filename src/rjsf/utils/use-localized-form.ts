import { isBlank } from '../../utils/string.utils';
import { useTranslation } from 'react-i18next';
import type { LocalizedFormSchema, MetaFormSchema } from './rjsf-i18n-types';

const DEFAULT_LANGUAGE = 'fr';

// i18n.language can be 'fr-CA', so we take the first part
const parseSimplifiedLangCode = (language?: string): string => {
  if (isBlank(language)) return DEFAULT_LANGUAGE;
  return language.split('-')[0];
};

const getFallbackLanguage = (metaFormSchema: MetaFormSchema): string => {
  return Object.keys(metaFormSchema.i18n)[0] ?? DEFAULT_LANGUAGE;
};

export const useLocalizedForm = (metaFormSchema: MetaFormSchema): LocalizedFormSchema => {
  const { i18n } = useTranslation();
  const language = parseSimplifiedLangCode(i18n.language);

  if (metaFormSchema.i18n[language]) {
    return metaFormSchema.i18n[language];
  }

  const fallbackLanguage = getFallbackLanguage(metaFormSchema);

  return metaFormSchema.i18n[fallbackLanguage];
};
