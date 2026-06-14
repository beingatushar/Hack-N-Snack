import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { FilterOption } from '../../utils/table-ops';

/**
 * Compact per-column filter: a funnel icon that opens a single-select menu.
 * Highlighted when a value is active. Emits null for "All".
 */
@Component({
  selector: 'app-column-filter',
  standalone: true,
  imports: [MatMenuModule],
  template: `
    <button type="button" [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()"
            class="inline-flex items-center justify-center w-5 h-5 rounded transition-colors"
            [class.text-indigo-600]="selected != null"
            [class.text-slate-300]="selected == null"
            [class.hover:text-slate-500]="selected == null"
            [attr.aria-label]="'Filter ' + label">
      <span class="material-icons text-[15px]">{{ selected != null ? 'filter_alt' : 'filter_list' }}</span>
    </button>

    <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="pick(null)">
        <span class="material-icons text-[16px] mr-2 align-middle" [class.opacity-0]="selected != null">check</span>
        <span class="align-middle">All</span>
      </button>
      @for (o of options; track o.value) {
        <button mat-menu-item (click)="pick(o.value)">
          <span class="material-icons text-[16px] mr-2 align-middle" [class.opacity-0]="selected !== o.value">check</span>
          <span class="align-middle">{{ o.label }}</span>
        </button>
      }
    </mat-menu>
  `,
})
export class ColumnFilterComponent {
  @Input() label = '';
  @Input() options: FilterOption[] = [];
  @Input() selected: string | null = null;
  @Output() selectedChange = new EventEmitter<string | null>();

  pick(value: string | null): void {
    this.selectedChange.emit(value);
  }
}
