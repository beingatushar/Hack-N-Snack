import { Component, Inject, Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ButtonDirective } from '../button/button.directive';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  icon?: string;
}

const ICON_BY_VARIANT: Record<string, string> = {
  danger: 'warning',
  warning: 'help_outline',
  primary: 'help_outline',
};
const TINT_BY_VARIANT: Record<string, string> = {
  danger: 'bg-rose-50 text-rose-600',
  warning: 'bg-amber-50 text-amber-600',
  primary: 'bg-indigo-50 text-indigo-600',
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, ButtonDirective],
  template: `
    <div class="p-6 sm:p-7 max-w-md animate-scale-in">
      <div class="flex items-start gap-4">
        <div [class]="'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ' + tint">
          <span class="material-icons text-[24px]" aria-hidden="true">{{ data.icon || iconName }}</span>
        </div>
        <div class="min-w-0 pt-0.5">
          <h2 class="text-lg font-extrabold text-slate-800 tracking-tight">{{ data.title }}</h2>
          <p class="text-sm text-slate-500 mt-1.5 leading-relaxed whitespace-pre-line">{{ data.message }}</p>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 mt-7">
        <button appBtn="ghost" (click)="close(false)">{{ data.cancelText || 'Cancel' }}</button>
        <button [appBtn]="data.variant === 'danger' ? 'danger' : 'primary'" (click)="close(true)" cdkFocusInitial>
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  iconName: string;
  tint: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmOptions,
    private ref: MatDialogRef<ConfirmDialogComponent, boolean>,
  ) {
    const v = data.variant || 'danger';
    this.iconName = ICON_BY_VARIANT[v];
    this.tint = TINT_BY_VARIANT[v];
  }

  close(result: boolean): void {
    this.ref.close(result);
  }
}

/** Inject and call `await confirm.ask({...})` → resolves true/false. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private dialog = inject(MatDialog);

  ask(opts: ConfirmOptions): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: opts,
      panelClass: 'confirm-dialog',
      autoFocus: false,
      width: '460px',
      maxWidth: '92vw',
    });
    return firstValueFrom(ref.afterClosed()).then(r => r === true);
  }
}
