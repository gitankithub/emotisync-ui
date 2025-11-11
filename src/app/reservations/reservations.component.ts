import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { Reservation } from '../models/reservations.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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

  ngOnInit() {
    this.http.get<{ reservations: Reservation[] }>('assets/mockData.json').subscribe({
      next: (res) => {
        this.reservations = res.reservations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.loading = false;
      }
    });
  }

  openBooking(booking: Reservation) {
    this.dialog.open(BookingDialogComponent, {
      data: booking,
      width: '700px'
    });
  }
}
