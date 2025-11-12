import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ChatQuestionnaireComponent } from '../chat-questionnaire/chat-questionnaire.component';
import { LoginService } from '../services/login.service';
import { Request } from '../models/request.model';
import { Reservation } from '../models/reservations.model';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, ChatQuestionnaireComponent],
  templateUrl: './guest-dashboard.component.html',
  styleUrls: ['./guest-dashboard.component.css']
})
export class GuestDashboardComponent implements OnInit, OnDestroy {
  userId = '';
  requests: Request[] = [];
  selectedRequest: Request | null = null;
  selectedReservation: Reservation | null = null;
  private pollInterval: any;

  constructor(private api: ApiService, private router: Router, private loginService: LoginService) {}

  async ngOnInit() {
    const navState: any = this.router.getCurrentNavigation()?.extras.state;
    this.userId = navState?.username || this.loginService.getUser() || 'guest-001';
    if (navState?.reservation) this.selectedReservation = navState.reservation;
    await this.loadRequests();
    this.pollInterval = setInterval(() => this.loadRequests(true), 5000);
  }

  ngOnDestroy() { clearInterval(this.pollInterval); }

  async loadRequests(isSilent = false) {
    const all = await this.api.getRequests(this.userId);
    const open = all.filter(r => r.status !== 'completed' && r.status !== 'escalated');

    // merge update statuses & new ones
    for (const r of open) {
      const existing = this.requests.find(x => x.requestId === r.requestId);
      if (existing) {
        existing.status = r.status;
      } else {
        // new request — add to top
        this.requests.unshift(r);
      }
    }
    // remove closed
    this.requests = this.requests.filter(r => open.find(x => x.requestId === r.requestId));
    if (!isSilent) console.log('requests loaded', this.requests);
  }

  selectRequest(req: Request) { this.selectedRequest = req; }

  async handleRequestCreated(newReq: Request) {
    // push immediately to left panel and select it
    if (!this.requests.find(r => r.requestId === newReq.requestId)) {
      this.requests.unshift(newReq);
    }
    this.selectedRequest = newReq;
    // smooth scroll to item
    setTimeout(() => {
      const el = document.querySelector('.req-card.active');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }

  async handleRequestClosed(reqId: string) {
    if (reqId === 'new') {
      this.selectedRequest = null;
      return;
    }
    // update status to completed via API then reload
    await this.api.updateRequestStatus(reqId, 'completed');
    await this.loadRequests();
    if (this.selectedRequest?.requestId === reqId) this.selectedRequest = null;
  }
}
