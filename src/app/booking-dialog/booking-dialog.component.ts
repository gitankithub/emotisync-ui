import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service'; // ✅ Required for passing context

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
  private chatService = inject(ChatService); // ✅ For guest chat handoff

  selectedRating: number = 0;
  feedbackText: string = '';

  ratings = [
    { value: 1, emoji: '😞', label: 'Very Bad' },
    { value: 2, emoji: '😐', label: 'Okay' },
    { value: 3, emoji: '🙂', label: 'Good' },
    { value: 4, emoji: '😃', label: 'Great' },
    { value: 5, emoji: '🤩', label: 'Excellent' }
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

  /** ✅ Help button action — redirects to Guest Dashboard with reservation context */
  redirectToHelp() {
    // Store the current booking in ChatService context for continuity
    this.chatService.setReservationContext(this.data, this.selectedRating ?? 0);
    this.dialogRef.close();

    // Redirect to Guest Dashboard with username & reservation state
    this.router.navigate(['/guest-dashboard'], {
      state: {
        username: this.data.guestId,
        reservation: this.data
      }
    });
  }
}
