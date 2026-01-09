import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDailyChallengeService } from '../admin-daily-challenge.service';

@Component({
  selector: 'app-admin-daily-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-daily-challenge.component.html',
  styleUrl: './admin-daily-challenge.component.css'
})
export class AdminDailyChallengeComponent {

  jsonText = '';
  parsed: any = null;

  file?: File;

  error: string | null = null;
  success: string | null = null;
  loading = false;

  constructor(private service: AdminDailyChallengeService) { }

  /* ================= FILE UPLOAD ================= */
  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.file = input.files?.[0];
  }

  /* ================= PREVIEW ================= */
  preview() {
    this.error = null;
    this.success = null;

    try {
      this.parsed = JSON.parse(this.jsonText);
    } catch {
      this.error = '❌ Invalid JSON format';
      this.parsed = null;
    }
  }

  /* ================= SAVE ================= */
  upload() {
    if (!this.file && !this.jsonText) {
      this.error = '❌ Upload JSON file or paste JSON';
      return;
    }

    const form = new FormData();

    if (this.file) {
      form.append('file', this.file);
    } else {
      form.append('json', this.jsonText);
    }

    this.loading = true;

    this.service.upload(form).subscribe({
      next: () => {
        this.success = '✅ Challenge saved successfully';
        this.loading = false;
      },
      error: err => {
        console.error('Upload error:', err);

        const msg =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Upload failed';

        this.error = msg.includes('attempted')
          ? '🔒 Challenge already attempted. Editing locked.'
          : '❌ Upload failed';

        this.loading = false;
      }
    });
  }

}
