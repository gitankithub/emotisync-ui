import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private currentUser: any = null;

  setUser(user: any) {
    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  getUser() {
    if (this.currentUser) return this.currentUser;
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  }

  clearUser() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  }
}
