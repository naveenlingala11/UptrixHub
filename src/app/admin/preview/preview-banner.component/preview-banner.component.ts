import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-preview-banner',
  imports: [CommonModule],
  templateUrl: './preview-banner.component.html',
  styleUrls: ['./preview-banner.component.css']
})
export class PreviewBannerComponent {

  isPreview(): boolean {
    return !!localStorage.getItem('adminToken');
  }

  exitPreview() {
    const adminToken = localStorage.getItem('adminToken');

    if (adminToken) {
      localStorage.setItem('token', adminToken);
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
  }
}
