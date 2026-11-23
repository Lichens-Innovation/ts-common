import type { RJSFSchema, TranslatableString, UiSchema } from '@rjsf/utils';

export type Language = string;

export interface RjsfRegistryWithTranslate {
  translateString: (s: TranslatableString) => string;
}

export interface LocalizedFormSchema {
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

export interface MetaFormSchema {
  id: string;
  version: string;
  i18n: Record<Language, LocalizedFormSchema>;
}
