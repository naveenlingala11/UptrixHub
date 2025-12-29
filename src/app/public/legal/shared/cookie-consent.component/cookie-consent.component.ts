import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-cookie-consent',
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css'
})
export class CookieConsentComponent {

  visible = !localStorage.getItem('cookie_consent');

  accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    this.visible = false;
  }

  reject() {
    localStorage.setItem('cookie_consent', 'rejected');
    this.visible = false;
  }
}
