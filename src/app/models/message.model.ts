import { ServiceRequest } from "./request.model";

export interface GuestFeedback {
  feedbackId?: string;
  guestId: string;
  feedbackText: string;
  rating: string;
}

export interface Message {
  messageId?: string;
  threadId?: string;
  userId?: string;
  createdBy?: UserRole;
  visibility?: UserRole[];
  content: string;
  guestFeedback?: GuestFeedback;
  time?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  GUEST = 'GUEST',
  ASSISTANT = 'ASSISTANT'
}

export interface ActionDetail {
  actionType: string;
  description: string;
  isInputRequired: boolean;
  notes?: string;
  disabled: boolean;
}

export interface ChatResponse {
    chatRequest: ChatRequest;
    assistantReply: string;
}

export interface ChatRequest {
  id?: string;                // Optional, use '?' if might be undefined
  senderId: string;
  status: string;             // e.g. "ACTIVE", "CLOSED"
  createdAt: string;          // ISO String (or Date), recommended type below
  updatedAt: string;          // ISO String (or Date), recommended type below
}

export interface ChatMessage {
  id?: string;
  chatRequestId?: string;
  senderId: string;
  createdBy: UserRole;
  message: string;
  status?: string;          // Optional if not always set
  timestamp?: string;        // ISO8601 string, or Date
}

export interface BestMatchScore {
  bestScore: number;
  bestMatch: ServiceRequest;
}



