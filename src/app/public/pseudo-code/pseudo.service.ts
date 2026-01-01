import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ViolationResponse {
  count: number;
  limit: number;
  blocked: boolean;
}

@Injectable({ providedIn: 'root' })
export class PseudoService {

  private api = environment.apiUrl;

  private base = `${environment.apiUrl}/pseudo-code`;

  constructor(private http: HttpClient) { }

  /* =============================
     SKILLS
  ============================== */

  getSkills() {
    return this.http.get<any[]>(`${this.base}/skills`);
  }

  /* =============================
     🧪 TEST FLOW
  ============================== */

  startTest(skill: string) {
    return this.http.post<any>(
      `${this.base}/start-test/${skill}`,
      {},
      { withCredentials: true } // ✅ IMPORTANT
    );
  }

  resumeTest(skill: string) {
    return this.http.get<any>(
      `${this.base}/resume/${skill}`,
      { withCredentials: true } // ✅ IMPORTANT
    );
  }


  getQuestions(skill: string, page = 0, size = 10) {
    return this.http.get<any>(
      `${this.base}/questions/${skill}?page=${page}&size=${size}`
    );
  }

  submitTest(attemptId: number, answers: Record<number, string>) {
    return this.http.post<any>(
      `${this.base}/submit-test/${attemptId}`,
      { answers }
    );
  }

  /* =============================
     ANSWERS
  ============================== */

  saveAnswer(
    attemptId: number,
    questionId: number,
    option: string
  ) {
    return this.http.post(
      `${this.base}/save-answer/${attemptId}`,
      {
        questionId,
        selectedOption: option
      }
    );
  }

  submitAnswer(questionId: number, option: string) {
    return this.http.post<any>(
      `${this.base}/answer`,
      {
        questionId,
        selectedOption: option
      }
    );
  }

  /* =============================
     🛡️ ANTI-CHEAT (THIS WAS MISSING)
  ============================== */

  logViolation(attemptId: number, type: string) {
    return this.http.post<ViolationResponse>(
      `${this.base}/violation/${attemptId}?type=${type}`,
      {}
    );
  }

  adminPreview(skill: string) {
    return this.http.get<any[]>(
      `${this.api}/admin/pseudo/questions/${skill}`
    );
  }

}
