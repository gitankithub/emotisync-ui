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
    const email = this.username.trim();

    if (!email) {
      this.errorMessage = "Please enter your email.";
      return;
    }

    this.api.getAllUsers().subscribe({
      next: (users: any[]) => {

        const user = users.find(u => u.email === email);

        if (!user) {
          this.errorMessage = "User not found.";
          return;
        }

        const formattedUser = {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        };
        console.log(formattedUser)

        this.loginService.setUser(formattedUser);
        this.navigateByRole(formattedUser.role, formattedUser.userId);
      },

      error: () => {
        this.errorMessage = "Unable to contact server. Please try again later.";
      }
    });
  }

  private navigateByRole(role: string, userId: string) {
    const targetRoute = 
      role === "GUEST" ? "/reservations" : "/dashboard";

    this.router.navigate([targetRoute], {
      state: { userId }
    });
  }
}
