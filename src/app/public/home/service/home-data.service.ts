import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeDataService {

  // ✅ ENVIRONMENT BASE URL
  private API = `${environment.apiUrl}/home`;

  constructor(private http: HttpClient) { }

  /* ================= DASHBOARD ================= */

  getDashboard(): Observable<any> {
    return this.http.get(`${this.API}/dashboard`);
  }

  /* ================= LEARNING PATH ================= */

  getLearningPath(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/learning-path`);
  }

  /* ================= ACTIVITY HEATMAP ================= */

  getHeatmap(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/activity`);
  }

  /* ================= RESUME ANALYSIS ================= */

  getResume(): Observable<any> {
    return this.http.get(`${this.API}/resume-summary`);
  }

  uploadResume(form: FormData) {
    return this.http.post(
      `${environment.apiUrl}/resume-upload`,
      form
    );
  }

  getResumeDetail() {
    return this.http.get(`${this.API}/resume-detail`);
  }

  /* ================= SALARY INSIGHT ================= */

  getSalary(): Observable<any> {
    return this.http.get(`${this.API}/salary`);
  }

  // ✅ MISSING METHOD – ADD THIS
  getMyKits() {
    return this.http.get<any[]>(`${this.API}/kits`);
  }
  /* ========== PUBLIC HOME ========== */

  getPublicStats(): Observable<any> {
    return this.http.get(`${this.API}/public/stats`);
  }

  getContinueLearning() {
    return this.http.get<any>(`${this.API}/continue-learning`);
  }

  getMockProgress() {
    return this.http.get<any>(`${this.API}/mock-progress`);
  }

}
