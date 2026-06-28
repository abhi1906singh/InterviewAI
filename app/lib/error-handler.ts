export function getErrorStatus(error: unknown, fallback = 500): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    return Number((error as { status: number }).status);
  }

  return fallback;
}