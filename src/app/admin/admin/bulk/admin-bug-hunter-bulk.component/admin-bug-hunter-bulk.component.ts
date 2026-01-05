import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-bug-hunter-bulk',
  templateUrl: './admin-bug-hunter-bulk.component.html',
  styleUrls: ['./admin-bug-hunter-bulk.component.css']
})
export class AdminBugHunterBulkComponent {

  jsonText = '';
  report: any = null;
  error = '';
  loading = false;

  private api = environment.apiUrl + '/admin/bug-hunter/bulk';

  constructor(private http: HttpClient) {}

  /* ================= FILE UPLOAD ================= */
  onFile(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.jsonText = String(reader.result);
    };
    reader.readAsText(file);
  }

  /* ================= SCHEMA VALIDATION ================= */
  private validateSchema(data: any[]): string[] {
    const errors: string[] = [];
    const seen = new Set<string>();

    data.forEach((q, i) => {
      if (!q.title || !q.code || !q.bugType || !q.language) {
        errors.push(`Row ${i + 1}: Missing required fields`);
      }

      const key = `${q.title}-${q.language}`;
      if (seen.has(key)) {
        errors.push(`Row ${i + 1}: Duplicate question`);
      }
      seen.add(key);
    });

    return errors;
  }

  /* ================= PREVIEW (DRAFT) ================= */
  preview() {
    this.execute(false);
  }

  /* ================= PUBLISH ================= */
  publish() {
    this.execute(true);
  }

  /* ================= CORE EXECUTION ================= */
  private execute(publish: boolean) {
    this.error = '';
    this.report = null;

    let payload: any[];

    try {
      payload = JSON.parse(this.jsonText);
      if (!Array.isArray(payload)) {
        throw new Error();
      }
    } catch {
      this.error = '❌ Invalid JSON format. Expected an array.';
      return;
    }

    const schemaErrors = this.validateSchema(payload);
    if (schemaErrors.length) {
      this.report = {
        valid: false,
        errors: schemaErrors
      };
      return;
    }

    this.loading = true;

    const params = new HttpParams().set('publish', publish);

    this.http.post<any>(
      this.api,
      payload,
      { params }
    ).subscribe({
      next: res => {
        this.report = res;

        alert(
          publish
            ? `🚀 ${res.saved} questions PUBLISHED successfully`
            : `📝 ${res.saved} questions saved as DRAFT`
        );

        this.loading = false;
      },
      error: err => {
        this.error =
          err.error?.message ||
          '❌ Bulk operation failed. Check backend logs.';
        this.loading = false;
      }
    });
  }
}
