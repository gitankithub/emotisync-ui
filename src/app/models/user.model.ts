export interface User {
  userId: string;
  name: string;
  role: 'guest' | 'staff' | 'admin';
}
