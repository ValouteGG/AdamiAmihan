require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const authController = require('./controllers/authController');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5175', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5175'],
    methods: ['GET', 'POST']
  }
});
const port = process.env.PORT || 4005;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [frontendUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5175'];
  const origin = req.headers.origin;
  
  // Set the origin if it's in the allowed list, otherwise set a default
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // For development, allow all origins
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({status: 'ok', now: Date.now()});
});

// Test Supabase connection
app.get('/api/test-supabase', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    const { data, error } = await supabase.auth.getSession();
    res.json({ 
      status: 'supabase_connection_ok', 
      connection_test: 'successful',
      data,
      error 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'supabase_connection_failed', 
      error: error.message 
    });
  }
});

// Auth routes
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/google/url', authController.googleAuthUrl);

// WebRTC Signaling Server
const activeCalls = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
    
    // Notify others that user is online
    socket.broadcast.emit('user-online', { userId });
  });

  // Voice/Video call offer
  socket.on('call-offer', (data) => {
    const { targetUserId, offer, callType, callerId } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    console.log(`Call offer from ${callerId} to ${targetUserId}`);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-offer', {
        callerId,
        callerSocketId: socket.id,
        offer,
        callType
      });
    } else {
      socket.emit('call-error', { message: 'User is not available' });
    }
  });

  // Call answer
  socket.on('call-answer', (data) => {
    const { callerId, answer } = data;
    console.log(`Call answer from ${socket.id} to ${callerId}`);
    
    io.to(callerId).emit('call-answer', {
      answer,
      answererId: socket.id
    });
  });

  // ICE candidates
  socket.on('ice-candidate', (data) => {
    const { targetUserId, candidate } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', {
        candidate,
        senderId: socket.id
      });
    }
  });

  // End call
  socket.on('end-call', (data) => {
    const { targetUserId } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    console.log(`Call ended between ${socket.id} and ${targetUserId}`);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended');
    }
  });

  // Reject call
  socket.on('reject-call', (data) => {
    const { callerId } = data;
    console.log(`Call rejected by ${socket.id}`);
    
    io.to(callerId).emit('call-rejected');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove user mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        socket.broadcast.emit('user-offline', { userId });
        break;
      }
    }
    
    // End any active calls for this user
    for (const [callId, participants] of activeCalls.entries()) {
      if (participants.includes(socket.id)) {
        const otherParticipant = participants.find(id => id !== socket.id);
        if (otherParticipant) {
          io.to(otherParticipant).emit('call-ended');
        }
        activeCalls.delete(callId);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
