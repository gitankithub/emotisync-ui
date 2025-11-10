import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private currentUser: string | null = null;

  setUser(username: string) {
    this.currentUser = username.toLowerCase();
  }

  getUser(): string | null {
    return this.currentUser;
  }

  isStaffOrAdmin(): boolean {
    return this.currentUser === 'staff' || this.currentUser === 'admin';
  }
}
