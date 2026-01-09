import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminRoadmapService {

  private baseUrl = `${environment.apiUrl}/admin/roadmaps`;

  constructor(private http: HttpClient) { }

  uploadRoadmap(json: any) {
    return this.http.post(
      `${this.baseUrl}/upload`,
      json,   // <-- send object
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  uploadExcel(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.baseUrl}/upload-excel`, form);
  }

  preview(courseId: string) {
    return this.http.get<any>(`${this.baseUrl}/preview/${courseId}`);
  }

  versions(courseId: string) {
    return this.http.get<any[]>(`${this.baseUrl}/versions/${courseId}`);
  }

  saveReorder(roadmapId: number, json: any) {
    return this.http.put(
      `${this.baseUrl}/reorder/${roadmapId}`,
      JSON.stringify(json),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  publish(roadmapId: number) {
    return this.http.post(`${this.baseUrl}/publish/${roadmapId}`, {});
  }

}
