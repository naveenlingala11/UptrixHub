import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminDailyChallengeService {

  private api = `${environment.apiUrl}/admin/daily-challenge/upload`;

  constructor(private http: HttpClient) {}

  upload(form: FormData) {
    return this.http.post(this.api, form);
  }
}
