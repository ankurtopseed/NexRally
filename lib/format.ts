export function formatDateLabel(date?: string | null): string {
  if (!date) return "DATE TO BE ANNOUNCED";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "DATE TO BE ANNOUNCED"
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

export function normalizeList<T>(
  response: T[] | { items?: T[]; results?: T[] } | null | undefined,
): T[] {
  if (Array.isArray(response)) return response;
  return response?.items ?? response?.results ?? [];
}
