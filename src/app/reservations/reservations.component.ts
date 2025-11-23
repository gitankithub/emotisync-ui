import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { User } from '../models/user.model';
import { LoginService } from '../services/login.service';
import { ApiService } from '../services/api.service';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {

  user!: User;
  reservations: any[] = [];

  activeReservations: any[] = [];
  upcomingReservations: any[] = [];
  pastReservations: any[] = [];

  hasOpenRequests: boolean = false;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private loginService: LoginService,
    private api: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.user = this.loginService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadReservations();
    this.loadRequests();
  }

  // load reservations
  loadReservations() {
    this.loading = true;

    this.api.getGuestReservations(this.user.userId).subscribe({
      next: (res: any[]) => {
        this.reservations = res || [];
        this.sortReservations();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "Unable to load reservations. Please try again later.";
        this.loading = false;
      }
    });
  }

  // sort reservations
  sortReservations() {
    const now = new Date();

    this.activeReservations = this.reservations.filter(r =>
      r.status === "CHECKED_IN"
    );

    this.upcomingReservations = this.reservations.filter(r =>
      new Date(r.checkInDate) > now
    );

    this.pastReservations = this.reservations.filter(r =>
      new Date(r.checkOutDate) < now
    );
  }

  // load requests
  loadRequests() {
    this.api.getGuestRequests(this.user.userId).subscribe({
      next: (requests: any[]) => {
        if(requests)
          this.hasOpenRequests = true;
      },
      error: () => {
        this.errorMessage = "Unable to load guest requests.";
      }
    });
  }

  // open booking details
  openBooking(booking: any) {
    this.dialog.open(BookingDialogComponent, {
      width: '600px',
      data: {
        ...booking,
        imageUrl: booking.imageUrl || 'assets/hotel-placeholder.jpg'
      }
    });
  }

  // navigate to requests
  goToRequests() {
    const firstReservation = this.activeReservations[0];
    this.router.navigate(['/guest-dashboard'], {
      state: {
        username: this.user.userId,
        reservation: firstReservation,
        selectedRating: null
      } 
    });
  }

  //get hotel image by hotel id
  getImagePath(reservationId: string): string {
    return `assets/images/${reservationId}.jpg`;
  }
}
