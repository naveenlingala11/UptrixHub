import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AiExplainResponse {
  explanation: string;
  aiGenerated: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiExplanationService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  explainBug(payload: {
    questionId: number;
    code: string;
    bugType: string;
    difficulty: string;
    userWasCorrect: boolean;
  }) {
    return this.http.post<AiExplainResponse>(
      `${this.api}/ai/explain-bug`,
      payload
    );
  }
}
