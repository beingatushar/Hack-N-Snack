import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ReviewService } from '../../../core/services/review.service';
import { SnackService } from '../../../core/services/snack.service';
import { McqResponse } from '../../../core/models';

@Component({
  selector: 'app-pending-reviews',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatProgressSpinnerModule,
    MatExpansionModule, MatTooltipModule,
    FormsModule, NgClass
  ],
  templateUrl: './pending-reviews.component.html',
  styleUrl: './pending-reviews.component.scss'
})
export class PendingReviewsComponent implements OnInit {
  private reviewSvc = inject(ReviewService);
  private snack     = inject(SnackService);

  questions     = signal<McqResponse[]>([]);
  loading       = signal(true);
  totalElements = signal(0);
  page          = signal(0);

  activeReview  = signal<number | null>(null);
  reviewComments: Record<number, string> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reviewSvc.getPendingReviews(this.page(), 10).subscribe({
      next: res => {
        this.questions.set(res.data.content);
        this.totalElements.set(res.data.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.load();
  }

  optionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  approve(q: McqResponse): void {
    this.reviewSvc.submitReview(q.id, { decision: 'APPROVED' }).subscribe({
      next: () => { this.snack.success('Question approved'); this.load(); },
      error: err => this.snack.error(err.error?.message ?? 'Failed')
    });
  }

  reject(q: McqResponse): void {
    const comments = this.reviewComments[q.id];
    if (!comments?.trim()) {
      this.snack.error('Please provide feedback comments before rejecting');
      return;
    }
    this.reviewSvc.submitReview(q.id, { decision: 'REJECTED', comments }).subscribe({
      next: () => { this.snack.success('Question rejected with feedback'); this.load(); },
      error: err => this.snack.error(err.error?.message ?? 'Failed')
    });
  }
}
