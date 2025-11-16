import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../services/api.service';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat-dialog',
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

  chatMessages: string[] = [];
  newMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit() {}
  
  ngOnChanges() {
    if (this.threadId) {
      this.chatMessages = this.loadThreadMessages(this.threadId) ?? [];
    }
  }

  
  loadThreadMessages(threadId: string) {
    this.chatMessages = [];
    this.api.getMessagesByThreadId(threadId).subscribe({
      next: (res) => {
        res.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        res.forEach(msg => {
          if (msg.userRole === 'STAFF') {
            this.chatMessages.push(msg.content);
          }
        });
        console.log("Messages fetched:", res);
      },
      error: (err) => {
        console.error("Failed to fetch messages", err);
      }
    });
  }

  async sendMessage() {
   //api to send the staff message to the bot
   this.chatMessages.push(this.newMessage)
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
