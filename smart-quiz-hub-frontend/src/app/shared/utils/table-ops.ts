// Generic, framework-agnostic helpers for client-side table sorting & filtering.

export type SortDir = 'asc' | 'desc';

export interface SortState {
  key: string;
  dir: SortDir;
}

export interface FilterOption {
  value: string;
  label: string;
}

/** Locale-aware comparison; null/empty values sort last. */
export function compareValues(a: unknown, b: unknown): number {
  const aEmpty = a == null || a === '';
  const bEmpty = b == null || b === '';
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function applySort<T>(rows: T[], sort: SortState | null, value: (row: T, key: string) => unknown): T[] {
  if (!sort) return rows;
  const factor = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort((x, y) => factor * compareValues(value(x, sort.key), value(y, sort.key)));
}

/** Keep rows matching every active (non-null) filter. Exact string match per column. */
export function applyFilters<T>(rows: T[], filters: Record<string, string | null>, value: (row: T, key: string) => unknown): T[] {
  const active = Object.entries(filters).filter(([, v]) => v != null && v !== '');
  if (active.length === 0) return rows;
  return rows.filter(row => active.every(([key, v]) => String(value(row, key)) === String(v)));
}

/** Distinct, sorted filter options derived from the data for a column. */
export function distinctOptions<T>(rows: T[], value: (row: T, key: string) => unknown, key: string): FilterOption[] {
  const set = new Set<string>();
  rows.forEach(row => {
    const v = value(row, key);
    if (v != null && v !== '') set.add(String(v));
  });
  return [...set].sort((a, b) => a.localeCompare(b)).map(v => ({ value: v, label: v }));
}
