import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnDestroy {
  @Output() closeChat = new EventEmitter<void>();

  messages: { sender: 'user' | 'bot'; text: string }[] = [];
  userInput: string = '';
  isTyping = false;
  typingTimer: any;

  constructor(private api: ApiService) {}

  /** Send message to backend & handle bot response */
  async sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    // Push user message
    this.messages.push({ sender: 'user', text });
    this.userInput = '';
    this.scrollToBottom();

    // Simulate bot typing delay
    this.isTyping = true;

    // Send to backend (mocked here)
    const botReply = await this.getBotReply(text);

    // Simulate natural delay
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.isTyping = false;
      this.messages.push({ sender: 'bot', text: botReply });
      this.scrollToBottom();
    }, 1500);
  }

  /** Mock API for bot reply (replace with real API later) */
  async getBotReply(userText: string): Promise<string> {
    try {
      // Example: call real backend later
      // const response = await this.api.sendToChatBot(userText);
      // return response.reply;
      const lower = userText.toLowerCase();
      if (lower.includes('room')) return 'Your room service request has been noted 🏨';
      if (lower.includes('food')) return 'Our restaurant is open 24/7 🍽️';
      if (lower.includes('thanks')) return 'You’re most welcome! 😊';
      return 'I’m here to help with anything related to your stay.';
    } catch {
      return 'Sorry, I’m having trouble connecting right now.';
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-body');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }

  close() {
    this.closeChat.emit();
  }

  ngOnDestroy() {
    clearTimeout(this.typingTimer);
  }
}
