import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AnalyticsOverview, ApiResponse, ReviewerWorkload } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/analytics`;

  getOverview(): Observable<AnalyticsOverview> {
    return this.http
      .get<ApiResponse<AnalyticsOverview>>(`${this.base}/overview`)
      .pipe(map(r => r.data));
  }

  getReviewerWorkload(): Observable<ReviewerWorkload[]> {
    return this.http
      .get<ApiResponse<ReviewerWorkload[]>>(`${this.base}/reviewer-workload`)
      .pipe(map(r => r.data));
  }
}
