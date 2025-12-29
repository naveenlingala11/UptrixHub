import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface PublicProfile {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  skills: {
    name: string;
    proficiency: number;
  }[];
  badges: {
    icon: string;
    name: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private api = environment.apiUrl + '/user';

  constructor(private http: HttpClient) { }

  getProfile() {
    return this.http.get<any>(`${this.api}/profile`);
  }

  addSkill(skill: { name: string; proficiency: number }) {
    return this.http.post(`${this.api}/skills`, skill);
  }

  getPublicProfile(id: number) {
    return this.http.get<PublicProfile>(
      `${this.api}/public/profile/${id}`
    );
  }

  uploadAvatar(formData: FormData) {
    return this.http.post<any>(
      `${this.api}/avatar`,   // ✅ FIXED (no double /user)
      formData
    );
  }

  endorseSkill(skillId: number) {
    return this.http.post(`${this.api}/skills/${skillId}/endorse`, {});
  }

  getHeatmap() {
    return this.http.get<Record<string, number>>(`${this.api}/profile/heatmap`);
  }


}
