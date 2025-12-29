import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css'
})
export class VerifyOtp implements OnInit {

  environment = environment;

  otp: string[] = ['', '', '', '', '', ''];
  loading = false;
  error = '';
  success = false;

  // resend
  counter = 30;
  canResend = false;
  private timer: any;

  email!: string;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.startTimer();
  }

  /* ================= OTP INPUT ================= */

  moveNext(event: any, index: number) {
    const input = event.target;

    if (input.value && index < 5) {
      const next = input.nextElementSibling;
      next?.focus();
    }
  }

  handlePaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (pasted.length === 6 && /^\d+$/.test(pasted)) {
      this.otp = pasted.split('');
    }
  }

  get otpValue(): string {
    return this.otp.join('');
  }

  /* ================= VERIFY ================= */

  verify() {
    if (this.otpValue.length !== 6) return;

    this.loading = true;
    this.error = '';

    this.auth.verifyOtp({
      email: this.email,
      otp: this.otpValue
    }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.toast('OTP verified successfully ✅');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: err => {
        this.loading = false;
        this.error = err.error || 'Invalid OTP';
        this.toast(this.error);
      }
    });
  }

  /* ================= RESEND ================= */

  startTimer() {
    this.counter = 30;
    this.canResend = false;

    this.timer = setInterval(() => {
      this.counter--;
      if (this.counter === 0) {
        this.canResend = true;
        clearInterval(this.timer);
      }
    }, 1000);
  }

  resendOtp() {
    this.auth.resendVerification(this.email).subscribe({
      next: () => {
        this.toast('OTP resent 📩');
        this.startTimer();
      },
      error: () => this.toast('Failed to resend OTP')
    });
  }

  /* ================= TOAST ================= */

  toast(msg: string) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerText = msg;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 2500);
  }
}
