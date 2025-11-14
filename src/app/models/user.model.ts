export interface User {
  userId: string;
  email: string;
  name: string;
  role: 'guest' | 'staff' | 'admin';
}
