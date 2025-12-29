import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.api}/auth/login`, data)
      .pipe(
        tap(res => {
          // ✅ token
          localStorage.setItem('token', res.token);

          // ✅ user (THIS WAS MISSING)
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: res.id,
              name: res.name,
              email: res.email,
              avatar: res.avatar,
              role: res.role
            })
          );

          localStorage.setItem('role', res.role);
        })
      );
  }

  register(data: any): Observable<string> {
    return this.http.post(
      `${this.api}/auth/register`,
      data,
      { responseType: 'text' }
    );
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.api}/auth/verify-otp`, data);
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post(
      `${this.api}/auth/resend-verification`,
      { email }
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.api}/auth/forgot-password`,
      { email }
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.api}/user/me`);
  }

  updateProfile(payload: { name: string; mobile: string }): Observable<any> {
    return this.http.put<any>(
      `${this.api}/user/profile`,
      payload
    );
  }
  getAllUsers() {
    return this.http.get<any[]>(`${this.api}/admin/users`);
  }

}
