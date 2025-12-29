import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class PricingService {
  
  constructor(private api: ApiService) { }

  getCourses() {
    return this.api.get<any[]>('/public/courses');
  }

  getBundles() {
    return this.api.get<any[]>('/bundles');
  }

}
