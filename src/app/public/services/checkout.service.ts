import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class CheckoutService {

  constructor(private api: ApiService) {}

  previewCheckout(payload: {
    courseIds?: string[];
    bundleId?: number;
    coupon?: string;
  }) {
    return this.api.post<any>('/checkout/preview', payload);
  }

  createOrder(payload: {
    courseIds?: string[];
    bundleCode?: string;
    couponCode?: string;
  }) {
    return this.api.post<any>('/orders', payload);
  }
}
