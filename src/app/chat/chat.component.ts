import {
  Component,
  EventEmitter,
  Output,
  OnDestroy,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../services/api.service';
import { ChatMessage, ChatResponse, UserRole } from '../models/message.model';
import { User } from '../models/user.model';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;
  @Output() closeChat = new EventEmitter<void>();
  chatResponse!: ChatResponse;
  messages: ChatMessage[] = [];
  userInput: string = '';
  isTyping = false;
  user!: User;
  UserRole = UserRole;

  constructor(private api: ApiService, private loginService: LoginService) {}

  ngOnInit(): void {
    this.user = this.loginService.getUser();
  }

  /** Send message to backend & handle bot response */
  async sendMessage() {
    // Simulate bot typing delay
    this.isTyping = true;
    const text = this.userInput.trim();
    if (!text) return;
    const requestPayload: ChatMessage = this.buildPayload(text, UserRole.GUEST);
    this.messages.push(requestPayload);
    this.scrollToBottom();
    this.api.sendUserMessage(requestPayload).subscribe({
      next: (res) => {
        this.userInput = '';
        console.log('Final rating message sent:', res);
        this.chatResponse = res;
        const responseReply = this.buildPayload(
          res.assistantReply,
          UserRole.ASSISTANT
        );
        this.messages.push(responseReply);
        // Simulate bot typing delay
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.userInput = '';
        console.error('Error sending chat mesage..', err);
        const errorPayload = this.buildPayload(
          'Sorry, there was an error processing your message. Please try again later.',
          UserRole.ASSISTANT
        );
        this.messages.push(errorPayload);
        this.isTyping = false;
        this.scrollToBottom();
      },
    });
  }

  async doPause() {
    console.log('Start');
    await new Promise((resolve) => setTimeout(resolve, 1000)); // pauses for 1 second
    console.log('End');
  }

  private buildPayload(message: string, createdBy: UserRole): ChatMessage {
    return {
      chatRequestId: this.chatResponse?.chatRequest?.id ?? '',
      message: message,
      senderId: this.user?.userId ?? '',
      createdBy: createdBy,
      timestamp: new Date().toISOString(),
    };
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

  close() {
    this.isTyping = false;
    this.chatResponse = undefined as any;
    this.messages = [];
    if (this.chatResponse && this.chatResponse.chatRequest){
      this.api.closeSession(this.chatResponse.chatRequest.id ?? '');
    }
    this.closeChat.emit();
  }

  ngOnDestroy() {
    this.close();
  }
}
