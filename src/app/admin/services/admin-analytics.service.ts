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
/* ===================== SERVICE ===================== */

@Injectable({
  providedIn: 'root'
})
export class BugHunterAnalyticsService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

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

  getLeaderboard() {
    return this.http.get<BugHunterLeaderboardRow[]>(
      `${this.api}/admin/bug-hunter/analytics/leaderboard`
    );
  }

  getPublicLeaderboard() {
    return this.http.get<PublicLeaderboardRow[]>(
      `${this.api}/bug-hunter/public/leaderboard`
    );
  }
}
