import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResumeCheckerService {

  private resumeAPI = `${environment.apiUrl}/resume`;
  private uploadAPI = `${environment.apiUrl}/resume-upload`;

  constructor(private http: HttpClient) { }

  /* ================= URL BASED ================= */

  analyzeWithUrl(payload: any) {
    return this.http.post(`${this.resumeAPI}/analyze`, payload);
  }

  matchWithJD(payload: any) {
    return this.http.post(`${environment.apiUrl}/resume-match/analyze`, payload);
  }

  compareHistory() {
    return this.http.get(`${this.resumeAPI}/compare`);
  }

  /* ================= FILE UPLOAD BASED ================= */

  analyzeWithUpload(formData: FormData) {
    return this.http.post(
      `${environment.apiUrl}/resume-upload/analyze-with-upload`,
      formData
    );
  }

}
