import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { PublicHomeComponent } from '../public-home.component/public-home.component';
import { UserHomeComponent } from '../user-home.component/user-home.component';


@Component({
  selector: 'app-home-shell',
  standalone: true,
  imports: [CommonModule, PublicHomeComponent, UserHomeComponent],
  templateUrl: './home-shell.component.html'
})
export class HomeShellComponent {

  isLoggedIn = false;

  constructor(private auth: AuthStateService) {
    this.auth.user$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }
}
