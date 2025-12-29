import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../courses/course.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseApiService {

  private baseUrl = environment.apiUrl + '/public/courses';

  constructor(private http: HttpClient) {}

  getAllCourses() {
    return this.http.get<any[]>(this.baseUrl);
  }

  /* ✅ FIXED ENDPOINT */
  getCourseDetail(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getCourseContent(courseId: string) {
    return this.http.get(
      `/api/courses/${courseId}/content`
    );
  }
}
