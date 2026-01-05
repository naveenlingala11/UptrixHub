import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class XpService {

  constructor(private http: HttpClient) {}

  getMyXp() {
    return this.http.get('/api/xp/me');
  }
}
