import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminPreviewService {

  private base = '/api/admin/preview';

  constructor(private http: HttpClient) {}

  previewUser(userId: number) {
    return this.http.post<{ token: string }>(
      `${this.base}/${userId}`,
      {}
    );
  }
}
