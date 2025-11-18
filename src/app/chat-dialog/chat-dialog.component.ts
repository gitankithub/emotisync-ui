import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../services/api.service';
import { Message, UserRole } from '../models/message.model';
import { ServiceRequest } from '../models/request.model';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css']
})
export class ChatDialogComponent implements OnInit, OnChanges {

  UserRole = UserRole;

  @Input() request!: ServiceRequest;
  @Input() threadId = '';
  @Input() userId = '';
  @Input() role = '';
  @Output() closeChat = new EventEmitter<void>();

  messages: Message[] = [];
  newMessage = '';

  private pollSubscription?: Subscription;
  private readonly POLL_INTERVAL = 3000;

  constructor(private api: ApiService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['threadId'] && this.threadId) || (changes['request'] && this.request.threadId)) {
      this.stopPolling();
      this.messages = [];
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadThreadMessages(threadId: string): void {
    this.messages = [];
    this.api.getMessagesByThreadId(threadId, this.userId, this.role).subscribe({
      next: (res) => {
        res.sort(
          (a, b) => new Date(a.time ?? '').getTime() - new Date(b.time ?? '').getTime()
        );
        this.messages = [...res];
        console.log('Messages fetched:', res);
      },
      error: (err) => {
        console.error('Failed to fetch messages', err);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    const payload: Message = {
      content: this.newMessage,
      userId: this.request.assignedTo ?? '',
      createdBy: UserRole.ADMIN,
      threadId: this.threadId,
    };
    this.messages.push(payload);

    this.api.createMessage(payload).subscribe({
      next: (res) => {
        console.log('Message sent:', res);
        this.newMessage = '';
        this.loadThreadMessages(this.threadId);
      },
      error: (err) => console.error('Error sending message:', err)
    });
  }

  startPolling(): void {
    if (!this.threadId) return;
    this.loadThreadMessages(this.threadId);
    this.pollSubscription = interval(this.POLL_INTERVAL)
      .pipe(switchMap(() => this.pollForNewMessages()))
      .subscribe(newMessages => this.appendUniqueMessages(newMessages));
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
    const existingIds = new Set(this.messages.map(m => m.messageId));
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
  
}
