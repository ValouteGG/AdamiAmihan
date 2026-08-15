import { io } from 'socket.io-client';

class ChatSocketClient {
  constructor() {
    this.socket = null;
    this.currentUserId = null;
    this.currentConversationId = null;
    
    // Callbacks
    this.onMessageReceived = null;
    this.onUserTyping = null;
    this.onUserStoppedTyping = null;
    this.onUserOnline = null;
    this.onUserOffline = null;
  }

  initialize(userId) {
    this.currentUserId = userId;
    
    // Connect to chat server
    this.socket = io('http://localhost:4002', {
      transports: ['websocket', 'polling']
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Receive message
    this.socket.on('receive-message', (data) => {
      console.log('Message received:', data);
      if (this.onMessageReceived) {
        this.onMessageReceived(data);
      }
    });

    // User typing indicator
    this.socket.on('user-typing', (data) => {
      console.log('User typing:', data);
      if (this.onUserTyping) {
        this.onUserTyping(data);
      }
    });

    // User stopped typing indicator
    this.socket.on('user-stopped-typing', (data) => {
      console.log('User stopped typing:', data);
      if (this.onUserStoppedTyping) {
        this.onUserStoppedTyping(data);
      }
    });

    // User online
    this.socket.on('user-online', (data) => {
      console.log('User online:', data);
      if (this.onUserOnline) {
        this.onUserOnline(data);
      }
    });

    // User offline
    this.socket.on('user-offline', (data) => {
      console.log('User offline:', data);
      if (this.onUserOffline) {
        this.onUserOffline(data);
      }
    });
  }

  joinConversation(conversationId) {
    if (this.currentConversationId) {
      this.leaveConversation(this.currentConversationId);
    }
    
    this.currentConversationId = conversationId;
    this.socket.emit('join-conversation', {
      conversationId,
      userId: this.currentUserId
    });
    console.log(`Joined conversation ${conversationId}`);
  }

  leaveConversation(conversationId) {
    this.socket.emit('leave-conversation', {
      conversationId,
      userId: this.currentUserId
    });
    console.log(`Left conversation ${conversationId}`);
    
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  sendMessage(conversationId, message, senderName) {
    this.socket.emit('send-message', {
      conversationId,
      message,
      senderId: this.currentUserId,
      senderName
    });
    console.log(`Message sent to conversation ${conversationId}`);
  }

  startTyping(conversationId, userName) {
    this.socket.emit('typing-start', {
      conversationId,
      userId: this.currentUserId,
      userName
    });
  }

  stopTyping(conversationId) {
    this.socket.emit('typing-stop', {
      conversationId,
      userId: this.currentUserId
    });
  }

  disconnect() {
    if (this.currentConversationId) {
      this.leaveConversation(this.currentConversationId);
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.currentUserId = null;
    this.currentConversationId = null;
  }
}

// Export singleton instance
const chatSocketClient = new ChatSocketClient();
export default chatSocketClient;