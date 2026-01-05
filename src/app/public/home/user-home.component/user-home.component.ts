import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { HomeDataService } from '../service/home-data.service';
import { MockInterviewService } from '../../features/services/mock-interview.service';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.css'
})
export class UserHomeComponent implements OnInit {

  /* ================= AUTH ================= */
  isLoggedIn = false;
  user: any;

  /* ================= BACKEND DRIVEN ================= */
  dashboard: any;
  learningPath: any[] = [];
  activityDays: any[] = [];
  resumeDetail: any;
  salaryInsight: any;
  myKits: any[] = [];
  continueLearning: any;
  mockInterview: any;
  resumeSummary: any;
  uploadingResume = false;
  resumeFile?: File;

  /* ================= BACKEND READY (NEXT APIs) ================= */

  dailyPractice = [
    {
      title: 'Java Question of the Day',
      description: 'Difference between HashMap & ConcurrentHashMap',
      route: '/practice/code'
    },
    {
      title: 'Coding Challenge',
      description: 'First non-repeating character',
      route: '/practice/coding'
    }
  ];

  companies = [
    { name: 'Amazon', tag: 'Product Based', questions: 420, focus: ['Java', 'DSA'], locked: false },
    { name: 'Google', tag: 'FAANG', questions: 380, focus: ['DSA', 'System Design'], locked: true },
    { name: 'Microsoft', tag: 'Product Based', questions: 310, focus: ['Java'], locked: true }
  ];

  /* ================= AI MENTOR ================= */
  mentorOpen = false;
  mentorMessages = [{ from: 'ai', text: 'Hi 👋 I’m your AI Mentor.' }];
  userMessage = '';

  constructor(
    private homeData: HomeDataService,
    private auth: AuthStateService,
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
      if (!this.isLoggedIn) return;

      this.homeData.getDashboard().subscribe(d => this.dashboard = d);
      this.homeData.getContinueLearning().subscribe(c => this.continueLearning = c);
      this.homeData.getLearningPath().subscribe(p => this.learningPath = p);
      this.homeData.getHeatmap().subscribe(h => this.activityDays = h);
      this.homeData.getResumeDetail().subscribe(r => this.resumeDetail = r);
      this.homeData.getResume().subscribe(r => this.resumeSummary = r);
      this.homeData.getSalary().subscribe(s => this.salaryInsight = s);
      this.homeData.getMyKits().subscribe(k => this.myKits = k);
      this.homeData.getMockProgress().subscribe(m => this.mockInterview = m);
    });
  }

  /* ================= HELPERS ================= */

  getHeatClass(c: number) {
    if (c >= 5) return 'heat-5';
    if (c >= 3) return 'heat-3';
    if (c >= 1) return 'heat-1';
    return 'heat-0';
  }

  getResumeLabel(score: number) {
    if (score >= 80) return 'Strong Resume';
    if (score >= 60) return 'Average Resume';
    return 'Needs Improvement';
  }

  getConfidenceClass(v: number) {
    if (v >= 80) return 'high';
    if (v >= 60) return 'mid';
    return 'low';
  }

  getReadinessClass(score: number) {
    if (score >= 80) return 'ready';
    if (score >= 60) return 'almost';
    return 'weak';
  }

  openCompany(c: any) {
    if (c.locked) {
      alert('🔒 PRO required');
      return;
    }
    alert(`Opening ${c.name}`);
  }

  startMock(type: string) {
    alert(`Starting ${type} mock interview`);
  }

  toggleMentor() {
    this.mentorOpen = !this.mentorOpen;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;
    this.mentorMessages.push({ from: 'user', text: this.userMessage });
    this.userMessage = '';
  }

  onResumeSelect(e: any) {
    this.resumeFile = e.target.files[0];
  }

  uploadResume() {
    if (!this.resumeFile) {
      alert('Please select resume PDF');
      return;
    }

    const form = new FormData();
    form.append('file', this.resumeFile);

    this.uploadingResume = true;

    this.homeData.uploadResume(form).subscribe({
      next: () => {
        this.homeData.getResume().subscribe(r => this.resumeSummary = r);
        this.uploadingResume = false;
        alert('Resume uploaded successfully');
      },
      error: () => this.uploadingResume = false
    });
  }

  improveResume() {
    alert('Resume improvement roadmap – backend next');
  }

  openSalaryRoadmap() {
    alert('Salary roadmap – backend next');
  }
}
