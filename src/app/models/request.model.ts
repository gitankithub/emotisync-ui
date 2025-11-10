export interface Request {
  requestId: string;
  guestId: string;
  roomNumber: string;
  requestType: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'escalated';
  createdAt: string;
  updatedAt: string;
  guestThreadId: string;
  staffThreadId: string;
  adminThreadId: string;
}
