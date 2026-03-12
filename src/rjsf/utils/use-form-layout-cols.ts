import { isNullish } from "~/utils/types.utils";

type FormLayoutContext = {
  labelCol?: { span: number };
  wrapperCol?: { span: number };
};

const DEFAULT_SPAN = 24;

// TODO: RJSF-002: hook vs not hook prefix
export const useFormLayoutCols = (formContext?: unknown): FormLayoutContext => {
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
