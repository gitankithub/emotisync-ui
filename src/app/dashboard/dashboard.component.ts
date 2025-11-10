import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../services/api.service';
import { Request } from '../models/request.model';
import { ChatComponent } from '../chat-dialog/chat-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, ChatComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  userId = '';
  role: 'guest' | 'staff' | 'admin' = 'guest';
  requests: Request[] = [];
  selectedRequest: Request | null = null;

  constructor(private api: ApiService, private router: Router) {
    const navState: any = this.router.getCurrentNavigation()?.extras.state;
    this.userId = navState?.username || 'guest1';
    this.role = this.userId.startsWith('staff') ? 'staff' : this.userId.startsWith('admin') ? 'admin' : 'guest';
    this.loadRequests();
  }

  async loadRequests() {
    this.requests = await this.api.getRequests(this.userId);
  }

  selectRequest(req: Request) {
    this.selectedRequest = req;
  }

  closeChat() {
    this.selectedRequest = null;
    this.loadRequests();
  }

  getThreadId(req: Request) {
    if (this.role === 'guest') return req.guestThreadId;
    if (this.role === 'staff') return req.staffThreadId;
    return req.adminThreadId;
  }

  async newRequest() {
    if (this.role !== 'guest') return;
    const req = await this.api.createRequest(this.userId, '999', 'General Help');
    this.requests.push(req);
    this.selectedRequest = req;
  }
}
