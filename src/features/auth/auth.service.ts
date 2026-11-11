import { Service, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Service()
export class AuthService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private tokenKey = 'auth_token';

  isAuthenticated = signal<boolean>(this.hasValidToken());

  setLocalToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.set(true);
  }

  getLocalToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    return localStorage.getItem(this.tokenKey);
  }

  hasValidToken(): boolean {
    try {
      const token = this.getLocalToken();
      if (!token) return false;

      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;

      if (!isValid) this.logout();

      return isValid;
    } catch (error: unknown) {
      this.logout();
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      const payloadPart = token.split('.')[1];
      const decodedPayload = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error: unknown) {
      return null;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(this.tokenKey);

    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
