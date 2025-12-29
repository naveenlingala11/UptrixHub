import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  environment = environment;

  loginForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.loginForm.invalid) return;

    this.loading = true;

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {

        // 🔥 NOW FETCH USER DETAILS USING TOKEN
        this.auth.getCurrentUser().subscribe({
          next: (user) => {
            this.loading = false;

            // ✅ STORE USER
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', user.role);

            // ✅ ROLE BASED REDIRECT
            if (user.role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: () => {
            this.loading = false;
            this.error = 'Failed to load user profile';
          }
        });

      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }

  resend() {
    const email = this.loginForm.value.email;
    if (!email) return;

    this.auth.resendVerification(email).subscribe({
      next: () => alert('Verification email sent'),
      error: () => alert('Failed to resend')
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

}
