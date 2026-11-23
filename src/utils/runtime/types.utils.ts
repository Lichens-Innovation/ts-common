export const NO_OP: () => void = () => {};

export const isNullish = (value: unknown): value is null | undefined =>
  // eslint-disable-next-line coding-guide/prefer-nullish-helpers -- isNullish is the helper itself, it cannot call itself
  value === null || value === undefined;

export const isNumber = (value?: unknown | null): value is number => {
  if (isNullish(value)) {
    return false;
  }

  if (typeof value !== 'number') {
    return false;
  }

  if (isNaN(value)) {
    return false;
  }

  return true;
};

export const isString = (value?: unknown | null): value is string => {
  if (isNullish(value)) {
    return false;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return true;
};
