// Dummy users
export const USERS = [
  { username: 'guest1', role: 'guest' },
  { username: 'guest2', role: 'guest' },
  { username: 'staff', role: 'staff' },
  { username: 'admin', role: 'admin' }
];

// Dummy requests
export const REQUESTS = [
  { id: 'REQ-001', owner: 'guest1', messages: [
      { sender: 'Guest', text: 'Hello, I need help.' },
      { sender: 'Bot', text: 'Hi! How can I assist you?' }
    ] },
  { id: 'REQ-002', owner: 'guest2', messages: [
      { sender: 'Guest', text: 'Issue with login.' },
      { sender: 'Bot', text: 'Please provide your username.' }
    ] },
  { id: 'REQ-003', owner: 'guest1', messages: [
      { sender: 'Guest', text: 'Question about request 3.' },
      { sender: 'Bot', text: 'Sure, what is it?' }
    ] },
  { id: 'REQ-004', owner: 'guest2', messages: [
      { sender: 'Guest', text: 'Need help with billing.' },
      { sender: 'Bot', text: 'I can help you with that.' }
    ] },
  { id: 'REQ-005', owner: 'guest1', messages: [
      { sender: 'Guest', text: 'Another issue.' },
      { sender: 'Bot', text: 'Got it, let me check.' }
    ] },
];
