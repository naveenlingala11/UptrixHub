import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const adminGuard: CanActivateFn = () => {

  const authState = inject(AuthStateService);
  const router = inject(Router);

  const user = authState.getUser();

  // ✅ FIX: role must be ADMIN
  if (user?.role === 'ADMIN') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
