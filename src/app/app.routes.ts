import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ChatQuestionnaireComponent } from './chat-questionnaire/chat-questionnaire.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatDialogComponent } from './chat-dialog/chat-dialog.component';
import { GuestDashboardComponent } from './guest-dashboard/guest-dashboard.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'reservations', component: ReservationsComponent },
  { path: 'chat-questionnaire', component: ChatQuestionnaireComponent },
  { path: 'dashboard', component: DashboardComponent },
  // optional direct chat view by thread
  { path: 'chat/:threadId', component: ChatDialogComponent },
  { path: 'guest-dashboard', component: GuestDashboardComponent },
  {path: 'chat', component: ChatComponent},
  { path: '**', redirectTo: '' }
];
