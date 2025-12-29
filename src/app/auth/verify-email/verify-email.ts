import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmail implements OnInit {

  form!: FormGroup;
  loading = false;
  success = false;
  error = '';
  email!: string;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    // ✅ Get email from query param
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    if (!this.email) {
      this.error = 'Invalid verification link';
      return;
    }

    // ✅ Auto-fill email & disable editing
    this.form = this.fb.group({
      email: [{ value: this.email, disabled: true }, [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    // ✅ Disabled controls won't be sent → add email manually
    const payload = {
      email: this.email,
      otp: this.form.get('otp')?.value
    };

    this.auth.verifyOtp(payload).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.success = true;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid OTP';
      }
    });
  }
}
