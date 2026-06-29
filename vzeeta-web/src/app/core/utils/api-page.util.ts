export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
}

export function unwrapPage<T>(data: unknown): T[] {
  return parsePageResponse<T>(data).content;
}

export function parsePageResponse<T>(data: unknown): PagedResult<T> {
  const empty: PagedResult<T> = { content: [], totalElements: 0, number: 0, size: 0 };
  if (!data) return empty;
  if (Array.isArray(data)) {
    return { content: data as T[], totalElements: data.length, number: 0, size: data.length };
  }
  if (typeof data === 'object' && data !== null) {
    const record = data as Record<string, unknown>;
    const content = Array.isArray(record['content']) ? (record['content'] as T[]) : [];
    return {
      content,
      totalElements: Number(record['totalElements'] ?? content.length),
      number: Number(record['number'] ?? 0),
      size: Number(record['size'] ?? content.length)
    };
  }
  return empty;
}
