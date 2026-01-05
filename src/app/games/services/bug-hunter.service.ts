import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface BugHunterQuestion {
  id: number;
  code: string;
  bugCategory: string; // used for correctness
  bugType: string;     // shown after answer
  reason: string;
  fix: string;
  xp: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

// bug-hunter-answer-response.ts (or inside service file)

export interface BugHunterAnswerResponse {
  correct: boolean;
  earnedXp: number;
}

export interface BugHunterHistory {
  questionId: number;
  bugCategory: string;
  selectedAnswer: string;
  correct: boolean;
  earnedXp: number;
  attemptedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BugHunterService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getQuestion(language: string) {
    return this.http.get<BugHunterQuestion>(
      `${this.api}/bug-hunter/question`,
      { params: { language } }
    );
  }

  submitAnswer(payload: {
    userId: number;
    questionId: number;
    selectedAnswer: string;
  }) {
    return this.http.post<BugHunterAnswerResponse>(
      `${this.api}/bug-hunter/submit`,
      payload
    );
  }

  // ❌ WRONG before
  // /api/games/bug-hunter/session

  // ✅ FIXED
  getSession(language: string) {
    return this.http.get<BugHunterQuestion[]>(
      `${this.api}/games/bug-hunter/session`,
      { params: { language } }
    );
  }

  getHistory(userId: number) {
    return this.http.get<BugHunterHistory[]>(
      `${this.api}/bug-hunter/history/${userId}`
    );
  }

}
