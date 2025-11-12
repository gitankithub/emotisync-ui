import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { Reservation } from '../models/reservations.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule,
    DatePipe,
    MatIconModule
  ],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  reservations: Reservation[] = [];
  loading = true;

  activeReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];
  upcomingReservations: Reservation[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.http.get<{ reservations: Reservation[] }>('assets/mockData.json').subscribe({
      next: (res) => {
        this.reservations = res.reservations;
        this.splitReservations();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.loading = false;
      }
    });
  }

  splitReservations() {
  const now = new Date();

  this.upcomingReservations = this.reservations.filter(r => r.status === 'upcoming');
  this.activeReservations = this.reservations.filter(r => r.status === 'checkedin');
  this.pastReservations = this.reservations.filter(r =>
    r.status === 'completed' || r.status === 'cancelled'
  );
}

  openBooking(booking: Reservation) {
    this.dialog.open(BookingDialogComponent, {
      data: booking,
      width: '700px',
      maxHeight: '600px'
    });
  }
  redirectToReq(){
    this.router.navigate(['/dashboard']);
}
}
