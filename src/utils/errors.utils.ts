export const getErrorMessage = (error: unknown): string => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }

  return JSON.stringify(error);
};
