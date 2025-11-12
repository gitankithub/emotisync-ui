import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private currentUser: string | null = null;

  setUser(username: string) {
    this.currentUser = username;
  }

  getUser(): string | null {
    return this.currentUser;
  }

  isStaffOrAdmin(): boolean {
    return this.currentUser?.startsWith('staff') || this.currentUser === 'admin' || false;
  }
}
