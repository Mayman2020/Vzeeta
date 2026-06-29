/** Default list ordering: newest records first. */
export const DEFAULT_LIST_SORT = 'createdAt,desc';

/** Default rows per table page (matches Property contract-list). */
export const DEFAULT_TABLE_PAGE_SIZE = 10;

export function withPageParams(
  page: number,
  size: number,
  extra?: Record<string, string | number | boolean | null | undefined>
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    page,
    size,
    sort: DEFAULT_LIST_SORT
  };
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value as string | number | boolean;
      }
    }
  }
  return params;
}
