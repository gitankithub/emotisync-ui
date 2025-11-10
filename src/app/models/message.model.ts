export interface Message {
  messageId: string;
  threadId: string;
  senderId: string; // userId or 'bot'
  text: string;
  time: string;
  messageType: 'user' | 'bot' | 'system';
}
