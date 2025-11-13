import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Request } from '../models/request.model';
import { Reservation } from '../models/reservations.model';
import { Message } from '../models/message.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private mockUrl = 'assets/mockData.json';
  private initialized = false;

  private reservations: Reservation[] = [];
  private requests: Request[] = [];
  private messages: Message[] = [];

  constructor(private http: HttpClient) {}

  private async initIfNeeded() {
    if (this.initialized) return;
    try {
      const data: any = await firstValueFrom(this.http.get(this.mockUrl));
      this.reservations = data.reservations || [];
      this.requests = data.requests || [];
      this.messages = data.messages || [];
    } catch (e) {
      console.warn('Could not load mockData.json', e);
    }
    // merge any saved localStorage copies
    this.mergeLocalStorage();
    this.initialized = true;
  }

  /** ---------- Reservations ---------- **/
  async getReservationsForUser(userId: string): Promise<Reservation[]> {
    await this.initIfNeeded();
    return this.reservations.filter(r => r.guestId === userId);
  }

  /** ---------- Requests (read/write persisted) ---------- **/
  private saveToLocalStorage() {
    localStorage.setItem('mock_requests', JSON.stringify(this.requests));
    localStorage.setItem('mock_messages', JSON.stringify(this.messages));
  }

  private mergeLocalStorage() {
    try {
      const lr: Request[] = JSON.parse(localStorage.getItem('mock_requests') || '[]');
      for (const r of lr) {
        if (!this.requests.find(x => x.requestId === r.requestId)) this.requests.push(r);
        else {
          // merge fields if present in local copy
          const existing = this.requests.find(x => x.requestId === r.requestId)!;
          Object.assign(existing, r);
        }
      }
      const lm: Message[] = JSON.parse(localStorage.getItem('mock_messages') || '[]');
      for (const m of lm) {
        if (!this.messages.find(x => x.time === m.time && x.threadId === m.threadId)) this.messages.push(m);
      }
    } catch (e) {
      console.warn('error merging local storage', e);
    }
  }

  private nowIso() {
    return new Date().toISOString();
  }

  async getRequests(userId: string): Promise<Request[]> {
    await this.initIfNeeded();
    // return requests where guestId matches or all if staff/admin (we assume guest flow)
    return this.requests.filter(r => r.guestId === userId);
  }

  async createRequest(guestId: string, roomNumber: string, requestType: string, description?: string): Promise<Request> {
    await this.initIfNeeded();
    const id = 'REQ' + Math.floor(1000 + Math.random() * 9000);
    const now = this.nowIso();
    const req: Request = {
      requestId: id,
      guestId,
      roomNumber,
      requestType,
      description: description || '',
      status: 'open',
      createdAt: now,
      updatedAt: now,
      guestThreadId: `guest-${id}`,
      staffThreadId: `staff-${id}`,
      adminThreadId: `admin-${id}`,
      statusHistory: [{ status: 'open', time: now }]
    };
    this.requests.unshift(req);
    this.saveToLocalStorage();

    // push an initial message in messages (bot greeting)
    this.messages.push({
      messageId: `M${this.messages.length + 1}`,
      threadId: req.guestThreadId!,
      senderId: 'bot',
      text: `Hello! We have created request ${req.requestId} for ${req.requestType}.`,
      time: now,
      messageType: 'bot'
    });
    this.saveToLocalStorage();

    return req;
  }

  async updateRequestStatus(
    requestId: string,
    status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'escalated'
  ): Promise<void> {
    await this.initIfNeeded();
    const r = this.requests.find(x => x.requestId === requestId);
    if (!r) return;
    r.status = status;
    r.updatedAt = this.nowIso();
    r.statusHistory = r.statusHistory || [];
    r.statusHistory.push({ status, time: r.updatedAt });
    this.saveToLocalStorage();
  }

  /** ---------- Messages ---------- **/
  async getMessages(threadId: string): Promise<Message[]> {
    await this.initIfNeeded();
    return this.messages.filter(m => m.threadId === threadId);
  }

  async postMessage(msg: Message): Promise<Message> {
    await this.initIfNeeded();
    const newMsg: Message = {
      ...msg,
      messageId: msg.messageId || `M${this.messages.length + 1}`,
      time: msg.time || this.nowIso()
    };
    this.messages.push(newMsg);
    this.saveToLocalStorage();
    return newMsg;
  }

  // convenience for tests / original API shape
  async postGuestIssue(summary: string): Promise<{ success: boolean }> {
    console.log('[mock] guest issue:', summary);
    return { success: true };
  }

  async getRequestsForUser(userId: string) {
  const data = await fetch('assets/mockData.json').then(res => res.json());
  return data.requests.filter((req: any) => req.userId === userId);
}
getAllUsers() {
  return this.http.get<any[]>("http://localhost:8080/api/users");
}

getGuestReservations(guestId: string) {
  return this.http.get<any[]>(
    `http://localhost:8080/api/reservations/guestid=${guestId}`
  );
}

getGuestRequests(guestId: string) {
  return this.http.get<any[]>(
    `http://localhost:8080/api/requests/guestid=${guestId}`
  );
}





}
