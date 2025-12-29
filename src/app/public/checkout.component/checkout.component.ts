import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CheckoutService } from '../services/checkout.service';
import { RazorpayService } from '../services/razorpay.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {

  /* ================= USER ================= */
  user: any;

  /* ================= DATA ================= */
  items: string[] = [];
  itemPrice = 0;

  subtotal = 0;
  discount = 0;
  total = 0;

  /* ================= COUPON ================= */
  couponCode = '';
  couponApplied = false;
  couponError = false;

  /* ================= STATES ================= */
  paymentState: 'idle' | 'processing' = 'idle';
  showBillPreview = false;
  showInvoice = false;

  /* ================= BACKEND ================= */
  preview: any;
  order: any;
  invoice: any;

  constructor(
    private auth: AuthStateService,
    private checkoutApi: CheckoutService,
    private razorpay: RazorpayService,
    private router: Router
  ) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.auth.getUser();

    const nav = history.state || {};

    this.checkoutApi.previewCheckout({
      courseIds: nav.courseIds,
      bundleId: nav.bundleId,
      coupon: undefined
    }).subscribe(res => {
      this.preview = res;

      this.items = res.items.map((i: any) => i.title);
      this.subtotal = res.subtotal;
      this.discount = res.discount;
      this.total = res.total;

      if (res.items.length) {
        this.itemPrice = res.items[0].price;
      }
    });
  }

  /* ================= COUPON ================= */
  applyCoupon() {
    this.couponError = false;

    this.checkoutApi.previewCheckout({
      courseIds: this.preview.items.map((i: any) => i.courseId),
      coupon: this.couponCode || undefined
    }).subscribe(res => {
      this.preview = res;
      this.subtotal = res.subtotal;
      this.discount = res.discount;
      this.total = res.total;
      this.couponApplied = true;
    }, () => {
      this.couponError = true;
      this.couponApplied = false;
    });
  }

  removeCoupon() {
    this.couponCode = '';
    this.couponApplied = false;
    this.couponError = false;

    this.checkoutApi.previewCheckout({
      courseIds: this.preview.items.map((i: any) => i.courseId)
    }).subscribe(res => {
      this.preview = res;
      this.subtotal = res.subtotal;
      this.discount = 0;
      this.total = res.total;
    });
  }

  /* ================= BILL ================= */
  previewBill() {
    this.showBillPreview = true;
  }

  /* ================= PAYMENT ================= */
  pay() {
    this.paymentState = 'processing';

    this.checkoutApi.createOrder({
      courseIds: this.preview.items.map((i: any) => i.courseId),
      couponCode: this.couponCode || undefined
    }).subscribe(order => {
      this.order = order;
      this.startPayment();
    });
  }

  startPayment() {
    this.razorpay.createRazorpayOrder(this.order.id)
      .subscribe(rzp => {
        this.razorpay.openCheckout(rzp, (res: any) => {
          this.verifyPayment(res);
        });
      });
  }

  verifyPayment(res: any) {
    this.razorpay.verifyPayment({
      razorpayOrderId: res.razorpay_order_id,
      razorpayPaymentId: res.razorpay_payment_id,
      razorpaySignature: res.razorpay_signature
    }).subscribe({

      next: () => {
        this.router.navigate(['/invoice', this.order.id]);
      },

      error: () => {
        alert('Payment verification failed');
        this.paymentState = 'idle';
      }
    });
  }

  /* ================= INVOICE ================= */
  downloadInvoice() {
    window.print();
  }
}
