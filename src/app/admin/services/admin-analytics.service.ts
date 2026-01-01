import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminAnalyticsService {

  private base = '/api/admin/analytics';

  constructor(private http: HttpClient) {}

  skillAnalytics() {
    return this.http.get<any[]>(`${this.base}/skills`);
  }

  subscriptionAnalytics() {
    return this.http.get<any[]>(`${this.base}/subscriptions`);
  }

  difficultyAnalytics() {
    return this.http.get<any[]>(`${this.base}/difficulty`);
  }
}
