import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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
  UserRole = UserRole;

  @Input() request!: ServiceRequest;
  @Input() threadId = '';
  @Input() userId = '';
  @Input() role = '';
  @Output() closeChat = new EventEmitter<void>();

  currentActionList: ActionDetail[] = [];

  messages: Message[] = [];
  newMessage = '';
  currentStatus: string = '';
  isChatInputVisible: boolean = false;
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
    IN_PROGRESS: [
      {
        actionType: 'MARK COMPLETED',
        description: 'Mark as completed',
        isInputRequired: false,
        disabled: false,
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
    REJECT: [
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
      }
    ],
  };
  private pollSubscription?: Subscription;
  private readonly POLL_INTERVAL = 60000;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.currentActionList = this.getAvailableActions(this.request.status);
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
    this.currentActionList = this.getAvailableActions(this.request.status);

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
        this.currentActionList = this.getAvailableActions(this.request.status);
      },
      error: (err) => {
        console.error('Failed to fetch messages', err);
      },
    });
  }

  sendMessage(msg: string, status: string): void {
    let updateMsg;
    if (msg) {
      updateMsg = 'Staff responded to this service request and  updated status with ' + status + ' and provided message: ' + msg;
    } else {
      updateMsg = 'Staff responded to this service request and updated status with ' + status;
    }
    console.log(updateMsg);
    if (!updateMsg.trim()) return;
    const payload: Message = {
      content: updateMsg,
      userId: this.request.assignedTo ?? '',
      createdBy: UserRole.STAFF,
      threadId: this.threadId,
    };
    this.messages.push(payload);
    

    this.api.createMessage(payload).subscribe({
      next: (res) => {
        console.log('Message sent:', res);
    this.newMessage = '';
        this.loadThreadMessages(this.threadId);
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

  handleAction(reqId: string, action: ActionDetail) {
    if (action) {
      let statusUpdate = action.actionType;
      switch (action.actionType) {
        case 'ACCEPT':
          statusUpdate = 'IN_PROGRESS';
          break;
        case 'REJECT':
          statusUpdate = 'REJECTED';
          break;
        case 'MORE DETAILS NEEDED':
          // Open message input UI.
          break;
        case 'REASSIGN':
          statusUpdate = 'REASSIGNED';
          break;
        case 'MARK COMPLETED':
          statusUpdate = 'COMPLETED';
          break;
        case 'MESSAGE TO GUEST':
          // Open message input UI.
          break;
        case 'CANCEL':
          statusUpdate = 'CANCELLED';
          break;
        default:
          statusUpdate = 'ASSIGNED';
          break;
      }
      this.currentStatus = statusUpdate;
      if (action.isInputRequired) {
        this.isChatInputVisible = true;
      }
      // The updateStatus API call is generic for updates
      if (!action.isInputRequired)
        this.sendMessage(this.newMessage, this.currentStatus);
    }
  }

  getAvailableActions(status: any): ActionDetail[] {
    return this.nextActionsMap[status] || [];
  }
}
