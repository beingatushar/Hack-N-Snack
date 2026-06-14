import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats an ISO timestamp as a human-readable relative time, e.g. "3 days ago",
 * "in 2 hours", "yesterday". Backed by the native Intl.RelativeTimeFormat (Story 3.2).
 *
 * Pure pipe: recomputes only when the input changes (sufficient for list views that
 * reload their data). Pair it with a tooltip showing the absolute timestamp.
 */
@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {

  private static readonly rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  private static readonly DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60,        unit: 'seconds' },
    { amount: 60,        unit: 'minutes' },
    { amount: 24,        unit: 'hours'   },
    { amount: 7,         unit: 'days'    },
    { amount: 4.34524,   unit: 'weeks'   },
    { amount: 12,        unit: 'months'  },
    { amount: Number.POSITIVE_INFINITY, unit: 'years' },
  ];

  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '';

    let duration = (date.getTime() - Date.now()) / 1000; // seconds; negative = past
    for (const division of RelativeTimePipe.DIVISIONS) {
      if (Math.abs(duration) < division.amount) {
        return RelativeTimePipe.rtf.format(Math.round(duration), division.unit);
      }
      duration /= division.amount;
    }
    return '';
  }
}
