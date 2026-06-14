import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { SmeReport, SmeUserResponse } from '../../../core/models';

/** Combines the SME roster (email, stacks) with their performance report (Story 2.1). */
export interface SmeReportRow {
  sme: SmeUserResponse;
  report?: SmeReport;
}

@Component({
  selector: 'app-sme-management',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './sme-management.component.html',
  styleUrl: './sme-management.component.scss'
})
export class SmeManagementComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private analyticsSvc = inject(AnalyticsService);

  rows    = signal<SmeReportRow[]>([]);
  loading = signal(true);

  startDate = signal<string | null>(null);
  endDate   = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const range = { startDate: this.startDate(), endDate: this.endDate() };
    forkJoin({
      smes: this.adminSvc.getAllSmes(),
      reports: this.analyticsSvc.getSmeReports(range)
    }).subscribe({
      next: ({ smes, reports }) => {
        const byId = new Map<number, SmeReport>(reports.map(r => [r.smeId, r]));
        this.rows.set(smes.data.map(sme => ({ sme, report: byId.get(sme.id) })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyRange(): void {
    this.load();
  }

  resetRange(): void {
    this.startDate.set(null);
    this.endDate.set(null);
    this.load();
  }

  get hasRange(): boolean {
    return !!(this.startDate() || this.endDate());
  }

  turnaroundLabel(hours: number | null | undefined): string {
    if (hours == null) return '—';
    if (hours < 1) return Math.round(hours * 60) + 'm';
    if (hours < 48) return Math.round(hours) + 'h';
    return Math.round(hours / 24) + 'd';
  }
}
