import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnFilterComponent } from '../column-filter/column-filter.component';
import { FilterOption, SortState } from '../../utils/table-ops';

/**
 * One integrated, modern table-header cell: a clickable sort label (A→Z / Z→A)
 * with an optional inline filter funnel. Place the component's host inside a <th>.
 * Highlights indigo when the column is the active sort or has an active filter.
 */
@Component({
  selector: 'app-th-cell',
  standalone: true,
  imports: [ColumnFilterComponent],
  template: `
    <div class="flex items-center gap-1" [class.justify-end]="align === 'right'">
      @if (sortKey) {
        <button type="button" (click)="toggleSort()"
                class="inline-flex items-center gap-1 select-none text-[11px] font-bold uppercase tracking-wider transition-colors"
                [class.text-indigo-600]="isSorted"
                [class.text-slate-500]="!isSorted"
                [class.hover:text-slate-700]="!isSorted">
          {{ label }}
          <span class="material-icons text-[14px]"
                [class.text-indigo-600]="isSorted"
                [class.text-slate-300]="!isSorted">
            {{ isSorted ? (dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
          </span>
        </button>
      } @else {
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">{{ label }}</span>
      }

      @if (filterOptions) {
        <app-column-filter [label]="label" [options]="filterOptions"
                           [selected]="filterValue" (selectedChange)="filterChange.emit($event)" />
      }
    </div>
  `,
})
export class TableHeaderCellComponent {
  @Input() label = '';
  @Input() sortKey = '';
  @Input() sort: SortState | null = null;
  @Input() filterOptions: FilterOption[] | null = null;
  @Input() filterValue: string | null = null;
  @Input() align: 'left' | 'right' = 'left';

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() filterChange = new EventEmitter<string | null>();

  get isSorted(): boolean { return !!this.sortKey && this.sort?.key === this.sortKey; }
  get dir(): 'asc' | 'desc' { return this.sort?.dir ?? 'asc'; }

  toggleSort(): void {
    const dir: 'asc' | 'desc' = this.isSorted && this.sort!.dir === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key: this.sortKey, dir });
  }
}
