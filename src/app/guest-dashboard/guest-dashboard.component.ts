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
import { User } from '../models/user.model';

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
  user!: User;
  requests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  selectedReservation: Reservation | null = null;
  selectedRating: number = 0;

  constructor(
    private api: ApiService,
    private router: Router,
    private loginService: LoginService
  ) {}

  async ngOnInit() {
    this.selectedRequest = null;
    const navState: any = history.state;
    this.user = this.loginService.getUser();
    if (navState?.reservation) this.selectedReservation = navState.reservation;
    if (navState?.selectedRating) this.selectedRating = navState.selectedRating;
    await this.loadRequests();
  }

  ngOnDestroy() {}

  async loadRequests() {
    const all = await firstValueFrom(this.api.getGuestRequests(this.user.userId));

    for (const r of all) {
      const existing = this.requests.find((x) => x.requestId === r.requestId);
      if (existing) {
        existing.status = r.status;
      } else {
        this.requests.unshift(r);
      }
    }
    console.log('requests loaded', this.requests);
  }


  selectRequest(req: ServiceRequest) {
    this.selectedRequest = { ...req };
  }

  async handleRequestCreated(newReq: Message | null) {
    if (newReq === null) {
      this.selectedRequest = null;
    } else {
      await this.loadRequests(); // refresh the latest requests

      // Find request matching the message's threadId
      const matchedRequest = this.requests.find(
        (req) => req.userThread?.threadId === newReq.threadId
      );

      // Set selectedRequest to matched request, else keep existing behavior
      this.selectedRequest = matchedRequest
        ? { ...matchedRequest }
        : this.requests.length > 0
          ? { ...this.requests[0] }
          : null;

      console.log('Selected Request:', this.selectedRequest);
    }
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
