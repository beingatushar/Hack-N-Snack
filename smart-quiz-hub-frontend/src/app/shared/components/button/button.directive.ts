import { Directive, HostBinding, Input } from '@angular/core';

export type ButtonVariant =
  | 'primary'    // main CTA — indigo→violet gradient
  | 'secondary'  // neutral outline
  | 'success'    // approve / positive
  | 'danger'     // destructive / reject
  | 'warning'    // submit / assign (amber)
  | 'accent'     // suggest / alternate (violet)
  | 'soft'       // low-emphasis tinted
  | 'ghost';     // text-only

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all ' +
  'whitespace-nowrap select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const SIZES: Record<ButtonSize, string> = {
  sm:        'h-8 px-3 text-xs',
  md:        'h-10 px-4 text-sm',
  lg:        'h-11 px-5 text-sm',
  icon:      'h-9 w-9 p-0 rounded-lg',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5',
  secondary: 'text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50',
  success:   'text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5',
  danger:    'text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5',
  warning:   'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100',
  accent:    'text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5',
  soft:      'text-indigo-700 bg-indigo-50 hover:bg-indigo-100',
  ghost:     'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
};

/**
 * Consistent, modern button styling applied to any native <button> or <a>.
 * Usage: <button appBtn="primary">Save</button> · <button appBtn="ghost" size="icon">…
 * Static layout classes on the element (e.g. w-full) are preserved.
 */
@Directive({
  selector: '[appBtn]',
  standalone: true,
})
export class ButtonDirective {
  @Input('appBtn') variant: ButtonVariant | '' = 'primary';
  @Input() size: ButtonSize = 'md';

  @HostBinding('class')
  get classes(): string {
    const variant = this.variant || 'primary';
    return `${BASE} ${SIZES[this.size]} ${VARIANTS[variant]}`;
  }
}
