import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-settings.component',
  imports: [CommonModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css',
})
export class AdminSettingsComponent {

  logoUrl: string | null =
    localStorage.getItem('company_logo');

  onLogoUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoUrl = reader.result as string;

      // TEMP: store locally
      localStorage.setItem('company_logo', this.logoUrl);
    };

    reader.readAsDataURL(file);
  }
}
