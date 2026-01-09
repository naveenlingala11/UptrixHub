import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface DailyChallenge {
  title: string;
  difficulty: string;
  time: string;
  tags: string[];
  problem: string[];
  starterCode: string;
  locked: boolean;
  xpEarned?: number;
}


@Injectable({ providedIn: 'root' })
export class DailyChallengeService {

  constructor(private http: HttpClient) { }

  loadToday() {
    return this.http.get<DailyChallenge>(
      `${environment.apiUrl}/daily-challenge/today`,
      {
        headers: {
          'X-USER-ID': '1',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }

}
