import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../features/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.hasValidToken()) return true;

  authService.logout();
  return false;
};
