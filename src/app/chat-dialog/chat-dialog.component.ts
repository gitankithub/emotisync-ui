import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../services/api.service';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css']
})
export class ChatDialogComponent implements OnInit {
  @Input() request: any;
  @Input() threadId = '';
  @Input() username = '';
  @Input() role: 'guest' | 'staff' | 'admin' = 'guest';
  @Output() closeChat = new EventEmitter<void>();

  messages: Message[] = [];
  newMessage = '';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    if (this.threadId) {
      this.messages = await this.api.getMessages(this.threadId);
      setTimeout(() => this.scrollBottom(), 100);
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    const msg = await this.api.postMessage({
      threadId: this.threadId,
      senderId: this.username,
      text: this.newMessage.trim(),
      time: new Date().toISOString(), 
      messageType: 'user'
    });
    this.messages.push(msg);
    this.newMessage = '';
    setTimeout(() => this.scrollBottom(), 100);
  }

  scrollBottom() {
    const el = document.getElementById('chat-body');
    if (el) el.scrollTop = el.scrollHeight;
  }

  openInNewTab() {
    const url = `${window.location.origin}/chat/${this.threadId}`;
    window.open(url, '_blank');
  }
}
