import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
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
    FormsModule,
  ],
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.css'],
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
    { value: 6, emoji: '🤩', label: 'Excellent' },
  ];

  setRating(value: number) {
    this.selectedRating = value;
  }

  submitFeedback() {
    console.log(
      `Feedback submitted: ${this.selectedRating} stars for ${this.data.hotelName}`
    );
    console.log(`Written feedback: ${this.feedbackText}`);

    this.dialogRef.close({
      rating: this.selectedRating,
      feedback: this.feedbackText,
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
        selectedRating: this.selectedRating,
      },
    });
  }

  getDefaultFeedbackText(selectedRating: number): string {
    switch (selectedRating) {
      case 1:
        return "We're really sorry you're feeling angry. If you'd like support, our team is here for you.";
      case 2:
        return "Sorry you're feeling down. Let us know if there's anything we can do to help!";
      case 3:
        return "Thank you for sharing. If there's anything you'd like to talk about, we're ready to listen.";
      case 4:
        return "Glad to hear you're feeling okay! If you have suggestions, we'd love to hear them.";
      case 5:
        return "Great to hear you're happy today! Thanks for your feedback!";
      case 6:
        return "Fantastic! We're thrilled you're feeling excited. Thank you for sharing your positivity!";
      default:
        return '';
    }
  }

  //get hotel image by hotel id
  getImagePath(reservationId: string): string {
    return `assets/images/${reservationId}.jpg`;
  }
}
