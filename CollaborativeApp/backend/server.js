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

// Messages routes
app.get('/api/messages/conversations', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Get user's conversations with participants info
    const { data: conversations, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(
          id,
          name,
          is_group,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    // Get last message for each conversation
    const conversationIds = conversations.map(c => c.conversation_id);
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    // Group last messages by conversation
    const lastMessageMap = new Map();
    lastMessages?.forEach(msg => {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, msg);
      }
    });

    // Get participant info for non-group conversations
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id, user_profiles!inner(first_name, last_name, avatar_url, is_online)')
      .in('conversation_id', conversationIds)
      .neq('user_id', user.id);

    const participantMap = new Map();
    participants?.forEach(p => {
      if (!participantMap.has(p.conversation_id)) {
        participantMap.set(p.conversation_id, p.user_profiles);
      }
    });

    // Format conversations
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      const lastMsg = lastMessageMap.get(conv.conversation_id);
      const participant = participantMap.get(conv.conversation_id);
      const isGroup = conv.conversations.is_group;
      
      // Get unread count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.conversation_id)
        .neq('sender_id', user.id)
        .gt('created_at', conv.joined_at || '1970-01-01');

      return {
        id: conv.conversation_id,
        name: isGroup ? conv.conversations.name : participant?.first_name + ' ' + participant?.last_name,
        avatar: isGroup ? '👥' : (participant?.avatar_url || participant?.first_name?.[0] || '?'),
        lastMessage: lastMsg?.content || 'No messages yet',
        time: lastMsg ? formatTime(lastMsg.created_at) : 'Just now',
        unread: count || 0,
        online: participant?.is_online || false,
        isGroup: isGroup,
        updatedAt: conv.conversations.updated_at
      };
    }));

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Verify user is in conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get sender profiles
    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, avatar_url')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Format messages
    const formattedMessages = messages.map(msg => {
      const profile = profileMap.get(msg.sender_id);
      return {
        id: msg.id,
        sender: profile?.first_name || 'Unknown',
        senderId: msg.sender_id,
        text: msg.content,
        time: formatTime(msg.created_at),
        isMine: msg.sender_id === user.id
      };
    });

    // Mark messages as read
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: text,
        message_type: 'text'
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Get user profile for response
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    res.status(201).json({ 
      message: {
        id: message.id,
        sender: profile?.first_name || 'You',
        senderId: user.id,
        text: message.content,
        time: formatTime(message.created_at),
        isMine: true
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Helper function to format time
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Friends routes
app.post('/api/friends/add', async (req, res) => {
  try {
    const { email, userId } = req.body;
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('Add friend request:', { email, userId, currentUserId: user?.id, userError });
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    let targetProfile;

    // Handle both email and userId formats
    if (userId) {
      // Get user by ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, avatar_url, is_online')
        .eq('id', userId)
        .single();

      console.log('Get user by ID result:', { profile, error: profileError });

      if (profileError || !profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      targetProfile = profile;
    } else if (email) {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Find user by email in user_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, avatar_url, is_online')
        .eq('email', email)
        .single();

      console.log('Get user by email result:', { profile, error: profileError });

      if (profileError || !profile) {
        return res.status(404).json({ error: 'User not found with this email' });
      }

      targetProfile = profile;
    } else {
      return res.status(400).json({ error: 'Email or userId is required' });
    }

    if (targetProfile.id === user.id) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    // Check if already friends or request pending
    const { data: existingFriend } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${targetProfile.id}),and(user_id.eq.${targetProfile.id},friend_id.eq.${user.id})`)
      .single();

    console.log('Existing friend check:', { existingFriend });

    if (existingFriend) {
      if (existingFriend.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      } else if (existingFriend.status === 'pending') {
        return res.status(400).json({ error: 'Friend request already pending' });
      }
    }

    // Create friend request
    const { data: friend, error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: targetProfile.id,
        status: 'pending'
      })
      .select()
      .single();

    console.log('Friend request created:', { friend, error });

    if (error) throw error;

    // Get or create direct conversation
    let conversationId;
    
    // Try to find existing conversation between these two users
    const { data: existingParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (existingParticipants && existingParticipants.length > 0) {
      const conversationIds = existingParticipants.map(p => p.conversation_id);
      
      // Check if any of these conversations also have the target user
      const { data: sharedConversation } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', targetProfile.id)
        .in('conversation_id', conversationIds)
        .limit(1);

      if (sharedConversation && sharedConversation.length > 0) {
        conversationId = sharedConversation[0].conversation_id;
      }
    }

    // If no existing conversation, create new one
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: false,
          created_by: user.id
        })
        .select()
        .single();

      if (convError || !newConv) {
        console.error('Error creating conversation:', convError);
        return res.status(500).json({ error: 'Failed to create conversation' });
      }

      conversationId = newConv.id;
    }

    // Add both users to conversation if not already
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .upsert([
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: targetProfile.id }
      ], { onConflict: 'conversation_id,user_id' });

    if (participantError) {
      console.error('Error adding participants:', participantError);
      return res.status(500).json({ error: 'Failed to add participants to conversation' });
    }

    res.status(201).json({ 
      message: 'Friend request sent successfully',
      friend: {
        id: targetProfile.id,
        name: targetProfile.first_name + ' ' + targetProfile.last_name,
        email: targetProfile.email,
        avatar: targetProfile.avatar_url || targetProfile.first_name[0],
        lastMessage: 'Friend request sent',
        time: 'Just now',
        unread: 0,
        online: targetProfile.is_online || false,
        isGroup: false
      }
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

app.get('/api/friends', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Get accepted friends
    const { data: friends, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) throw error;

    // Get user profiles for friends
    const friendIds = friends?.map(f => f.user_id === user.id ? f.friend_id : f.user_id) || [];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, avatar_url, is_online, email')
      .in('id', friendIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const formattedFriends = friends?.map(f => {
      const profileId = f.user_id === user.id ? f.friend_id : f.user_id;
      const profile = profileMap.get(profileId);
      return {
        id: profileId,
        name: (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email || 'Unknown',
        avatar: profile?.avatar_url || (profile?.first_name?.[0] || profile?.email?.[0] || '?'),
        online: profile?.is_online || false,
        status: f.status
      };
    }) || [];

    res.json({ friends: formattedFriends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Get pending friend requests
app.get('/api/friends/requests', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Get pending friend requests (where current user is the friend_id)
    const { data: requests, error } = await supabase
      .from('friends')
      .select('*')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (error) throw error;

    // Get user profiles for request senders
    const senderIds = requests?.map(r => r.user_id) || [];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, avatar_url, email')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const formattedRequests = requests?.map(r => {
      const profile = profileMap.get(r.user_id);
      return {
        id: r.id,
        fromUserId: r.user_id,
        name: profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.email || 'Unknown',
        email: profile?.email || '',
        avatar: profile?.avatar_url || profile?.first_name?.[0] || '?',
        message: 'Would like to be your friend',
        createdAt: r.created_at
      };
    }) || [];

    res.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Accept friend request
app.post('/api/friends/requests/:requestId/accept', async (req, res) => {
  try {
    const { requestId } = req.params;
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Update friend request status to accepted
    const { data: friend, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .eq('friend_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Friend request accepted', friend });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Decline friend request
app.post('/api/friends/requests/:requestId/decline', async (req, res) => {
  try {
    const { requestId } = req.params;
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Delete the friend request
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId)
      .eq('friend_id', user.id);

    if (error) throw error;

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ error: 'Failed to decline friend request' });
  }
});

// Remove friend
app.delete('/api/friends/:friendId', async (req, res) => {
  try {
    const { friendId } = req.params;
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Delete the friend relationship
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    if (error) throw error;

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Search users endpoint
app.post('/api/users/search', async (req, res) => {
  try {
    const { query } = req.body;
    const supabase = require('./config/supabase');
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('Search request:', { query, currentUserId: user?.id, userError });
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Search users by email or name
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, avatar_url, is_online')
      .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .neq('id', user.id)
      .limit(10);

    console.log('Search results:', { count: users?.length, users, error });

    if (error) throw error;

    res.json({ users: users || [] });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

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
