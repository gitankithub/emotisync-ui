import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatComponent } from './chat-dialog/chat-dialog.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'chat/:threadId', component: ChatComponent },
  { path: '**', redirectTo: '' }
];
