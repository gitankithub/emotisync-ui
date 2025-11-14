import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private currentUser!: User;

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
    localStorage.removeItem("currentUser");
  }
}
