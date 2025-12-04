import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../services/api.service';
import { ActionDetail, Message, UserRole } from '../models/message.model';
import { ServiceRequest } from '../models/request.model';
import { interval, Subscription, switchMap } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../models/user.model';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatChipsModule,
  ],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css'],
})
export class ChatDialogComponent implements OnInit, OnChanges {
  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;
  UserRole = UserRole;

  @Input() request!: ServiceRequest;
  @Input() threadId = '';
  @Input() userId = '';
  @Input() role = '';
  @Output() closeChat = new EventEmitter<User>();
  @Output() statusUpdated = new EventEmitter<void>();

  currentActionList: ActionDetail[] = [];
  chatMsg: string = '';

  messages: Message[] = [];
  newMessage = '';
  currentStatus: string = '';
  isChatInputVisible: boolean = false;
  user!: User;
  nextActionsMap: Record<string, ActionDetail[]> = {
    ASSIGNED: [
      {
        actionType: 'ACCEPT',
        description: 'Accept and proceed',
        isInputRequired: false,
        notes: 'Asigned to a staff',
        disabled: false,
      },
      {
        actionType: 'REJECT',
        description: 'Reject the request',
        isInputRequired: true,
        notes: 'State the reason for rejection',
        disabled: false,
      },
      {
        actionType: 'MORE DETAILS NEEDED',
        description: 'Request more details from the initiator',
        isInputRequired: true,
        disabled: true,
      },
      {
        actionType: 'REASSIGN',
        description: 'Assign to another team member',
        isInputRequired: true,
        notes: 'Select new assignee',
        disabled: false,
      },
    ],
    ESCALATED: [
      {
        actionType: 'MARK COMPLETED',
        description: 'Mark as completed',
        isInputRequired: false,
        disabled: false,
      },
      {
        actionType: 'REJECT',
        description: 'Reject the request',
        isInputRequired: true,
        notes: 'State the reason for rejection',
        disabled: false,
      },
      {
        actionType: 'REASSIGN',
        description: 'Assign to another team member',
        isInputRequired: true,
        notes: 'Select new assignee',
        disabled: false,
      },
      {
        actionType: 'MESSAGE GUEST',
        description: 'Send a message to the guest',
        isInputRequired: true,
        notes: 'Type your message',
        disabled: false,
      }
    ],
    IN_PROGRESS: [
      {
        actionType: 'MARK COMPLETED',
        description: 'Mark as completed',
        isInputRequired: false,
        disabled: false,
      },
      {
        actionType: 'MORE DETAILS NEEDED',
        description: 'Request more details from the initiator',
        isInputRequired: true,
        disabled: true,
      },
      {
        actionType: 'MESSAGE GUEST',
        description: 'Send a message to the guest',
        isInputRequired: true,
        notes: 'Type your message',
        disabled: false,
      },
      {
        actionType: 'REASSIGN',
        description: 'Reassign to another',
        isInputRequired: true,
        notes: 'Pick new assignee',
        disabled: false,
      },
      {
        actionType: 'CANCEL',
        description: 'Cancel the task',
        isInputRequired: true,
        notes: 'Provide cancellation reason',
        disabled: false,
      },
    ],
    "REJECTED": [
      {
        actionType: 'ASSIGN ANOTHER',
        description: 'Assign to another team member',
        isInputRequired: true,
        notes: 'Select new assignee',
        disabled: false,
      },
      {
        actionType: 'SEND REASON',
        description: 'Send rejection reason/remark',
        isInputRequired: true,
        notes: 'Enter the reason',
        disabled: false,
      },
      {
        actionType: 'CANCEL',
        description: 'Cancel this step',
        isInputRequired: false,
        disabled: false,
      },
    ],
    'MORE DETAILS NEEDED': [
      {
        actionType: 'MESSAGE GUEST',
        description: 'Request information from guest',
        isInputRequired: true,
        notes: 'Type your question',
        disabled: false,
      },
      {
        actionType: 'AWAIT GUEST REPLY',
        description: 'Await guest reply',
        isInputRequired: false,
        disabled: true,
      },
    ],
  };
  private pollSubscription?: Subscription;
  private readonly POLL_INTERVAL = 3000;

  constructor(private api: ApiService, private loginService: LoginService) {}

  ngOnInit(): void {
    this.user = this.loginService.getUser();
    this.currentActionList = this.getAvailableActions(
      this.request.status ?? ''
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['threadId'] && this.threadId) ||
      (changes['request'] && this.request.threadId)
    ) {
      this.stopPolling();
      this.messages = [];
      this.startPolling();
      this.isChatInputVisible = false;
    }
    this.currentActionList = this.getAvailableActions(
      this.request.status ?? ''
    );
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadThreadMessages(threadId: string): void {
    this.messages = [];
    this.api.getMessagesByThreadId(threadId, this.userId, this.role).subscribe({
      next: (res) => {
        res.sort(
          (a, b) =>
            new Date(a.time ?? '').getTime() - new Date(b.time ?? '').getTime()
        );
        this.messages = [...res];
        console.log('Messages fetched:', res);
        this.currentActionList = this.getAvailableActions(
          this.request.status ?? ''
        );
      },
      error: (err) => {
        console.error('Failed to fetch messages', err);
      },
    });
  }

  sendMessage(): void {
    let content = '';
    if (this.chatMsg && this.chatMsg.trim()) {
      content = this.newMessage
        ? `${this.chatMsg}. Staff Note: "${this.newMessage}"`
        : this.chatMsg;
    } else {
      content = this.newMessage;
    }
    const payload: Message = {
      content: content,
      userId: this.request.assignedTo ?? '',
      createdBy: UserRole.STAFF,
      threadId: this.threadId,
    };
    this.messages.push(payload);
    this.newMessage = '';
    this.api.createMessage(payload).subscribe({
      next: (res) => {
        console.log('Message sent:', res);
        // this.newMessage = '';
        this.chatMsg = '';
        this.loadThreadMessages(this.threadId);
        this.statusUpdated.emit();
      },
      error: (err) => console.error('Error sending message:', err),
    });
  }

  startPolling(): void {
    if (!this.threadId) return;
    this.loadThreadMessages(this.threadId);
    this.pollSubscription = interval(this.POLL_INTERVAL)
      .pipe(switchMap(() => this.pollForNewMessages()))
      .subscribe((newMessages) => this.appendUniqueMessages(newMessages));
  }

  stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  pollForNewMessages() {
    return this.api.getMessagesByThreadId(this.threadId, '', this.role);
  }

  appendUniqueMessages(newMessages: Message[]): void {
    if (this.messages.length === 0) {
      this.messages = [...newMessages];
      return;
    }
    const existingIds = new Set(this.messages.map((m) => m.messageId));
    for (const msg of newMessages) {
      if (!existingIds.has(msg.messageId)) {
        this.messages.push(msg);
        existingIds.add(msg.messageId);
      }
    }
  }

  scrollBottom(): void {
    const el = document.getElementById('chat-body');
    if (el) el.scrollTop = el.scrollHeight;
  }

  openInNewTab(): void {
    const url = `${window.location.origin}/chat/${this.threadId}`;
    window.open(url, '_blank');
  }

  handleAction(action: ActionDetail) {
    if (action) {
      let statusUpdate = action.actionType;
      let staffName = this.user.name || 'Staff';
      let chatMsg = '';

      switch (action.actionType) {
        case 'ACCEPT':
          statusUpdate = 'IN_PROGRESS';
          chatMsg = `${staffName} accepted this request and has started working on it.`;
          break;
        case 'REJECT':
          statusUpdate = 'REJECTED';
          chatMsg = `${staffName} rejected this request.`;
          break;
        case 'MORE DETAILS NEEDED':
          statusUpdate = 'IN_PROGRESS';
          chatMsg = `${staffName} requested more details from the guest.`;
          break;
        case 'REASSIGN':
          statusUpdate = 'REASSIGNED';
          chatMsg = `${staffName} reassigned the request to another staff member.`;
          break;
        case 'MARK COMPLETED':
          statusUpdate = 'COMPLETED';
          chatMsg = `${staffName} marked this request as completed.`;
          break;
        case 'MESSAGE GUEST':
          statusUpdate = 'IN_PROGRESS';
          chatMsg = `${staffName} sent a message to the guest regarding this request.`;
          break;
        case 'CANCEL':
          statusUpdate = 'CANCELLED';
          chatMsg = `${staffName} cancelled this request.`;
          break;
        default:
          chatMsg = `${staffName} took an action on this request.`;
          break;
      }
      this.request.status = statusUpdate;
      this.currentStatus = statusUpdate;
      // The updateStatus API call is generic for updates
      this.chatMsg = chatMsg;

      if (action.isInputRequired) {
        this.isChatInputVisible = true;
      } else {
        this.sendMessage();
        this.isChatInputVisible = false;
      }
    }
  }

  getAvailableActions(status: string): ActionDetail[] {
    return this.nextActionsMap[status] || [];
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
}
