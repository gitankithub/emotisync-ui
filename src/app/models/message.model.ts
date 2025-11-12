export interface Message {
  messageId?: string;
  threadId?: string;
  senderId: string; // user id or 'bot' or 'system'
  text: string;
  time: string;
  messageType: 'user' | 'bot' | 'system';
}
