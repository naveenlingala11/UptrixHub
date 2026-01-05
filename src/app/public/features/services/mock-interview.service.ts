import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockInterviewService {

  private API = `${environment.apiUrl}/mock`;

  constructor(private http: HttpClient) { }

  requestMock(payload: any) {
    return this.http.post<void>(`${this.API}/request`, payload);
  }

  myRequests() {
    return this.http.get<any[]>(`${this.API}/my-requests`);
  }

  mySessions() {
    return this.http.get<any[]>(`${this.API}/my-sessions`);
  }
}
