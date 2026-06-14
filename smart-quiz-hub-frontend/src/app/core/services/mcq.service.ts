import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApiResponse, PagedResponse, McqResponse, McqRequest,
  DashboardStats, BulkUploadResponse, McqStatus, Difficulty
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class McqService {
  private base = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {}

  createQuestion(req: McqRequest): Observable<ApiResponse<McqResponse>> {
    return this.http.post<ApiResponse<McqResponse>>(this.base, req);
  }

  updateQuestion(id: number, req: McqRequest): Observable<ApiResponse<McqResponse>> {
    return this.http.put<ApiResponse<McqResponse>>(`${this.base}/${id}`, req);
  }

  getQuestion(id: number): Observable<ApiResponse<McqResponse>> {
    return this.http.get<ApiResponse<McqResponse>>(`${this.base}/${id}`);
  }

  getMyQuestions(status?: McqStatus, page = 0, size = 10): Observable<ApiResponse<PagedResponse<McqResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PagedResponse<McqResponse>>>(`${this.base}/my`, { params });
  }

  getAllQuestions(filters: { status?: McqStatus; stackId?: number; difficulty?: Difficulty; page?: number; size?: number }):
    Observable<ApiResponse<PagedResponse<McqResponse>>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 10);
    if (filters.status)     params = params.set('status', filters.status);
    if (filters.stackId)    params = params.set('stackId', filters.stackId);
    if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
    return this.http.get<ApiResponse<PagedResponse<McqResponse>>>(this.base, { params });
  }

  submitForReview(id: number): Observable<ApiResponse<McqResponse>> {
    return this.http.post<ApiResponse<McqResponse>>(`${this.base}/${id}/submit`, {});
  }

  deleteQuestion(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.base}/dashboard/stats`);
  }

  bulkUpload(file: File): Observable<ApiResponse<BulkUploadResponse>> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<BulkUploadResponse>>(`${this.base}/bulk-upload`, form);
  }

  /** Downloads the XLSX import template (same layout as export). */
  downloadImportTemplate(): Observable<Blob> {
    return this.http.get(`${this.base}/import-template`, { responseType: 'blob' });
  }

  searchQuestions(query: string): Observable<McqResponse[]> {
    const params = new HttpParams().set('q', query);
    return this.http
      .get<ApiResponse<McqResponse[]>>(`${this.base}/search`, { params })
      .pipe(map(r => r.data ?? []));
  }

  exportQuestions(filters: { stackId?: number; topicId?: number; difficulty?: Difficulty; status?: McqStatus } = {}): Observable<Blob> {
    let params = new HttpParams();
    if (filters.stackId)    params = params.set('stackId', filters.stackId);
    if (filters.topicId)    params = params.set('topicId', filters.topicId);
    if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
    if (filters.status)     params = params.set('status', filters.status);
    return this.http.get(`${this.base}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
