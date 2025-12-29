import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

declare var Razorpay: any;

@Injectable({ providedIn: 'root' })
export class RazorpayService {

  constructor(private api: ApiService) {}

  createRazorpayOrder(orderId: number) {
    return this.api.post<any>(
      `/payment/razorpay/create?orderId=${orderId}`, {}
    );
  }

  verifyPayment(payload: any) {
    return this.api.post('/payment/razorpay/verify', payload);
  }

  // ✅ ADD THIS
  paymentSuccess(payload: {
    courseId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  }) {
    return this.api.post('/payment/success', payload);
  }

  openCheckout(order: any, onSuccess: Function) {
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpayOrderId,
      handler: (response: any) => onSuccess(response)
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}

