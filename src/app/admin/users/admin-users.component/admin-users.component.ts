import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminPreviewService } from '../../services/admin-preview.service';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [CommonModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent {

  users: any[] = [];

  constructor(
    private http: HttpClient,
    private preview: AdminPreviewService
  ) {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>('/api/admin/users')
      .subscribe(res => this.users = res);
  }

  previewAsUser(userId: number) {

    const adminToken = localStorage.getItem('token');
    if (!adminToken) return;

    // 🔐 Save admin token
    localStorage.setItem('adminToken', adminToken);

    // 🎭 Get impersonation token
    this.preview.previewUser(userId).subscribe(res => {
      localStorage.setItem('token', res.token);
      window.location.href = '/';
    });
  }
}
