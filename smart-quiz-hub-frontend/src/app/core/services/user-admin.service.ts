import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  AdminUser, ApiResponse, CreateUserRequest, UpdateUserRequest, UserRole
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/users`;

  list(role?: UserRole): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    return this.http.get<ApiResponse<AdminUser[]>>(this.base, { params }).pipe(map(r => r.data));
  }

  create(req: CreateUserRequest): Observable<ApiResponse<AdminUser>> {
    return this.http.post<ApiResponse<AdminUser>>(this.base, req);
  }

  update(id: number, req: UpdateUserRequest): Observable<ApiResponse<AdminUser>> {
    return this.http.put<ApiResponse<AdminUser>>(`${this.base}/${id}`, req);
  }

  setActive(id: number, active: boolean): Observable<ApiResponse<AdminUser>> {
    const params = new HttpParams().set('active', active);
    return this.http.patch<ApiResponse<AdminUser>>(`${this.base}/${id}/active`, {}, { params });
  }

  resetPassword(id: number, password: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/${id}/reset-password`, { password });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
