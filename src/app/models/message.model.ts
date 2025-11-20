export interface GuestFeedback {
  feedbackId?: string;
  guestId: string;
  feedbackText: string;
  rating: string;
}

export interface Message {
  messageId?: string;
  threadId?: string;
  userId?: string;
  createdBy?: UserRole;
  visibility?: UserRole[];
  content: string;
  guestFeedback?: GuestFeedback;
  time?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  GUEST = 'GUEST',
  ASSISTANT = 'ASSISTANT'
}


