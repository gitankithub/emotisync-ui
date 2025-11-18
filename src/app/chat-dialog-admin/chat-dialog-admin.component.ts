import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../services/api.service';
import { Message, UserRole } from '../models/message.model';

@Component({
  selector: 'app-chat-dialog-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './chat-dialog-admin.component.html',
  styleUrls: ['./chat-dialog-admin.component.css']
})
export class ChatDialogAdminComponent implements OnInit {
  UserRole = UserRole; // Expose enum to template
  @Input() request: any;
  @Input() threadId = '';
  @Input() userId :string = '';
  @Input() role: string = '';
  @Output() closeChat = new EventEmitter<void>();

  chatMessages: Message[] = [];
  newMessage: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {}
  
  ngOnChanges() {
    if (this.threadId) {
      this.loadThreadMessages(this.threadId);
    }
  }

  
  loadThreadMessages(threadId: string) {
    this.chatMessages = [];
    this.api.getMessagesByThreadId(threadId, "", this.role).subscribe({
      next: (res) => {
        res.sort((a, b) => new Date(a.time ?? '').getTime() - new Date(b.time ?? '').getTime());
        res.forEach(msg => {
           this.chatMessages.push(msg);
        });
        console.log("Messages fetched:", res);
      },
      error: (err) => {
        console.error("Failed to fetch messages", err);
      }
    });
  }

  async sendMessage() {
   //api to send the admin message to the bot
   
   const payload: Message = {
      content: this.newMessage,
      userId: this.request.assignedTo ?? '',
      createdBy: UserRole.ADMIN,
      threadId : this.threadId,
    };
    this.chatMessages.push(payload)

    this.api.createMessage(payload).subscribe({
      next: (res) => {
        console.log('Request created:', res)
        this.loadThreadMessages(this.threadId ?? '')
      },
      error: (err) => console.error('Error:', err)
    });
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
