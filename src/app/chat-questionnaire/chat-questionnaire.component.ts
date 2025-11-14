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
import { Request } from '../models/request.model';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatComponent } from '../chat/chat.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-chat-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule,ChatComponent],
  templateUrl: './chat-questionnaire.component.html',
  styleUrls: ['./chat-questionnaire.component.css']
})
export class ChatQuestionnaireComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() reservation!: Reservation | null;
  @Input() activeRequest: Request | null = null;
  @Input() selectedRating: number = 0;
  @Output() requestCreated = new EventEmitter<Request>();
  @Output() requestClosed = new EventEmitter<string>();
  @ViewChild('popupScroll') popupScroll!: ElementRef;

  options = ['Cleaning', 'Laundry', 'AC Repair', 'Need Towels', 'Others'];
  selectedOption: string | null = null;
  otherIssue = '';
  chatMessages: { sender: 'user' | 'bot'; text: string }[] = [];
  isTyping = false;
  typingInterval: any;
  botTimer: any;
  loggedUser = 'guest-001';
  userChatInput = '';
  ratingGiven: boolean = false;
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

    private dialog = inject(MatDialog);

  constructor(private api: ApiService, private chatService: ChatService,private router: Router) {}

  ngOnInit() {
    console.log('selectedRating on init:', this.selectedRating);
    const ctx = this.chatService.getReservationContext();
    if (ctx?.reservation) this.reservation = ctx.reservation;
    this.loggedUser = this.reservation?.guestId || 'guest-001';

    // If we already have an activeRequest on init, load conversation
    if (this.activeRequest) this.loadConversation();
  }

  ngAfterViewInit() { this.scrollToBottomPopup(); }

  ngOnDestroy() {
    clearInterval(this.typingInterval);
    clearInterval(this.botTimer);
  }

  selectOption(opt: string) {
    this.selectedOption = opt;
  }

  /** Submit new issue — create Request and start bot sequence */
  async submitIssue() {
    const issue = this.selectedOption === 'Others' ? (this.otherIssue || 'Other issue') : (this.selectedOption ?? '');
    const summary = `Guest ${this.loggedUser} reported: ${issue} (booking: ${this.reservation?.hotelName || 'N/A'})`;

    // create request via ApiService (persists to localStorage)
    const newReq = await this.api.createRequest(this.loggedUser, 'N/A', issue, summary);

    // set as active and emit so dashboard can add
    this.activeRequest = newReq;
    this.requestCreated.emit(newReq);

    // prepare chat and start bot flow
    this.chatMessages = [{ sender: 'user', text: `Created request: ${newReq.requestId} — ${issue}` }];
    this.stage = 'in_progress';
    this.saveConversation();
    // start bot messages (status updates)
    this.startBotFlow(newReq.requestId);
  }

  /** Start bot timeline (status updates + messages). Continues in background. */
  private startBotFlow(requestId: string) {
    let idx = 0;
    const statusMap: ('open' | 'assigned' | 'in_progress' | 'in_progress' | 'completed')[] =
      ['open', 'assigned', 'in_progress', 'in_progress', 'completed'];

    const step = async () => {
      if (idx >= this.sequence.length) {
        clearInterval(this.botTimer);
        return;
      }
      // send bot message with typewriter effect
      await this.typewriterAddPopup(this.sequence[idx]);

      // update request status
      const newStatus = statusMap[idx];
      this.activeRequest!.status = newStatus;
      await this.api.updateRequestStatus(requestId, newStatus);

      // if last step, ask for rating
      if (idx === this.sequence.length - 1) {
        await this.typewriterAddPopup('Can you please rate the service?');
        this.stage = 'final';
        this.saveConversation();
      } else {
        this.stage = 'in_progress';
        this.saveConversation();
      }
      idx++;
    };

    // run first step immediately, then interval for next steps
    step();
    this.botTimer = setInterval(step, this.messageDelay);
  }

  /** Typewriter for bot messages (pushes to chatMessages) */
  private async typewriterAddPopup(text: string) {
    return new Promise<void>(resolve => {
      let typed = '';
      let i = 0;
      this.isTyping = true;
      this.typingInterval = setInterval(() => {
        typed += text[i];
        if (i === text.length - 1) {
          clearInterval(this.typingInterval);
          this.isTyping = false;
          this.chatMessages.push({ sender: 'bot', text: typed });
          this.scrollToBottomPopup();
          this.saveConversation();
          resolve();
        } else i++;
      }, 25);
    });
  }

  /** Final rating clicked — close request */
  async selectFinalRating(r: number) {
    if (!this.activeRequest) return;
    await this.typewriterAddPopup(`Thank you for your feedback: ${r}/5`);
    await this.api.updateRequestStatus(this.activeRequest.requestId, 'completed');
    this.requestClosed.emit(this.activeRequest.requestId);

    // clear active request to show new questionnaire UI
    this.activeRequest = null;
    this.chatMessages = [];
    this.stage = 'questionnaire';
    this.selectedOption = null;
    this.otherIssue = '';
    this.saveConversation();
  }

  /** small chat in right-bottom - user messages while request active */
  async sendChat() {
    if (!this.userChatInput?.trim()) return;
    const txt = this.userChatInput.trim();
    this.chatMessages.push({ sender: 'user', text: txt });
    this.userChatInput = '';
    this.saveConversation();

    // bot auto-reply (short)
    setTimeout(async () => {
      await this.typewriterAddPopup('Thanks — our staff will assist you shortly.');
    }, 1000);
  }

  /** Load saved conversation (by requestId) */
  private loadConversation() {
    if (!this.activeRequest) return;
    try {
      const key = `conv_${this.activeRequest.requestId}_${this.loggedUser}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const obj = JSON.parse(saved);
        this.chatMessages = obj.chatMessages || [];
        this.stage = obj.stage || (this.chatMessages.length ? 'in_progress' : 'questionnaire');
      } else {
        this.chatMessages = [];
        this.stage = 'in_progress';
      }

      // resume bot if not completed
      if (this.stage === 'in_progress' && this.activeRequest.status !== 'completed') {
        // let resumeBotFlow decide whether to continue from last message count
        this.resumeBotFlow();
      }
    } catch (e) {
      console.warn('loadConversation error', e);
    }
  }

  /** Resume background bot flow based on bot messages count (so it continues) */
  private resumeBotFlow() {
    if (!this.activeRequest) return;
    const botCount = this.chatMessages.filter(m => m.sender === 'bot').length;
    // determine next index from botCount
    let nextIdx = Math.min(botCount, this.sequence.length - 1);
    // If there are still steps remaining, start bot from nextIdx
    if (botCount < this.sequence.length) {
      // create a small wrapper to start from proper index: we simply call startBotFlow,
      // which always executes from idx=0; to avoid repeating messages, we skip sending those already present.
      // Instead we'll re-run the sequence but skip pushing messages already in chat - simple approach.
      // For simplicity we start a new flow but first remove already completed sequence items from `sequenceToRun`.
      const remainingSequence = this.sequence.slice(botCount);
      // create a small function to step through remainingSequence and update status accordingly
      let idx = 0;
      const statusMap: ('open' | 'assigned' | 'in_progress' | 'in_progress' | 'completed')[] =
        ['open', 'assigned', 'in_progress', 'in_progress', 'completed'];

      const step = async () => {
        if (idx >= remainingSequence.length) {
          clearInterval(this.botTimer);
          return;
        }
        await this.typewriterAddPopup(remainingSequence[idx]);
        // compute the global index to use status map
        const globalIdx = botCount + idx;
        const newStatus = statusMap[globalIdx];
        this.activeRequest!.status = newStatus;
        await this.api.updateRequestStatus(this.activeRequest!.requestId, newStatus);
        if (globalIdx === this.sequence.length - 1) {
          await this.typewriterAddPopup('Can you please rate the service?');
          this.stage = 'final';
        }
        idx++;
      };

      step();
      this.botTimer = setInterval(step, this.messageDelay);
    }
  }

  private saveConversation() {
    if (!this.activeRequest) return;
    const key = `conv_${this.activeRequest.requestId}_${this.loggedUser}`;
    const obj = {
      chatMessages: this.chatMessages,
      stage: this.stage
    };
    localStorage.setItem(key, JSON.stringify(obj));
  }

  private scrollToBottomPopup() {
    setTimeout(() => {
      if (this.popupScroll?.nativeElement) {
        try {
          this.popupScroll.nativeElement.scrollTop = this.popupScroll.nativeElement.scrollHeight;
        } catch {}
      }
    }, 100);
  }

  isChatVisible = false;

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
  this.otherIssue = '';
}

setRating(value: number) {
    this.selectedRating = value;
  }



}
