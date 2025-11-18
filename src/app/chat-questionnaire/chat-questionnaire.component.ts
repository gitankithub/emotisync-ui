import {
  Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../services/api.service';
import { ChatService } from '../services/chat.service';
import { Reservation } from '../models/reservations.model';
import { ServiceRequest } from '../models/request.model';
import { MatDialog } from '@angular/material/dialog';
import { ChatComponent } from '../chat/chat.component';
import { Router } from '@angular/router';
import { GuestFeedback, Message, UserRole } from '../models/message.model';
import { LoginService } from '../services/login.service';


@Component({
  selector: 'app-chat-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, ChatComponent],
  templateUrl: './chat-questionnaire.component.html',
  styleUrls: ['./chat-questionnaire.component.css']
})
export class ChatQuestionnaireComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() reservation!: Reservation | null;
  @Input() activeRequest: ServiceRequest | null = null;
  @Input() selectedRating: number = 0;
  @Output() requestCreated = new EventEmitter<Message>();
  @Output() requestClosed = new EventEmitter<string>();
  @ViewChild('popupScroll') popupScroll!: ElementRef;

  options = ['Cleaning', 'Laundry', 'AC Repair', 'Need Towels'];
  selectedOption: string | null = null;
  chatMessages: Message[] = [];
  isTyping = false;
  typingInterval: any;
  botTimer: any;
  loggedUser = 'guest-001';
  userChatInput = '';
  ratingGiven: boolean = false;
  isChatVisible = false;
  userId : string = '';
  // stage: while request in progress or final rating
  stage: 'questionnaire' | 'in_progress' | 'final' = 'questionnaire';
  private messageDelay = 6000;
  private sequence = [
    'We’ve received your request. Please hold on...',
    'A staff member has been assigned to your request.',
    'Your request is currently in progress...',
    'Almost done! Your service will be completed shortly.',
    'Service completed! We hope you’re satisfied with your stay.'
  ];

  ratings = [
    { value: 1, emoji: '😡', label: 'Very Bad' },
    { value: 2, emoji: '😞', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😃', label: 'Very Good' },
    { value: 6, emoji: '🤩', label: 'Excellent' }
  ];

  private dialog = inject(MatDialog);
  constructor(private api: ApiService, private chatService: ChatService, private router: Router,private loginService :LoginService) { }


  ngOnInit() {
    if (this.activeRequest) this.loadThreadMessages(this.activeRequest.userThread?.threadId ?? '');
    this.userId = this.loginService.getUser().userId
  }

  ngAfterViewInit() { this.scrollToBottomPopup(); }

  ngOnDestroy() {
    clearInterval(this.typingInterval);
    clearInterval(this.botTimer);
  }

  ngOnChanges() {
    console.log('selectedRating on init:', this.selectedRating);
    console.log('reservation', this.reservation)
    console.log('active request', this.activeRequest)
    if (this.activeRequest) {
      this.selectedOption = this.getSelectedOption(this.activeRequest.requestDescription)
      this.loadThreadMessages(this.activeRequest.userThread?.threadId ?? '');
    }
  }

  //option selection
  selectOption(opt: string) {
    this.selectedOption = opt;
  }

  //get the selected option based on the request description
  getSelectedOption(description: string): string {
    const desc = description.toLowerCase();

    if (desc.includes("clean")) return "Cleaning";
    if (desc.includes("laundry")) return "Laundry";
    if (desc.includes("towel")) return "Need Towels";
    if (desc.includes("ac") || desc.includes("air conditioning")) return "AC Repair";

    return ""; // nothing matched
  }

  //build the description to send to the api
  buildDescription(): string {
    const roomType = this.reservation?.roomType
    const roomNumber = this.reservation?.roomNumber
    switch (this.selectedOption) {

      case 'Cleaning':
        return `Guest requested room cleaning for ${roomType} - ${roomNumber}.`;

      case 'Laundry':
        return `Guest requested laundry pickup from ${roomType} - ${roomNumber}.`;

      case 'AC Repair':
        return `Guest reports AC not working in ${roomType} - ${roomNumber}. Maintenance required.`;

      case 'Need Towels':
        return `Guest in ${roomType} - ${roomNumber} requested extra fresh towels.`;

      default:
        return '';
    }
  }

  getDefaultFeedbackText(): string {
  if (this.selectedRating >= 4) {
    return "Thank you for your feedback!";
  } else {
    return "We’re sorry for any inconvenience. Our team will assist you.";
  }
}

  //submit the request
  submitRequest() {
    const feedback: GuestFeedback = {
    guestId: this.reservation?.guestId ?? '',
    feedbackText: this.getDefaultFeedbackText() || '',
    rating: String(this.selectedRating)
  };
    const payload: Message = {
      content: this.buildDescription(),
      userId: this.reservation?.guestId ?? '',
      createdBy:UserRole.GUEST,
      guestFeedback: feedback
    };

    this.api.createMessage(payload).subscribe({
      next: (res) => {
        console.log('Request created:', res)
        this.requestCreated.emit(res);
        // this.loadThreadMessages(res.threadId ?? '')
      },
      error: (err) => console.error('Error:', err)
    });
  }

  //load the messages based on the thread id
  loadThreadMessages(threadId: string) {
    this.chatMessages = [];
    this.api.getMessagesByThreadId(threadId,this.userId ?? '',"GUEST").subscribe({
      next: (res) => {
        res.sort((a, b) => new Date(a.time ?? '').getTime() - new Date(b.time ?? '').getTime());
        res.forEach(msg => {
          if (msg.userId === this.userId && msg.createdBy === "ASSISTANT") {
            this.chatMessages.push(msg);
          }
        });
        console.log("Messages fetched:", res);
      },
      error: (err) => {
        console.error("Failed to fetch messages", err);
      }
    });
  }

  /** Final rating clicked — close request */
  selectFinalRating(r: number) {
    //api call to send the final feedback & close the request and open the new request
  }

  private scrollToBottomPopup() {
    setTimeout(() => {
      if (this.popupScroll?.nativeElement) {
        try {
          this.popupScroll.nativeElement.scrollTop = this.popupScroll.nativeElement.scrollHeight;
        } catch { }
      }
    }, 100);
  }

  openMiniChat() {
    this.isChatVisible = true;
  }

  closeMiniChat() {
    this.isChatVisible = false;
  }

  startNewRequest() {
    // Clear any active request and reset UI
    this.activeRequest = null;
    this.chatMessages = [];
    this.stage = 'in_progress'; // directly open as chat view (no options)
    this.selectedOption = null;
    this.selectedRating = 0;
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

}
