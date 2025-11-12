import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  constructor(private router: Router, private loginService: LoginService) {}

  login() {
    if (!this.username?.trim()) return;
    const normalized = this.username.trim();
    this.loginService.setUser(normalized);
    console.log("username at login",normalized)
    // route to reservations (guest) or dashboard (staff)
    if (normalized.startsWith('staff') || normalized.startsWith('admin')) {
      this.router.navigate(['/dashboard'], { state: { username: normalized } });
    } else {
      this.router.navigate(['/reservations'], { state: { username: normalized } });
    }
  }
}
