import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeCheckerService } from '../../services/resume-checker.service';

@Component({
  standalone: true,
  selector: 'app-resume-checker',
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-checker.component.html',
  styleUrl: './resume-checker.component.css'
})
export class ResumeCheckerComponent {

  targetRole = 'Java Backend Developer';
  jobDescription = '';
  resumeUrl = '';

  file?: File;

  resumeResult: any;
  matchResult: any;
  comparison: any;

  loading = false;

  constructor(private service: ResumeCheckerService) {}

  onFileSelect(e: any) {
    this.file = e.target.files[0];
  }

  analyze() {
    if (!this.jobDescription) {
      alert('Please paste Job Description');
      return;
    }

    this.loading = true;

    /* ================= FILE UPLOAD FLOW ================= */
    if (this.file) {
      const form = new FormData();
      form.append('file', this.file);
      form.append('jobDescription', this.jobDescription);
      form.append('targetRole', this.targetRole);

      this.service.analyzeWithUpload(form).subscribe(res => {
        this.matchResult = res;
        this.loading = false;
      });

      this.service.compareHistory().subscribe(c => this.comparison = c);
      return;
    }

    /* ================= URL BASED FLOW ================= */
    if (!this.resumeUrl) {
      alert('Upload resume OR provide resume URL');
      this.loading = false;
      return;
    }

    this.service.analyzeWithUrl({
      resumeUrl: this.resumeUrl,
      targetRole: this.targetRole
    }).subscribe(resume => {
      this.resumeResult = resume;

      this.service.matchWithJD({
        resumeUrl: this.resumeUrl,
        jobDescription: this.jobDescription,
        targetRole: this.targetRole
      }).subscribe(match => {
        this.matchResult = match;
        this.loading = false;
      });
    });

    this.service.compareHistory().subscribe(c => this.comparison = c);
  }

  scoreColor(score: number) {
    if (score >= 80) return 'good';
    if (score >= 60) return 'mid';
    return 'bad';
  }
}
