import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get<T>(url: string) {
    return this.http.get<T>(this.api + url);
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(this.api + url, body);
  }

  // ✅ ADD THIS (FOR PDF / FILE DOWNLOADS)
  getBlob(url: string): Observable<Blob> {
    return this.http.get(this.api + url, {
      responseType: 'blob'
    });
  }
}
