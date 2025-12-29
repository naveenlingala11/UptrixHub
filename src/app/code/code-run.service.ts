import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CodeRunService {

  constructor(private http: HttpClient) { }

  run(code: string) {
    return this.http.post<any>(
      `${environment.apiUrl}/compile`,
      { code }
    );
  }
}
