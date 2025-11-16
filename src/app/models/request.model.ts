export type RequestStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ESCALATED';

export interface Participant {
  id: string;
  role: 'GUEST' | 'STAFF' | 'ADMIN';
}

export interface UserThread {
  threadId: string;
  requestId: string;
  participantIds: Participant[];
  status: RequestStatus;
  createdAt: string;
}

export interface Request {
  requestId?: string;
  requestTitle?: string;
  requestDescription: string;
  requestUrgency?: string;
  assignedTo?: string;
  guestId: string;
  status?: string;
  userThread?: UserThread;
  createdAt?: string;
  updatedAt?: string;
}
