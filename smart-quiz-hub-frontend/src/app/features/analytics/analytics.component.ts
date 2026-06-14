import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  ViewChild, ElementRef, inject, signal, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AnalyticsOverview, QuestionAnalytics, ReviewerWorkload } from '../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit, AfterViewChecked, OnDestroy {
  private analyticsSvc = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('statusChart')     statusCanvasRef?:     ElementRef<HTMLCanvasElement>;
  @ViewChild('stackChart')      stackCanvasRef?:      ElementRef<HTMLCanvasElement>;
  @ViewChild('difficultyChart') difficultyCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart')      trendCanvasRef?:      ElementRef<HTMLCanvasElement>;

  overview  = signal<AnalyticsOverview | null>(null);
  questionAnalytics = signal<QuestionAnalytics | null>(null);
  workload  = signal<ReviewerWorkload[]>([]);
  loading   = signal(true);

  startDate = signal<string | null>(null);
  endDate   = signal<string | null>(null);

  protected readonly Math = Math;

  private charts: Chart[] = [];
  private chartsBuilt = false;

  private readonly STATUS_COLORS: Record<string, string> = {
    DRAFT:                  '#94a3b8',
    READY_FOR_REVIEW:       '#60a5fa',
    UNDER_REVIEW:           '#fbbf24',
    MODIFICATION_REQUESTED: '#a78bfa',
    APPROVED:               '#34d399',
    REJECTED:               '#f87171'
  };

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const range = { startDate: this.startDate(), endDate: this.endDate() };

    let overviewDone = false;
    let questionsDone = false;
    let workloadDone = false;

    const checkDone = () => {
      if (overviewDone && questionsDone && workloadDone) {
        this.loading.set(false);
        this.chartsBuilt = false; // reset so AfterViewChecked will rebuild them
        this.cdr.detectChanges();
      }
    };

    this.analyticsSvc.getOverview(range).subscribe(d => { this.overview.set(d); overviewDone = true; checkDone(); });
    this.analyticsSvc.getQuestionAnalytics(range).subscribe(d => { this.questionAnalytics.set(d); questionsDone = true; checkDone(); });
    this.analyticsSvc.getReviewerWorkload().subscribe(d => { this.workload.set(d); workloadDone = true; checkDone(); });
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

  ngAfterViewChecked(): void {
    if (!this.loading() && !this.chartsBuilt && this.statusCanvasRef) {
      this.chartsBuilt = true;
      this.buildCharts();
    }
  }

  private buildCharts(): void {
    const data = this.overview();
    if (!data) return;
    this.destroyCharts();

    // 1. Status doughnut
    if (this.statusCanvasRef) {
      const statusLabels = Object.keys(data.byStatus);
      this.charts.push(new Chart(this.statusCanvasRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: statusLabels.map(s => s.replace(/_/g, ' ')),
          datasets: [{
            data: statusLabels.map(k => data.byStatus[k]),
            backgroundColor: statusLabels.map(k => this.STATUS_COLORS[k] ?? '#a78bfa'),
            borderWidth: 2, borderColor: '#fff'
          }]
        },
        options: {
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } },
          cutout: '65%'
        }
      }));
    }

    // 2. Difficulty pie
    if (this.difficultyCanvasRef) {
      const diffLabels = Object.keys(data.byDifficulty);
      this.charts.push(new Chart(this.difficultyCanvasRef.nativeElement, {
        type: 'pie',
        data: {
          labels: diffLabels,
          datasets: [{
            data: diffLabels.map(k => data.byDifficulty[k]),
            backgroundColor: ['#34d399', '#fbbf24', '#f87171'],
            borderWidth: 2, borderColor: '#fff'
          }]
        },
        options: {
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } }
        }
      }));
    }

    // 3. Weekly trend line
    if (this.trendCanvasRef) {
      this.charts.push(new Chart(this.trendCanvasRef.nativeElement, {
        type: 'line',
        data: {
          labels: data.weeklyTrend.map(w => w.week),
          datasets: [{
            label: 'Questions created',
            data: data.weeklyTrend.map(w => w.count),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true, tension: 0.4, pointRadius: 4,
            pointBackgroundColor: '#6366f1'
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      }));
    }

    // 4. Stack bar (horizontal)
    if (this.stackCanvasRef) {
      const stackLabels = Object.keys(data.byStack);
      this.charts.push(new Chart(this.stackCanvasRef.nativeElement, {
        type: 'bar',
        data: {
          labels: stackLabels,
          datasets: [{
            label: 'Questions',
            data: stackLabels.map(k => data.byStack[k]),
            backgroundColor: '#818cf8', borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      }));
    }
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  ngOnDestroy(): void { this.destroyCharts(); }

  totalQuestions(): number {
    const d = this.overview();
    return d ? Object.values(d.byStatus).reduce((a, b) => a + b, 0) : 0;
  }

  approvedCount(): number { return this.overview()?.byStatus['APPROVED'] ?? 0; }

  pendingCount(): number {
    const d = this.overview();
    return d ? (d.byStatus['READY_FOR_REVIEW'] ?? 0) + (d.byStatus['UNDER_REVIEW'] ?? 0) : 0;
  }

  maxWorkload(): number {
    const w = this.workload();
    return w.length ? w[0].pendingCount : 1;
  }
}
