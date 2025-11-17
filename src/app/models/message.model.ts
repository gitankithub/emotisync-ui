export interface GuestFeedback {
  feedbackId?: string;
  guestId: string;
  feedbackText: string;
  rating: string;
}

export interface Message {
  threadId?: string;
  userId: string;
  createdBy: string;
  content: string;
  guestFeedback?: GuestFeedback;
  time?: string;
}
