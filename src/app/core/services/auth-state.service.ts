import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface AuthUser {
  id?: number;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  /* 🔐 USER STATE */
  private userSubject = new BehaviorSubject<AuthUser | null>(
    this.getStoredUser()
  );

  user$ = this.userSubject.asObservable();

  /* ✅ BOOLEAN LOGIN STATE */
  isLoggedIn$ = this.user$.pipe(
    map(user => !!user)
  );

  /* SET USER AFTER LOGIN / OAUTH */
  setUser(user: AuthUser) {
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role) {
      localStorage.setItem('role', user.role);
    }

    this.userSubject.next(user);
  }

  /* LOGOUT */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    this.userSubject.next(null);
  }

  /* SYNC HELPER */
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  /* SAFE PARSE */
  private getStoredUser(): AuthUser | null {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}

}
