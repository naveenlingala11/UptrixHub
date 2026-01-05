import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface BugHunterAdminQuestion {
  id?: number;
  title: string;
  language: 'JAVA' | 'SPRING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  code: string;
  bugType: string;
  reason: string;
  fix: string;
  xp: number;

  active: boolean;

  /** 🔥 ADD THESE */
  published: boolean;
  version?: number;
  parentId?: number;
}

@Injectable({ providedIn: 'root' })
export class BugHunterAdminService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<BugHunterAdminQuestion[]>(
      '/api/admin/bug-hunter'
    );
  }

  save(q: BugHunterAdminQuestion) {
    return this.http.post(
      '/api/admin/bug-hunter',
      q
    );
  }

  update(id: number, q: BugHunterAdminQuestion) {
    return this.http.put(
      `/api/admin/bug-hunter/${id}`,
      q
    );
  }

  toggle(id: number) {
    return this.http.patch(
      `/api/admin/bug-hunter/${id}/toggle`,
      {}
    );
  }

  publish(id: number) {
    return this.http.patch(
      `/api/admin/bug-hunter/${id}/publish`,
      {}
    );
  }


}
