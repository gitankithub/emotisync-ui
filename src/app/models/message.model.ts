export interface GuestFeedback {
  feedbackId: string;
  guestId: string;
  feedbackText: string;
  rating: string;
}

export interface Message {
  threadId: string;
  userId: string;
  userRole: string;
  content: string;
  guestFeedback?: GuestFeedback;
  time: string;
}
