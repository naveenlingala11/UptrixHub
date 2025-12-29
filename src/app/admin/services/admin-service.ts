import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* ================= USERS ================= */

  // ✅ Pagination
  getUsers(page: number = 0, size: number = 10): Observable<PagedResponse<any>> {
    return this.http.get<PagedResponse<any>>(
      `${this.api}/admin/users?page=${page}&size=${size}`
    );
  }

  // ✅ Search
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/admin/users/search?q=${query}`
    );
  }

  // ✅ Delete
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/admin/users/${userId}`
    );
  }

  // ✅ Enable / Disable account
  toggleUser(userId: number): Observable<void> {
    return this.http.put<void>(
      `${this.api}/admin/users/${userId}/toggle`,
      {}
    );
  }

  // ✅ Subscription
  updateSubscription(
    userId: number,
    enable: boolean,
    graceDays: number
  ): Observable<void> {
    return this.http.put<void>(
      `${this.api}/admin/users/${userId}/subscription`,
      { enable, graceDays }
    );
  }

  /* ================= DASHBOARD ================= */

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/admin/stats`);
  }

  resetPassword(userId: number) {
  return this.http.put(
    `${this.api}/admin/users/${userId}/reset-password`,
    {}
  );
}

}
