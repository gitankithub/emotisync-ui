import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ChatQuestionnaireComponent } from '../chat-questionnaire/chat-questionnaire.component';
import { LoginService } from '../services/login.service';
import { ServiceRequest } from '../models/request.model';
import { Reservation } from '../models/reservations.model';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    ChatQuestionnaireComponent,
    MatIconModule,
  ],
  templateUrl: './guest-dashboard.component.html',
  styleUrls: ['./guest-dashboard.component.css'],
})
export class GuestDashboardComponent implements OnInit, OnDestroy {
  userId = '';
  requests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  selectedReservation: Reservation | null = null;
  private pollInterval: any;
  selectedRating: number = 0;

  constructor(
    private api: ApiService,
    private router: Router,
    private loginService: LoginService
  ) {}

  async ngOnInit() {
    this.selectedRequest = null;
    const navState: any = history.state;
    this.userId =
      navState?.username ||
      this.loginService.getUser() ||
      '6916598b2dea9cced0f1da33';
    if (navState?.reservation) this.selectedReservation = navState.reservation;
    if (navState?.selectedRating) this.selectedRating = navState.selectedRating;
    await this.loadRequests();
    this.pollInterval = setInterval(() => this.loadRequests(true), 5000);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }

  async loadRequests(isSilent = false) {
    const all = await firstValueFrom(this.api.getGuestRequests(this.userId));
    const open = all.filter((r) => r.status !== 'CLOSED');

    // merge update statuses & new ones
    for (const r of open) {
      const existing = this.requests.find((x) => x.requestId === r.requestId);
      if (existing) {
        existing.status = r.status;
      } else {
        // new request — add to top
        this.requests.unshift(r);
      }
    }

    // remove closed
    this.requests = this.requests.filter((r) =>
      open.find((x) => x.requestId === r.requestId)
    );

    if (!isSilent) console.log('requests loaded', this.requests);
  }

  selectRequest(req: ServiceRequest) {
    this.selectedRequest = { ...req };
  }

  async handleRequestCreated(newReq: Message) {
    await this.loadRequests();
    if (this.requests.length > 0) {
      this.selectedRequest = { ...this.requests[0] };
    }
  }

  async handleRequestClosed(reqId: string) {
    // if (reqId === 'new') {
    //   this.selectedRequest = null;
    //   return;
    // }
    // // update status to completed via API then reload
    // await this.api.updateRequestStatus(reqId, 'completed');
    // await this.loadRequests();
    // if (this.selectedRequest?.requestId === reqId) this.selectedRequest = null;
  }

  redirectToHome() {
    this.router.navigate(['/reservations']);
  }

  getStatusStyle(status: string) {
    switch (status) {
      case 'open':
        return { background: '#1E88E5', color: '#fff' }; // Blue
      case 'assigned':
        return { background: '#8E24AA', color: '#fff' }; // Purple
      case 'in_progress':
        return { background: '#FB8C00', color: '#fff' }; // Orange
      case 'completed':
        return { background: '#43A047', color: '#fff' }; // Green
      case 'escalated':
        return { background: '#E53935', color: '#fff' }; // Red
      default:
        return { background: '#084c3f', color: '#fff' };
    }
  }
}
