import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservations.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private context: { reservation?: Reservation | null; rating?: number | null } = {
    reservation: null,
    rating: null
  };

  setReservationContext(reservation: Reservation, rating: number | null) {
    this.context = { reservation, rating };
    localStorage.setItem(
    'reservationContext',
    JSON.stringify({ reservation, rating })
  );
  }

  getReservationContext() {
   const data = localStorage.getItem('reservationContext');
  return data ? JSON.parse(data) : null;
  }

  clearContext() {
    this.context = { reservation: null, rating: null };
    localStorage.removeItem('chatContext');
  }

  saveContext(context: any) {
  localStorage.setItem('chatContext', JSON.stringify(context));
}
getSavedContext() {
  const data = localStorage.getItem('chatContext');
  return data ? JSON.parse(data) : null;
}

}
