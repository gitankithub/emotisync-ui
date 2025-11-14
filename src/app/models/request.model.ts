export interface StatusType {
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'escalated';
  time?: string;
}

export interface Request {
  requestId: string;
  requestTitle: string;
  guestId: string;
  roomNumber: string;
  requestType: string;
  description?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'escalated';
  createdAt?: string;
  updatedAt?: string;
  guestThreadId?: string;
  staffThreadId?: string;
  adminThreadId?: string;
  statusHistory?: StatusType[];
}
