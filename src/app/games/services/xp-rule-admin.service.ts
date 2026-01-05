import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface XpRule {
  id?: number;
  gameType: string;
  action: string;
  xp: number;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class XpRuleAdminService {

  private api = '/api/admin/xp-rules';

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<XpRule[]>(this.api);
  }

  create(r: XpRule) {
    return this.http.post<XpRule>(this.api, r);
  }

  update(id: number, r: XpRule) {
    return this.http.put<XpRule>(`${this.api}/${id}`, r);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
