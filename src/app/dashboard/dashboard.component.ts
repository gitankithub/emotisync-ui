import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../services/api.service';
import { Request } from '../models/request.model';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { ChatDialogAdminComponent } from '../chat-dialog-admin/chat-dialog-admin.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, ChatDialogComponent, ChatDialogAdminComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  userId : string = '';
  role: string = '';
  requests: Request[] = [];
  selectedRequest: Request | null = null;
  user: any;
  chatMessages: Message[] = [];

  constructor(private api: ApiService, private router: Router, private loginService: LoginService) {
  }

  ngOnInit() {
    this.user = this.loginService.getUser()
    this.role = this.user.role
    this.userId = this.user.userId
    this.loadRequests(this.user)
  }

  loadRequests(user: User) {

    // reset requests before loading
    this.requests = [];

    if (user.role === 'STAFF' || user.role === 'ADMIN'
    ) {
      // 🔹 Staff → load staff requests
      this.api.getAllRequests().subscribe({
        next: (res) => {
          this.requests = res ?? [];
          console.log("Staff Requests:", this.requests);
        },
        error: (err) => {
          console.error("Failed to load staff requests", err);
          this.requests = [];
        }
      });

    } else {
      console.warn("Unknown role:", user.role);
      this.requests = [];
    }
  }


  selectRequest(req: Request) {
    this.selectedRequest = {...req};
  }

  closeChat() {
    this.selectedRequest = null;
    this.loadRequests(this.user.userId);
  }

  getThreadId(req: Request): string {
    return req.userThread?.threadId ?? ''
  }

}
