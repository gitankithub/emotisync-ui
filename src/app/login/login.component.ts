import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  error: string = '';

  constructor(private router: Router) {}

  login() {
    if (!this.username) {
      this.error = 'Username is required';
      return;
    }
    // Navigate to dashboard and pass username as state
    this.router.navigate(['/dashboard'], { state: { username: this.username } });
  }
}
