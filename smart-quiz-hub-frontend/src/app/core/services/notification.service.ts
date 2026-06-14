import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, AppNotification, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/notifications`;

  getNotifications(page = 0, size = 20): Observable<PagedResponse<AppNotification>> {
    return this.http
      .get<ApiResponse<PagedResponse<AppNotification>>>(`${this.base}?page=${page}&size=${size}`)
      .pipe(map(r => r.data));
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${this.base}/unread-count`)
      .pipe(map(r => r.data ?? 0));
  }

  markRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.post<void>(`${this.base}/read-all`, {});
  }
}
