import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {

  form!: FormGroup; // ✅ declare only
  token!: string;

  loading = false;
  success = false;
  error = '';

  private api = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ initialize AFTER constructor
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'Invalid reset link';
      return;
    }
    this.token = token;
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    this.http.post(
      `${this.api}/auth/reset-password?token=${this.token}&password=${this.form.value.password}`,
      {},
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: err => {
        this.error = err.error || 'Reset failed';
        this.loading = false;
      }
    });
  }
}
