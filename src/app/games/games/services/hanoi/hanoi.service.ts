import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HanoiService {

  private base = `${environment.apiUrl}/games/hanoi`;

  constructor(private http: HttpClient) {}

  submitScore(data: any): Observable<void> {
    return this.http.post<void>(`${this.base}/complete`, data);
  }

  saveReplay(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/replay`, data);
  }

  leaderboard(disks: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/leaderboard/${disks}`);
  }

  todayLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/leaderboard/today`);
  }

  dailyChallenge(): Observable<any> {
    return this.http.get<any>(`${this.base}/daily`);
  }

  getReplay(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/replay/${id}`);
  }
}
