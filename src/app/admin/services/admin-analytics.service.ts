import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

/* ===================== MODELS ===================== */

export interface BugCategoryAnalytics {
  bugCategory: string;
  totalAttempts: number;
  wrongAttempts: number;
  wrongPercentage: number;
}

export interface BugQuestionAccuracy {
  questionId: number;
  title: string;
  bugCategory: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface BugHunterLeaderboardRow {
  userId: number;
  name: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalXp: number;
}

export interface PublicLeaderboardRow {
  userId: number;
  name: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalXp: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /* 🐞 Bug Hunter */
  getCategoryAnalytics(): Observable<BugCategoryAnalytics[]> {
    return this.http.get<BugCategoryAnalytics[]>(
      `${this.api}/admin/bug-hunter/analytics/categories`
    );
  }

  getQuestionAccuracy(): Observable<BugQuestionAccuracy[]> {
    return this.http.get<BugQuestionAccuracy[]>(
      `${this.api}/admin/bug-hunter/analytics/questions/accuracy`
    );
  }

  getLeaderboard(): Observable<BugHunterLeaderboardRow[]> {
    return this.http.get<BugHunterLeaderboardRow[]>(
      `${this.api}/admin/bug-hunter/analytics/leaderboard`
    );
  }

  getPublicLeaderboard(): Observable<PublicLeaderboardRow[]> {
    return this.http.get<PublicLeaderboardRow[]>(
      `${this.api}/bug-hunter/public/leaderboard`
    );
  }

  /* 📊 Daily Challenge */
  getTodayAnalytics(from?: string, to?: string) {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    return this.http.get<any>(
      `${this.api}/admin/analytics/daily-challenge`,
      { params }
    );
  }

  getDailyTrend() {
    return this.http.get<any[]>(
      `${this.api}/admin/analytics/daily-trend`
    );
  }

  downloadCsv(from?: string, to?: string) {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    return this.http.get(
      `${this.api}/admin/analytics/export/csv`,
      { params, responseType: 'blob' }
    );
  }

  downloadExcel(from?: string, to?: string) {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    return this.http.get(
      `${this.api}/admin/analytics/export/excel`,
      { params, responseType: 'blob' }
    );
  }

}
