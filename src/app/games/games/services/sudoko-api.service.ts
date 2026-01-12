import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SudokuApiService {

  private base = `${environment.apiUrl}/games/sudoku`;

  constructor(private http: HttpClient) {}

  /* ===== XP / SOLVED ===== */
  solved(difficulty: string): Observable<{ earnedXp: number }> {
    return this.http.post<{ earnedXp: number }>(
      `${this.base}/solved`,
      { difficulty }
    );
  }

  /* ===== HINT ===== */
  hint(board: number[][]): Observable<number[]> {
    return this.http.post<number[]>(
      `${this.base}/hint`,
      board
    );
  }

  /* ===== SAVE / LOAD ===== */
  saveGame(stateJson: string): Observable<void> {
    return this.http.post<void>(
      `${this.base}/save`,
      stateJson,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  loadGame(): Observable<string> {
    return this.http.get(`${this.base}/load`, {
      responseType: 'text'
    });
  }

  /* ===== DAILY CHALLENGE ===== */
  loadDaily(): Observable<number[][]> {
    return this.http.get<number[][]>(
      `${environment.apiUrl}/sudoku/daily`
    );
  }

  submitDaily(time: number, mistakes: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/sudoku/daily/submit`,
      { time, mistakes }
    );
  }
}
