export interface Thread {
  threadId: string;
  requestId: string;
  participants: string[];
  type: 'guest' | 'staff' | 'admin';
}
