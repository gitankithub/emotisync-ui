// import { Injectable } from '@angular/core';
// import { Request } from '../models/request.model';
// import { Thread } from '../models/thread.model';
// import { Message } from '../models/message.model';
// import { User } from '../models/user.model';

// @Injectable({ providedIn: 'root' })
// export class ApiService {
//   private users: User[] = [
//     { userId: 'guest1', name: 'Guest One', role: 'guest' },
//     { userId: 'guest2', name: 'Guest Two', role: 'guest' },
//     { userId: 'staff1', name: 'Staff One', role: 'staff' },
//     { userId: 'admin1', name: 'Admin One', role: 'admin' },
//   ];

//   private requests: Request[] = [
//     {
//       requestId: 'REQ001',
//       guestId: 'guest1',
//       roomNumber: '101',
//       requestType: 'Housekeeping',
//       status: 'open',
//       createdAt: '2025-11-07T10:00:00Z',
//       updatedAt: '2025-11-07T10:05:00Z',
//       guestThreadId: 'T_GUEST_001',
//       staffThreadId: 'T_STAFF_001',
//       adminThreadId: 'T_ADMIN_001'
//     },
//     {
//       requestId: 'REQ002',
//       guestId: 'guest2',
//       roomNumber: '205',
//       requestType: 'Room Service',
//       status: 'assigned',
//       createdAt: '2025-11-07T11:00:00Z',
//       updatedAt: '2025-11-07T11:10:00Z',
//       guestThreadId: 'T_GUEST_002',
//       staffThreadId: 'T_STAFF_002',
//       adminThreadId: 'T_ADMIN_002'
//     }
//   ];

//   private threads: Thread[] = [
//     { threadId: 'T_GUEST_001', requestId: 'REQ001', participants: ['guest1', 'bot'], type: 'guest' },
//     { threadId: 'T_STAFF_001', requestId: 'REQ001', participants: ['staff1', 'bot'], type: 'staff' },
//     { threadId: 'T_ADMIN_001', requestId: 'REQ001', participants: ['admin1', 'staff1', 'guest1', 'bot'], type: 'admin' },

//     { threadId: 'T_GUEST_002', requestId: 'REQ002', participants: ['guest2', 'bot'], type: 'guest' },
//     { threadId: 'T_STAFF_002', requestId: 'REQ002', participants: ['staff1', 'bot'], type: 'staff' },
//     { threadId: 'T_ADMIN_002', requestId: 'REQ002', participants: ['admin1', 'staff1', 'guest2', 'bot'], type: 'admin' },
//   ];

//   private messages: Message[] = [
//     { messageId: 'M1', threadId: 'T_GUEST_001', senderId: 'guest1', text: 'Can I get towels?', time: '2025-11-07T10:01:00Z', messageType: 'user' },
//     { messageId: 'M2', threadId: 'T_GUEST_001', senderId: 'bot', text: 'Sure, notifying staff.', time: '2025-11-07T10:02:00Z', messageType: 'bot' },

//     { messageId: 'M3', threadId: 'T_STAFF_001', senderId: 'bot', text: 'Room 101 needs towels.', time: '2025-11-07T10:03:00Z', messageType: 'bot' },
//     { messageId: 'M4', threadId: 'T_STAFF_001', senderId: 'staff1', text: 'On my way.', time: '2025-11-07T10:04:00Z', messageType: 'user' },
//   ];

//   // === API Simulation Methods === //

//   getRequests(userId: string): Promise<Request[]> {
//     const user = this.users.find(u => u.userId === userId);
//     if (!user) return Promise.resolve([]);

//     if (user.role === 'guest') {
//       return Promise.resolve(this.requests.filter(r => r.guestId === userId));
//     }
//     if (user.role === 'staff') {
//       return Promise.resolve(this.requests.filter(r => r.status === 'assigned' || r.status === 'in_progress'));
//     }
//     return Promise.resolve(this.requests); // admin sees all
//   }

//   getMessages(threadId: string): Promise<Message[]> {
//     return Promise.resolve(this.messages.filter(m => m.threadId === threadId));
//   }

//   postMessage(message: Omit<Message, 'messageId' | 'time'>): Promise<Message> {
//     const newMessage: Message = {
//       ...message,
//       messageId: `M${this.messages.length + 1}`,
//       time: new Date().toISOString(),
//     };
//     this.messages.push(newMessage);
//     return Promise.resolve(newMessage);
//   }

//   createRequest(guestId: string, roomNumber: string, requestType: string, initialMessage: string): Promise<Request> {
//     const newRequestId = `REQ00${this.requests.length + 1}`;
//     const newReq: Request = {
//       requestId: newRequestId,
//       guestId,
//       roomNumber,
//       requestType,
//       status: 'open',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       guestThreadId: `T_GUEST_${newRequestId}`,
//       staffThreadId: `T_STAFF_${newRequestId}`,
//       adminThreadId: `T_ADMIN_${newRequestId}`,
//     };
//     this.requests.push(newReq);
//     this.messages.push({
//       messageId: `M${this.messages.length + 1}`,
//       threadId: newReq.guestThreadId,
//       senderId: guestId,
//       text: initialMessage,
//       time: new Date().toISOString(),
//       messageType: 'user',
//     });
//     return Promise.resolve(newReq);
//   }
// }

import { Injectable } from '@angular/core';
import { Request } from '../models/request.model';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { Thread } from '../models/thread.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private users: User[] = [
    { userId: 'guest1', name: 'Guest One', role: 'guest' },
    { userId: 'guest2', name: 'Guest Two', role: 'guest' },
    { userId: 'staff1', name: 'Staff John', role: 'staff' },
    { userId: 'admin1', name: 'Admin', role: 'admin' }
  ];

  private requests: Request[] = [
    {
      requestId: 'REQ001',
      guestId: 'guest1',
      roomNumber: '101',
      requestType: 'Room Service',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      guestThreadId: 'T_GUEST_REQ001',
      staffThreadId: 'T_STAFF_REQ001',
      adminThreadId: 'T_ADMIN_REQ001'
    },
    {
      requestId: 'REQ002',
      guestId: 'guest2',
      roomNumber: '205',
      requestType: 'Cleaning',
      status: 'assigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      guestThreadId: 'T_GUEST_REQ002',
      staffThreadId: 'T_STAFF_REQ002',
      adminThreadId: 'T_ADMIN_REQ002'
    }
  ];

  private messages: Message[] = [
    {
      messageId: 'M1',
      threadId: 'T_GUEST_REQ001',
      senderId: 'bot',
      text: 'Hello Guest One 👋, how can I help you today?',
      time: new Date().toISOString(),
      messageType: 'bot'
    },
    {
      messageId: 'M2',
      threadId: 'T_GUEST_REQ001',
      senderId: 'guest1',
      text: 'I need dinner to my room please.',
      time: new Date().toISOString(),
      messageType: 'user'
    },
    {
      messageId: 'M3',
      threadId: 'T_GUEST_REQ001',
      senderId: 'bot',
      text: 'Sure, connecting you to Staff John 🍽️',
      time: new Date().toISOString(),
      messageType: 'bot'
    }
  ];

  async getRequests(userId: string): Promise<Request[]> {
    const user = this.users.find(u => u.userId === userId);
    if (!user) return [];
    if (user.role === 'guest')
      return this.requests.filter(r => r.guestId === userId);
    if (user.role === 'staff')
      return this.requests.filter(r => r.status === 'assigned' || r.status === 'open');
    return this.requests;
  }

  async getMessages(threadId: string): Promise<Message[]> {
    return this.messages.filter(m => m.threadId === threadId);
  }

  async postMessage(message: Omit<Message, 'messageId' | 'time'>): Promise<Message> {
    const msg: Message = {
      ...message,
      messageId: `M${this.messages.length + 1}`,
      time: new Date().toISOString()
    };
    this.messages.push(msg);

    // Simulate bot reply
    if (message.senderId.startsWith('guest')) {
      const botReply: Message = {
        messageId: `M${this.messages.length + 1}`,
        threadId: message.threadId,
        senderId: 'bot',
        text: `Thanks! Our staff will assist shortly.`,
        time: new Date().toISOString(),
        messageType: 'bot'
      };
      this.messages.push(botReply);
    }
    return msg;
  }

  async createRequest(guestId: string, roomNumber: string, requestType: string): Promise<Request> {
    const id = `REQ00${this.requests.length + 1}`;
    const req: Request = {
      requestId: id,
      guestId,
      roomNumber,
      requestType,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      guestThreadId: `T_GUEST_${id}`,
      staffThreadId: `T_STAFF_${id}`,
      adminThreadId: `T_ADMIN_${id}`
    };
    this.requests.push(req);

    // Add greeting from bot
    this.messages.push({
      messageId: `M${this.messages.length + 1}`,
      threadId: req.guestThreadId,
      senderId: 'bot',
      text: `Hello! I'm your assistant bot 🤖. How can I help you with your ${requestType}?`,
      time: new Date().toISOString(),
      messageType: 'bot'
    });

    return req;
  }
}
