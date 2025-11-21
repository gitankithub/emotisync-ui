import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../services/api.service';
import { ServiceRequest } from '../models/request.model';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { ChatDialogAdminComponent } from '../chat-dialog-admin/chat-dialog-admin.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    ChatDialogComponent,
    ChatDialogAdminComponent,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  userId: string = '';
  role: string = '';
  requests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  user: any;
  chatMessages: Message[] = [];
  loading: boolean = true;

  constructor(
    private api: ApiService,
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.user = this.loginService.getUser();
    this.role = this.user.role;
    this.userId = this.user.userId;
    this.loadRequests(this.user);
  }

  loadRequests(user: User) {
    this.loading = true;

    // reset requests before loading
    this.requests = [];

    if (user.role === 'STAFF' || user.role === 'ADMIN') {
      // 🔹 Staff → load staff requests
      this.api.getAllRequests().subscribe({
        next: (res) => {
          this.requests = this.sortedRequests(res) ?? [];
          console.log(`${user.role} Requests:`, this.requests);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to load staff requests', err);
          this.requests = [];
        },
      });
    } else {
      console.warn('Unknown role:', user.role);
      this.requests = [];
    }
  }

  private sortedRequests(requests: ServiceRequest[]): ServiceRequest[] {
    return requests.slice().sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  selectRequest(req: ServiceRequest) {
    this.selectedRequest = { ...req };
  }

  closeChat($event: User) {
    this.selectedRequest = null;
    this.loadRequests($event);
  }

  getThreadId(req: ServiceRequest): string {
    return req.userThread?.threadId ?? '';
  }

  updateStatus(reqId: string, status: string) {
    this.loading = true;
    if (status !== 'undefined') {
      this.api.updateStatus(reqId, status).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Updated:', response);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
    }
  }
  refreshLeftPanel(){
    this.loadRequests(this.user);
  }
}
