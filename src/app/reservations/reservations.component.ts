import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Reservation } from '../models/reservations.model';
import { ApiService } from '../services/api.service';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private login = inject(LoginService);

  reservations: Reservation[] = [];
  activeReservations: Reservation[] = [];
  upcomingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];

  loading = true;
  username = 'guest-001';

  async ngOnInit() {
    const navState: any = this.router.getCurrentNavigation()?.extras.state;
    if (navState?.username) this.username = navState.username;

    this.reservations = await this.api.getReservationsForUser(this.username);
    this.categorizeReservations();
    this.loading = false;
  }

  /** 🔹 Divide reservations into Active, Upcoming, and Past groups */
  categorizeReservations() {
    const now = new Date();
    this.activeReservations = this.reservations.filter(r =>
      r.status === 'checkedin' ||
      (new Date(r.checkIn) <= now && new Date(r.checkOut) >= now)
    );

    this.upcomingReservations = this.reservations.filter(r =>
      r.status === 'upcoming' || new Date(r.checkIn) > now
    );

    this.pastReservations = this.reservations.filter(r =>
      r.status === 'completed' || r.status === 'cancelled' || new Date(r.checkOut) < now
    );
  }

  /** 🔹 Open reservation details */
  openBooking(booking: Reservation) {
    this.dialog.open(BookingDialogComponent, {
      data: booking,
      width: '700px',
      panelClass: 'booking-dialog-panel'
    });
  }

  /** 🔹 Redirect to guest dashboard (Your Requests) */
  redirectToReq() {
    this.router.navigate(['/guest-dashboard'], { state: { username: this.username } });
  }
}
