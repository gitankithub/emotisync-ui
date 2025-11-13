import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
    private api: ApiService
  ) {}

  login() {
    if (!this.username.trim()) {
      this.errorMessage = "Please enter your email.";
      return;
    }

    // --- API Call (kept as you asked) ---
    this.api.getAllUsers().subscribe({
      next: (users: any[]) => {
        // Find user by email
        const user = users.find(u => u.email === this.username.trim());

        if (!user) {
          this.errorMessage = "User not found.";
          return;
        }

        const formattedUser = {
          id: user._id?.$oid,
          email: user.email,
          name: user.name,
          role: user.role
        };

        // Save user globally
        this.loginService.setUser(formattedUser);

        // Navigate by role
        this.navigateByRole(formattedUser.role, formattedUser.id);
      },

      error: (err) => {
        console.warn("Backend down. Using fallback user.", err);

        // Fallback hardcoded user (ONLY when API fails)
        const fallbackUser = {
          id: "6915d94539d63e188d61fc03",
          email: "anusha@test.com",
          name: "Anusha Vaddi",
          role: "GUEST"
        };

        // Allow login ONLY if user enters this fallback email
        if (this.username.trim() === fallbackUser.email) {
          this.loginService.setUser(fallbackUser);
          this.navigateByRole(fallbackUser.role, fallbackUser.id);
        } else {
          this.errorMessage = "Server is down. Only test user can login.";
        }
      }
    });
  }

  private navigateByRole(role: string, userId: string) {
    if (role === "GUEST") {
      this.router.navigate(['/reservations'], {
        state: { userId }
      });
    } else if (role === "STAFF" || role === "ADMIN") {
      this.router.navigate(['/dashboard'], {
        state: { userId }
      });
    }
  }
}
