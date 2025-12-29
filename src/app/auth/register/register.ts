  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
  import { Router, RouterLink } from '@angular/router';
  import { NgIf } from '@angular/common';
  import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

  @Component({
    standalone: true,
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink, NgIf],
    templateUrl: './register.html',
    styleUrl: './register.css'
  })
  export class Register implements OnInit {

    environment = environment;

    registerForm!: FormGroup;
    loading = false;
    error = '';

    constructor(
      private fb: FormBuilder,
      private auth: AuthService,
      private router: Router
    ) { }

    ngOnInit(): void {
      this.registerForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.matchPassword });
    }

    matchPassword(form: FormGroup) {
      return form.get('password')?.value === form.get('confirmPassword')?.value
        ? null
        : { mismatch: true };
    }

    submit() {
      if (this.registerForm.invalid) return;

      this.loading = true;
      this.error = '';

      const { confirmPassword, ...payload } = this.registerForm.value;

      this.auth.register(payload).subscribe({
        next: () => {
          this.loading = false; // ✅ IMPORTANT

          // ✅ Go to Verify OTP page
          this.router.navigate(['/verify-email'], {
            queryParams: { email: payload.email }
          });
        },
        error: err => {
          this.loading = false; // ✅ IMPORTANT
          this.error = err.error?.message || 'Registration failed';
        }
      });
    }

  }
