import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AuthStateService } from './core/services/auth-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('JavaArray');

  constructor(
    private authService: AuthService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.bootstrapAuth();
  }

  /**
   * 🔑 Sync auth state on app start / refresh
   */
  private bootstrapAuth(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.authState.logout();
      return;
    }

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        // 🔥 THIS FIXES NAVBAR + HOME + DASHBOARD
        this.authState.setUser(user);
      },
      error: () => {
        // token invalid / expired
        this.authState.logout();
      }
    });
  }
}
