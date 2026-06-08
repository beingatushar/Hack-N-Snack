import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { McqService } from '../../core/services/mcq.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  mcqService = inject(McqService);
  auth       = inject(AuthService);

  stats   = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.mcqService.getDashboardStats().subscribe({
      next: res => { this.stats.set(res.data); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  get statCards() {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Total Questions', value: s.totalQuestions,      icon: 'quiz',         color: '#6366F1' },
      { label: 'Draft',           value: s.draftCount,          icon: 'edit_note',    color: '#94A3B8' },
      { label: 'Ready for Review',value: s.readyForReviewCount, icon: 'pending',      color: '#F59E0B' },
      { label: 'Under Review',    value: s.underReviewCount,    icon: 'rate_review',  color: '#3B82F6' },
      { label: 'Approved',        value: s.approvedCount,       icon: 'check_circle', color: '#10B981' },
      { label: 'Rejected',        value: s.rejectedCount,       icon: 'cancel',       color: '#EF4444' },
    ];
  }
}
