import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatData: Record<string, { sender: string; text: string }[]> = {};

  // Each request belongs to a user
  private requests = [
    { id: 'REQ-001', details: 'Chat about refund policy', owner: 'guest1' },
    { id: 'REQ-002', details: 'Product inquiry chat', owner: 'guest2' },
    { id: 'REQ-003', details: 'Order tracking discussion', owner: 'guest1' },
    { id: 'REQ-004', details: 'Support bot conversation', owner: 'guest2' },
    { id: 'REQ-005', details: 'General feedback chat', owner: 'guest1' }
  ];

  getAllRequests() {
    return this.requests;
  }

  getRequestsForUser(username: string) {
    if (username === 'staff' || username === 'admin') {
      return this.requests;
    }
    return this.requests.filter(r => r.owner === username);
  }

  initRequest(requestId: string) {
    this.chatData[requestId] = [
      { sender: 'Bot', text: 'Hello! How can I help you today?' },
      { sender: 'Guest', text: 'Hi, I just have a quick question.' }
    ];
  }

  getMessages(requestId: string) {
    return this.chatData[requestId] || [];
  }

  addMessage(requestId: string, sender: string, text: string) {
    if (!this.chatData[requestId]) this.chatData[requestId] = [];
    this.chatData[requestId].push({ sender, text });
  }

  getUserRoleMessages(requestId: string, role: string) {
  return this.chatData[requestId]?.filter(msg => msg.sender === role) || [];
}

  

  createNewRequest(username: string) {
    const newId = 'REQ-' + Math.floor(Math.random() * 10000);
    const newReq = { id: newId, details: 'New chat request', owner: username };
    this.requests.unshift(newReq);
    this.chatData[newId] = [
      { sender: 'Bot', text: 'Hello! This is a new request chat.' }
    ];
    return newReq;
  }
}
