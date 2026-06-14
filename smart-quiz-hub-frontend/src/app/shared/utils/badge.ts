// Tailwind class helpers for status / difficulty badges (replaces global SCSS classes).
// Literal class strings live here so Tailwind's content scanner picks them up.

const BADGE_BASE = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide';

const STATUS_CLASSES: Record<string, string> = {
  DRAFT:                  'bg-slate-100 text-slate-600',
  READY_FOR_REVIEW:       'bg-amber-50 text-amber-700 border border-amber-200',
  UNDER_REVIEW:           'bg-blue-50 text-blue-700 border border-blue-200',
  MODIFICATION_REQUESTED: 'bg-violet-50 text-violet-700 border border-violet-200',
  APPROVED:               'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED:               'bg-rose-600 text-white shadow-sm shadow-rose-500/40',
};

const DIFF_CLASSES: Record<string, string> = {
  EASY:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
  HARD:   'bg-rose-50 text-rose-700 border border-rose-200',
};

export function statusBadgeClass(status: string): string {
  return `${BADGE_BASE} ${STATUS_CLASSES[status] ?? 'bg-slate-100 text-slate-600'}`;
}

export function difficultyBadgeClass(difficulty: string): string {
  return `${BADGE_BASE} ${DIFF_CLASSES[difficulty] ?? 'bg-slate-100 text-slate-600'}`;
}

export function statusLabel(status: string): string {
  return status.replaceAll('_', ' ');
}
