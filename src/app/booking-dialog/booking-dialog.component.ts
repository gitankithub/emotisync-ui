import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    DatePipe,
    FormsModule
  ],
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.css']
})
export class BookingDialogComponent {
  private dialogRef = inject(MatDialogRef<BookingDialogComponent>);
  data = inject(MAT_DIALOG_DATA);
  private router = inject(Router);
  private chatService = inject(ChatService);

  selectedRating: number = 0;
  feedbackText: string = '';

  ratings = [
    { value: 1, emoji: '😡', label: 'Angry' },
    { value: 2, emoji: '😞', label: 'Very Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😃', label: 'Great' },
    { value: 6, emoji: '🤩', label: 'Excellent' }
  ];

  setRating(value: number) {
    this.selectedRating = value;
  }

  submitFeedback() {
    console.log(`Feedback submitted: ${this.selectedRating} stars for ${this.data.hotelName}`);
    console.log(`Written feedback: ${this.feedbackText}`);

    this.dialogRef.close({
      rating: this.selectedRating,
      feedback: this.feedbackText
    });
  }

  close() {
    this.dialogRef.close();
  }

  //Help button action — redirects to Guest Dashboard with reservation context
  redirectToHelp() {
    this.chatService.setReservationContext(this.data, this.selectedRating ?? 0);
    this.dialogRef.close();
    this.router.navigate(['/guest-dashboard'], {
      state: {
        username: this.data.guestId,
        reservation: this.data,
        selectedRating: this.selectedRating
      }
    });
  }

  //get hotel image by hotel id
  getImagePath(reservationId: string): string {
    return `assets/images/${reservationId}.jpg`;
  }
}
