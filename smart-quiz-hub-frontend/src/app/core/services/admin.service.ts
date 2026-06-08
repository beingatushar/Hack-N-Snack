import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, SmeUserResponse, AiGenerateRequest, McqResponse
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllSmes(): Observable<ApiResponse<SmeUserResponse[]>> {
    return this.http.get<ApiResponse<SmeUserResponse[]>>(`${this.base}/smes`);
  }

  getSmesByStack(stackId: number): Observable<ApiResponse<SmeUserResponse[]>> {
    return this.http.get<ApiResponse<SmeUserResponse[]>>(`${this.base}/stacks/${stackId}/smes`);
  }

  generateQuestions(req: AiGenerateRequest): Observable<ApiResponse<McqResponse[]>> {
    return this.http.post<ApiResponse<McqResponse[]>>(`${this.base}/ai/generate`, req);
  }
}
