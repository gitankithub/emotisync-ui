import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  inject,
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
import {
  BestMatchScore,
  ChatMessage,
  GuestFeedback,
  Message,
  UserRole,
} from '../models/message.model';
import { LoginService } from '../services/login.service';
import { firstValueFrom, interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-chat-questionnaire',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ChatComponent,
  ],
  templateUrl: './chat-questionnaire.component.html',
  styleUrls: ['./chat-questionnaire.component.css'],
})
export class ChatQuestionnaireComponent implements OnInit, OnDestroy {
  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;
  @Input() reservation!: Reservation | null;
  @Input() activeRequest: ServiceRequest | null = null;
  @Input() selectedRating: number = 0;
  @Output() requestCreated = new EventEmitter<Message | null>();
  @Output() requestClosed = new EventEmitter<string>();

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
  userId: string = '';
  private sequenceInterval: any;
  private currentSeqIndex = 0;
  alertMessage: string = '';
  // stage: while request in progress or final rating
  stage: 'questionnaire' | 'in_progress' | 'final' = 'questionnaire';
  private messageDelay = 3000;
  private sequence = [
    'We’ve received your request. Please hold on...',
    'We are assigning a staff member to assist you.',
    'A staff member has been assigned to your request.',
  ];

  ratings = [
    { value: 1, emoji: '😡', label: 'Angry' },
    { value: 2, emoji: '😞', label: 'Sad' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😃', label: 'Happy' },
    { value: 6, emoji: '🤩', label: 'Excited' },
  ];
  finalRating: number = 0;

  private dialog = inject(MatDialog);
  private pollSubscription?: Subscription;
  private readonly POLL_INTERVAL = 3000;
  constructor(
    private api: ApiService,
    private chatService: ChatService,
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    if (this.activeRequest)
      this.loadThreadMessages(this.activeRequest.userThread?.threadId ?? '');
    this.userId = this.loginService.getUser().userId;
  }

  ngOnDestroy() {
    clearInterval(this.typingInterval);
    clearInterval(this.botTimer);
    this.stopPolling();
  }

  ngOnChanges() {
    console.log('selectedRating on init:', this.selectedRating);
    console.log('reservation', this.reservation);
    console.log('active request', this.activeRequest);
    if (this.activeRequest) {
      this.selectedOption = this.getSelectedOption(
        this.activeRequest.requestDescription
      );
      this.stopPolling();
      this.startPolling(this.activeRequest);
    }
  }

  startPolling(activeRequest: ServiceRequest): void {
    console.log('Starting polling for new messages...');
    if (!activeRequest.userThread?.threadId) return;
    this.loadThreadMessages(activeRequest.userThread?.threadId);
    this.pollSubscription = interval(this.POLL_INTERVAL)
      .pipe(switchMap(() => this.pollForNewMessages(this.activeRequest)))
      .subscribe((newMessages) => this.appendUniqueMessages(newMessages));
  }

  pollForNewMessages(activeRequest: ServiceRequest | null) {
    return this.api.getMessagesByThreadId(
      activeRequest?.userThread?.threadId ?? '',
      this.userId,
      UserRole.GUEST
    );
  }

  appendUniqueMessages(newMessages: Message[]): void {
    if (this.chatMessages.length === 0) {
      this.chatMessages = newMessages.filter(
        (msg) => msg.userId === this.userId && msg.createdBy === 'ASSISTANT'
      );
      return;
    }

    const existingIds = new Set(this.chatMessages.map((m) => m.messageId));

    for (const msg of newMessages) {
      const isAssistantMsg =
        msg.userId === this.userId && msg.createdBy === 'ASSISTANT';

      if (isAssistantMsg && !existingIds.has(msg.messageId)) {
        this.chatMessages.push(msg);
        existingIds.add(msg.messageId);
      }
    }
  }

  stopPolling(): void {
    console.log('Stopping polling for new messages...');
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }
  //option selection
  selectOption(opt: string) {
    this.selectedOption = opt;
  }

  //get the selected option based on the request description
  getSelectedOption(description: string): string {
    const desc = description.toLowerCase();

    if (desc.includes('clean')) return 'Cleaning';
    if (desc.includes('laundry')) return 'Laundry';
    if (desc.includes('towel')) return 'Need Towels';
    if (desc.includes('ac') || desc.includes('air conditioning'))
      return 'AC Repair';

    return ''; // nothing matched
  }

  //build the description to send to the api
  buildDescription(): string {
    const roomType = this.reservation?.roomType;
    const roomNumber = this.reservation?.roomNumber;
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
    switch (this.selectedRating) {
      case 1:
        return "We're really sorry you're feeling angry. If you'd like support, our team is here for you.";
      case 2:
        return "Sorry you're feeling down. Let us know if there's anything we can do to help!";
      case 3:
        return "Thank you for sharing. If there's anything you'd like to talk about, we're ready to listen.";
      case 4:
        return "Glad to hear you're feeling okay! If you have suggestions, we'd love to hear them.";
      case 5:
        return "Great to hear you're happy today! Thanks for your feedback!";
      case 6:
        return "Fantastic! We're thrilled you're feeling excited. Thank you for sharing your positivity!";
      default:
        return '';
    }
  }

  //submit the request
  async submitRequest() {
    this.alertMessage = '';
    //if (await this.checkIfRequestExists()) return;
    this.startTemporarySequence();
    const feedback: GuestFeedback = {
      guestId: this.reservation?.guestId ?? '',
      feedbackText: this.getDefaultFeedbackText() || '',
      rating: String(this.selectedRating),
    };
    const payload: Message = {
      content: this.buildDescription(),
      userId: this.reservation?.guestId ?? '',
      createdBy: UserRole.GUEST,
      guestFeedback: feedback,
    };

    this.api.createMessage(payload).subscribe({
      next: (res) => {
        console.log('Request created:', res);
        this.requestCreated.emit(res);
        this.stopTemporarySequence();
      },
      error: (err) => {
        console.error('Error:', err);
        this.alertMessage = 'Sorry, I couldn’t complete your request. Let’s try again together.';
      },
    });
  }

  private async checkIfRequestExists(): Promise<boolean> {
    this.isTyping = true;
    const payload: ChatMessage = {
      message: this.buildDescription(),
      senderId: this.reservation?.guestId ?? '',
      createdBy: UserRole.GUEST,
      timestamp: new Date().toISOString(),
    };

    try {
      const response: BestMatchScore = await firstValueFrom(
        this.api.checkExistingServiceRequest(payload)
      );
      if (response && response.bestScore >= 0.7) {
        this.alertMessage = `You already have an active request for "${response.bestMatch.requestTitle}" (Status: ${response.bestMatch.status}). Please review your existing requests before adding a new one. To get support on an existing request, please use the chat assistant and mention your request type—for example, “Laundry Pickup” or “Room Cleaning”—when you start the conversation.`;
      } else {
        this.alertMessage = '';
      }
      
    } catch (error) {
      this.alertMessage = 'Sorry, I couldn’t complete your request. Let’s try again together.';
      console.error('Error checking existing requests:', error);
    }
    this.isTyping = false;
    return this.alertMessage !== '';
  }

  //load the messages based on the thread id
  loadThreadMessages(threadId: string) {
    this.chatMessages = [];
    this.api
      .getMessagesByThreadId(threadId, this.userId ?? '', 'GUEST')
      .subscribe({
        next: (res) => {
          res.sort(
            (a, b) =>
              new Date(a.time ?? '').getTime() -
              new Date(b.time ?? '').getTime()
          );
          res.forEach((msg) => {
            if (msg.userId === this.userId && msg.createdBy === 'ASSISTANT') {
              this.chatMessages.push(msg);
            }
          });
          console.log('Messages fetched:', res);
        },
        error: (err) => {
          console.error('Failed to fetch messages', err);
        },
      });
  }

  /** Final rating clicked — close request */
  submitFinalRating(r: number) {
    this.finalRating = r;
    const finalFeedbackText = this.getDefaultFeedbackText();

    const content = `The guest has submitted the final service rating of ${r} with feedback: "${finalFeedbackText}". Please proceed to close the request.`;

    const payload: Message = {
      threadId: this.activeRequest?.userThread?.threadId,
      content: content,
      userId: this.reservation?.guestId ?? '',
      createdBy: UserRole.GUEST,
      guestFeedback: {
        guestId: this.reservation?.guestId ?? '',
        rating: String(r),
        feedbackText: finalFeedbackText,
      },
    };

    this.api.createMessage(payload).subscribe({
      next: (res) => {
        console.log('Final rating message sent:', res);
        this.requestCreated.emit(res);
      },
      error: (err) => {
        console.error('Error submitting final rating:', err);
      },
    });
  }

  scrollToBottom(): void {
    if (this.chatBody) {
      const el = this.chatBody.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  // This lifecycle runs after every change, including new messages
  ngAfterViewChecked(): void {
    this.scrollToBottom();
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
    this.requestCreated.emit(null);
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  private startTemporarySequence() {
    this.chatMessages = [];
    this.currentSeqIndex = 0;

    this.isTyping = true;

    this.sequenceInterval = setInterval(() => {
      if (this.currentSeqIndex >= this.sequence.length) return;

      this.chatMessages.push({
        content: this.sequence[this.currentSeqIndex],
      });

      this.currentSeqIndex++;
    }, 1000);
  }

  private stopTemporarySequence() {
    clearInterval(this.sequenceInterval);
    this.isTyping = false;
  }
}
