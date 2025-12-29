import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnInit {

  forgotForm!: FormGroup;

  loading = false;
  success = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  submit() {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: err => {
        this.error = err.error || 'Failed to send reset email';
        this.loading = false;
      }
    });
  }
}
