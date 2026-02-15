export const getCurrentUrl = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
};
