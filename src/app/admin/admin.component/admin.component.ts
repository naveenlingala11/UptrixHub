import {
  Component,
  OnInit,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CoursePlayerComponent } from '../../public/courses/course-player.component/course-player.component';
import { AdminService } from '../services/admin-service';
import Chart from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CourseVersion {
  version: number;
  label: 'AUTO_SAVE' | 'PUBLISHED' | 'MANUAL';
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    CoursePlayerComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit, AfterViewInit {

  private api = environment.apiUrl + '/admin/courses';

  /* ================= UI ================= */
  activeTab: 'users' | 'courses' = 'users';
  loadingUsers = false;
  toast = '';
  liveEvent: string | null = null;

  /* ================= USERS ================= */
  users: any[] = [];
  searchQuery = '';
  sortOption = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  /* ================= STATS ================= */
  stats: any = {};

  /* ================= COURSE CREATOR ================= */
  uploadedFileName = '';
  parsedJson: any = null;
  courseJson: any = null;
  error = '';
  selectedSection: any = { content: [] };
  courseStatus: 'DRAFT' | 'PUBLISHED' = 'DRAFT';
  autoSaveStatus: 'IDLE' | 'SAVING' | 'SAVED' = 'IDLE';
  autoSaveTimer: any;
  hasUnsavedChanges = false;
  currentStep: 'UPLOAD' | 'PREVIEW' | 'PUBLISH' = 'UPLOAD';
  validationErrors: string[] = [];
  versions: CourseVersion[] = [];
  selectedVersion: number | null = null;
  selectedVersionData: any = null;
  currentPublishedData: any = null;
  diffResult: any[] = [];

  /* ================= RESET MODAL ================= */
  resetUser: any = null;

  /* ================= WEBSOCKET ================= */
  ws!: WebSocket;

  /* ================= CHARTS ================= */
  usersChart!: Chart;
  revenueChart!: Chart;

  userGrowth: number[] = [];
  growthLabels: string[] = [];

  /* ================= PREVIEW ================= */
  previewCourseData: any = null;
  showPreview = false;

  constructor(private adminService: AdminService, private http: HttpClient) { }

  /* ================= INIT ================= */

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
    this.connectWebSocket();
    this.loadPseudoSkills();
  }

  ngAfterViewInit(): void {
    this.initUsersChart();
    this.initRevenueChart();
  }

  /* ================= USERS ================= */

  loadUsers(page: number = 0) {
    this.loadingUsers = true;

    this.adminService.getUsers(page, this.pageSize).subscribe({
      next: (res: any) => {
        this.users = res.content;
        this.totalPages = res.totalPages;
        this.currentPage = page;
        this.loadingUsers = false;
      },
      error: err => {
        console.error(err);
        this.loadingUsers = false;
      }
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) {
      this.loadUsers();
      return;
    }

    this.adminService.searchUsers(this.searchQuery).subscribe({
      next: (res: any[]) => this.users = res
    });
  }

  applySort() {
    if (this.sortOption === 'name') {
      this.users.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (this.sortOption === 'email') {
      this.users.sort((a, b) => a.email.localeCompare(b.email));
    }
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user?')) return;

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.showToast('User deleted');
        this.loadUsers(this.currentPage);
      }
    });
  }

  toggleLogin(id: number) {
    this.adminService.toggleUser(id)
      .subscribe(() => this.loadUsers(this.currentPage));
  }

  /* ================= SUBSCRIPTION ================= */

  setSubscription(id: number, days: number) {
    this.adminService.updateSubscription(id, true, days).subscribe({
      next: () => {
        this.showToast('Subscription updated');
        this.loadUsers(this.currentPage);
      }
    });
  }

  disableSubscription(id: number) {
    this.adminService.updateSubscription(id, false, 0).subscribe({
      next: () => this.loadUsers(this.currentPage)
    });
  }

  /* ================= RESET PASSWORD ================= */

  openResetModal(user: any) {
    this.resetUser = user;
  }

  confirmReset() {
    this.adminService.resetPassword(this.resetUser.id).subscribe({
      next: () => {
        this.showToast('Password reset');
        this.resetUser = null;
      }
    });
  }

  /* ================= FILE UPLOAD ================= */

  onFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.parsedJson = JSON.parse(reader.result as string);
        this.currentStep = 'UPLOAD';
        this.error = '';
        this.validateJson(this.parsedJson);
        this.markDirty();
      } catch {
        this.error = 'Invalid JSON file';
      }
    };
    reader.readAsText(file);
  }

  /* ================= VALIDATION ================= */

  validateJson(json: any) {
    this.validationErrors = [];

    if (!json.chapters?.length) {
      this.validationErrors.push('At least one chapter required');
    }

    json.chapters?.forEach((c: any, i: number) => {
      if (!c.title) {
        this.validationErrors.push(`Chapter ${i + 1} missing title`);
      }
    });

    return this.validationErrors.length === 0;
  }
  /* ================= DRAFT SAVE ================= */

  submitDraft() {
    if (!this.parsedJson) return;

    const courseId = this.parsedJson.courseId || this.parsedJson.id;

    this.http.post(
      `${this.api}/${courseId}/content/draft`,
      this.parsedJson
    ).subscribe({
      next: () => {
        this.courseStatus = 'DRAFT';
        this.previewCourseData = this.parsedJson;
        this.showPreview = true;
        this.currentStep = 'PREVIEW';
        this.hasUnsavedChanges = false;
        this.loadVersions(courseId);
      },
      error: err => this.error = err.error?.message || 'Draft upload failed'
    });
  }
  markDirty() {
    this.hasUnsavedChanges = true;
    this.triggerAutoSave();
  }

  triggerAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveStatus = 'SAVING';

    this.autoSaveTimer = setTimeout(() => {
      this.submitDraft();
      this.autoSaveStatus = 'SAVED';
    }, 1000);
  }

  /* ================= PREVIEW ================= */

  previewAsAdmin() {
    this.showPreview = true;
    this.currentStep = 'PREVIEW';
  }

  /* ================= VERSIONING ================= */

  loadVersions(courseId: string) {
    this.http
      .get<CourseVersion[]>(`${this.api}/${courseId}/versions`)
      .subscribe(res => {
        this.versions = res;
        this.selectedVersion = res.at(-1)?.version ?? null;
      });
  }

  /* ================= PUBLISH ================= */

  publishCourse() {
    const courseId = this.parsedJson.courseId || this.parsedJson.id;

    if (!confirm('Publish this course?')) return;

    this.http.post(
      `${this.api}/${courseId}/publish`,
      {}
    ).subscribe(() => {
      this.courseStatus = 'PUBLISHED';
      this.currentStep = 'PUBLISH';
      alert('Course Published');
    });
  }

  unpublishCourse() {
    const courseId = this.parsedJson.courseId || this.parsedJson.id;

    this.http.post(
      `${this.api}/${courseId}/unpublish`,
      {}
    ).subscribe(() => {
      this.courseStatus = 'DRAFT';
      alert('Moved to draft');
    });
  }

  rollback(version: number) {
    const courseId = this.parsedJson.courseId || this.parsedJson.id;

    this.http.post(
      `${this.api}/${courseId}/rollback/${version}`,
      {}
    ).subscribe(() => {
      alert(`Rolled back to version ${version}`);
      this.previewAsAdmin();
    });
  }

  /* ================= DRAG ================= */

  dropBlock(event: CdkDragDrop<any[]>) {
    if (!this.selectedSection?.content) return;
    moveItemInArray(
      this.selectedSection.content,
      event.previousIndex,
      event.currentIndex
    );
    this.markDirty();
  }

  /* ================= UNSAVED WARNING ================= */

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: any) {
    if (this.hasUnsavedChanges) {
      event.returnValue = true;
    }
  }

  previewVersion(version: number) {
    const courseId = this.parsedJson.courseId || this.parsedJson.id;

    this.http.get(`${this.api}/${courseId}/versions/${version}`)
      .subscribe(data => {
        this.selectedVersionData = data;
        this.computeDiff(this.currentPublishedData, data);
        this.showPreview = true;
      });
  }

  computeDiff(oldData: any, newData: any) {
    this.diffResult = [];

    oldData?.chapters?.forEach((oldChapter: any, i: number) => {
      const newChapter = newData.chapters[i];

      if (!newChapter) {
        this.diffResult.push({ type: 'REMOVED', title: oldChapter.title });
      } else if (JSON.stringify(oldChapter) !== JSON.stringify(newChapter)) {
        this.diffResult.push({ type: 'MODIFIED', title: oldChapter.title });
      }
    });

    newData?.chapters?.forEach((c: any, i: number) => {
      if (!oldData?.chapters?.[i]) {
        this.diffResult.push({ type: 'ADDED', title: c.title });
      }
    });
  }


  /* ================= STATS ================= */

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (res: any) => this.stats = res
    });
  }

  /* ================= CSV ================= */

  exportCSV() {
    const headers = ['Name', 'Email', 'Role', 'Subscription'];
    const rows = this.users.map(u => [
      u.name,
      u.email,
      u.role,
      u.subscriptionActive ? 'PRO' : 'FREE'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(r => csv += r.join(',') + '\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  /* ================= CHARTS ================= */

  chart!: Chart;

  initUsersChart() {
    const ctx = document.getElementById('usersChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Live Users',
          data: [],
          borderColor: '#2563eb',
          tension: 0.4
        }]
      }
    });
  }


  initRevenueChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue ₹',
          data: [0, 0, 1200, 3000, 5200, 8900],
          backgroundColor: '#22c55e'
        }]
      }
    });
  }

  addChartPoint() {
    const now = new Date().toLocaleTimeString();

    this.growthLabels.push(now);
    this.userGrowth.push(
      this.userGrowth.length
        ? this.userGrowth[this.userGrowth.length - 1] + 1
        : 1
    );

    this.chart?.update();
  }
  /* ================= WEBSOCKET ================= */

  private reconnectDelay = 3000;
  private reconnectTimer: any;
  private heartbeatTimer: any;
  private isManuallyClosed = false;

  connectWebSocket() {

    const token = localStorage.getItem('token');
    if (!token) return;

    // Prevent duplicate sockets
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('🔌 Connecting WebSocket...');

    this.ws = new WebSocket(
      `${environment.wsUrl}/ws/admin?token=${token}`
    );

    this.ws.onopen = () => {
      console.log('✅ WS Connected');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {

      // Heartbeat response
      if (event.data === 'PONG') return;

      try {
        const data = JSON.parse(event.data);
        this.handleAdminEvent(data);
      } catch (e) {
        console.warn('Invalid WS message', event.data);
      }
    };

    this.ws.onerror = () => {
      console.error('❌ WebSocket error');
    };

    this.ws.onclose = () => {
      console.warn('⚠️ WS disconnected');
      this.stopHeartbeat();

      if (!this.isManuallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  /* ================= RECONNECT ================= */

  scheduleReconnect() {
    clearTimeout(this.reconnectTimer);

    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket();
    }, this.reconnectDelay);
  }

  /* ================= HEARTBEAT ================= */

  startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('PING');
      }
    }, 15000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
  }

  handleAdminEvent(event: any) {

    // 🔔 Toast + Sound
    this.showToast(event.message);
    this.playSound();

    // 📊 Live chart update
    if (this.chart) {
      this.chart.data.labels!.push(
        new Date().toLocaleTimeString()
      );

      this.chart.data.datasets[0].data.push(
        this.chart.data.datasets[0].data.length + 1
      );

      this.chart.update();
    }
  }

  /* ================= TOAST + SOUND ================= */

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }

  playSound() {
    new Audio('/assets/sounds/notify.mp3').play();
  }

  /* ================= PSEUDO QUESTION UPLOAD ================= */
  questionFile!: File;
  questionSkill = '';
  uploadResult: any = null;
  skills: any[] = [];

  onQuestionFile(event: Event) {
    this.questionFile = (event.target as HTMLInputElement).files![0];
  }

  loadPseudoSkills() {
    this.http
      .get<any[]>(`${environment.apiUrl}/admin/pseudo/skills`)
      .subscribe({
        next: (res) => {
          this.skills = res;
        },
        error: (err) => {
          console.error('Failed to load pseudo skills', err);
        }
      });
  }

  uploadQuestions() {

    if (!this.questionSkill || !this.questionSkill.trim()) {
      alert('Please enter skill slug (e.g. core-java)');
      return;
    }

    if (!this.questionFile) {
      alert('Please select a file');
      return;
    }

    const form = new FormData();
    form.append('file', this.questionFile);
    form.append('skill', this.questionSkill.trim());

    this.http.post(
      `${environment.apiUrl}/admin/pseudo/questions/upload`,
      form
    ).subscribe({
      next: (res) => {
        this.uploadResult = res;
        alert('Questions uploaded successfully');
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.error || 'Upload failed');
      }
    });
  }


}
