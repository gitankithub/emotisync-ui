import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceRequest } from '../models/request.model';
import { Reservation } from '../models/reservations.model';
import { Message } from '../models/message.model';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private mockUrl = 'assets/mockData.json';
  private initialized = false;

  private reservations: Reservation[] = [];
  private requests: ServiceRequest[] = [];
  private messages: Message[] = [];

  constructor(private http: HttpClient) { }

  createRequest(payload: ServiceRequest) {
    return this.http.post<ServiceRequest>('http://localhost:8080/api/requests', payload);
  }

  createMessage(payload: Message) {
    return this.http.post<Message>('http://localhost:8080/api/messages', payload);
  }

  getAllUsers() {
    return this.http.get<any[]>('http://localhost:8080/api/users');
  }

  getGuestReservations(guestId: string) {
    return this.http.get<any[]>(
      `http://localhost:8080/api/reservations/user/${guestId}`
    );
  }

  getGuestRequests(guestId: string) {
    return this.http.get<any[]>(
      `http://localhost:8080/api/requests/user/${guestId}`
    );
  }

  getStaffRequests(guestId: string) {
    return this.http.get<any[]>(
      `http://localhost:8080/api/requests/${guestId}`
    );
  }

   getAllRequests() {
    return this.http.get<any[]>(
      `http://localhost:8080/api/requests`
    );
  }
  
  getMessagesByThreadId(threadId: string, userId: string = "", userType: string): Observable<Message[]> {
    return this.http.get<Message[]>(`http://localhost:8080/api/messages/thread/${threadId}`,
    { params: { userId, userType } });
  }

  // postMessages(threadId: string){
  //   console.log('post');
  // }
  
}
