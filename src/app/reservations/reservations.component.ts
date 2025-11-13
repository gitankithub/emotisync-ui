import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoginService } from '../services/login.service';
import { ApiService } from '../services/api.service';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { MatCardModule } from '@angular/material/card';



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

  guestId: string = '';
  reservations: any[] = [];

  activeReservations: any[] = [];
  upcomingReservations: any[] = [];
  pastReservations: any[] = [];

  hasOpenRequests: boolean = false;
  loading: boolean = true;

  constructor(
    private loginService: LoginService,
    private api: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const user = this.loginService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.guestId = user.id;

    this.loadReservations();
    this.loadRequests();
  }

  // ==================================================
  // 1️⃣ LOAD RESERVATIONS
  // ==================================================
  loadReservations() {
    this.loading = true;

    this.api.getGuestReservations(this.guestId).subscribe({
      next: (res: any[]) => {
        this.reservations = res || [];
        this.sortReservations();
        this.loading = false;
      },
      error: (err) => {
        console.warn("Reservation API down. Using fallback.", err);

        // Fallback reservation
        this.reservations = [
          {
            _id: "04e2c98b-02d4-4b48-b3e9-ac42beb457ef",
            propertyName: "Best Western Country Woods Resort",
            roomNumber: "1203",
            roomType: "SUITE",
            numberOfOccupants: 2,
            guestId: this.guestId,
            status: "CHECKED_IN",
            checkInDate: "2025-11-12T15:00:00Z",
            checkOutDate: "2025-11-25T11:00:00Z"
          }
        ];

        this.sortReservations();
        this.loading = false;
      }
    });
  }

  // ==================================================
  // 2️⃣ SORT RESERVATIONS
  // ==================================================
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

  // ==================================================
  // 3️⃣ LOAD REQUESTS FOR "YOUR REQUESTS" BUTTON
  // ==================================================
  loadRequests() {
    this.api.getGuestRequests(this.guestId).subscribe({
      next: (requests: any[]) => {
        this.hasOpenRequests = requests.some(r => r.status === "OPEN");
      },
      error: (err) => {
        console.warn("Requests API down. Using fallback.", err);

        // Fallback open request
        this.hasOpenRequests = true;
      }
    });
  }

  // ==================================================
  // 4️⃣ OPEN BOOKING DIALOG (STAYS SAME AS BEFORE)
  // ==================================================
  openBooking(booking: any) {
  this.dialog.open(BookingDialogComponent, {
    width: '600px',
    data: {
      ...booking,
      imageUrl: booking.imageUrl || 'assets/hotel-placeholder.jpg'
    }
  });
}


  // ==================================================
  // 5️⃣ GO TO REQUESTS PAGE
  // ==================================================
  goToRequests() {
    this.router.navigate(['/guest-dashboard'], {
      state: { guestId: this.guestId }
    });
  }
}
