import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseApiService {

  private apiBase = environment.apiUrl; // 👈 BACKEND URL

  constructor(private http: HttpClient) {}

  getAllCourses() {
    return this.http.get<any[]>(`${this.apiBase}/public/courses`);
  }

  getCourseDetail(id: string) {
    return this.http.get<any>(`${this.apiBase}/public/courses/${id}`);
  }

  getCourseContent(courseId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiBase}/courses/${courseId}/content`
    );
  }
}
