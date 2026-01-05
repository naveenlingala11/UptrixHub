import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Achievement {
  code: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

@Injectable({ providedIn: 'root' })
export class AchievementService {

  constructor(private http: HttpClient) {}

  getMyAchievements() {
    return this.http.get('/api/achievements/me');
  }
}
