const supabase = require('../config/supabase');

/**
 * Get all conversations for the current user
 */
const getConversations = async (req, res) => {
  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Get user using the token (unauthenticated client is fine just for verification)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Use a client that carries the user's own token, so RLS policies
    // checking auth.uid() actually see who's making the request.
    const db = supabase.getAuthenticatedClient(token);

    // Get user's conversations with participants info
    const { data: conversations, error } = await db
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

    const conversationIds = conversations.map(c => c.conversation_id);

    // Get last message for each conversation
    const { data: lastMessages } = await db
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

    // --- FIX ---
    // Previously this used an embedded relationship join
    // (user_profiles!inner(...)) directly in the select. That kind of
    // embedded join can silently fail (return null, no thrown error) if
    // PostgREST can't unambiguously resolve the relationship. Since the
    // old code never checked this query's `error`, that failure was
    // invisible and every name fell back to 'Unknown'.
    //
    // Fix: do it in two plain steps instead, same pattern getMessages()
    // already uses successfully — get participant rows first, then a
    // separate, ordinary select on user_profiles by id.

    const { data: participantRows, error: participantsError } = await db
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', conversationIds)
      .neq('user_id', user.id);

    if (participantsError) {
      console.error('Error fetching conversation participants:', participantsError);
    }

    const otherUserIds = [...new Set((participantRows || []).map(p => p.user_id))];

    const { data: profiles, error: profilesError } = await db
      .from('user_profiles')
      .select('id, first_name, last_name, avatar_url, is_online, email')
      .in('id', otherUserIds.length > 0 ? otherUserIds : ['00000000-0000-0000-0000-000000000000']);

    if (profilesError) {
      console.error('Error fetching participant profiles:', profilesError);
    }

    const profileById = new Map((profiles || []).map(p => [p.id, p]));

    // Map conversation_id -> that conversation's other participant's profile
    const participantMap = new Map();
    (participantRows || []).forEach(p => {
      if (!participantMap.has(p.conversation_id)) {
        const profile = profileById.get(p.user_id);
        if (profile) {
          participantMap.set(p.conversation_id, profile);
        }
      }
    });
    // --- END FIX ---

    // Format conversations
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      const lastMsg = lastMessageMap.get(conv.conversation_id);
      const participant = participantMap.get(conv.conversation_id);
      const isGroup = conv.conversations.is_group;

      // Get unread count
      const { count } = await db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.conversation_id)
        .neq('sender_id', user.id)
        .gt('created_at', conv.joined_at || '1970-01-01');

      return {
        id: conv.conversation_id,
        participantId: participant?.id || null,
        name: isGroup ? conv.conversations.name : ((participant?.first_name || participant?.last_name) ? `${participant.first_name || ''} ${participant.last_name || ''}`.trim() : participant?.email?.split('@')[0] || 'Unknown'),
        avatar: isGroup ? '👥' : (participant?.avatar_url && participant.avatar_url.startsWith('http') ? participant.avatar_url : (participant?.first_name?.[0] || participant?.email?.[0] || '?')),
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
};

/**
 * Get messages for a specific conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

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

    const db = supabase.getAuthenticatedClient(token);

    // Verify user is in conversation
    const { data: participant } = await db
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    // Get messages
    const { data: messages, error } = await db
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get sender profiles
    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const { data: profiles } = await db
      .from('user_profiles')
      .select('id, first_name, last_name, avatar_url, email')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Format messages
    const formattedMessages = messages.map(msg => {
      const profile = profileMap.get(msg.sender_id);
      const senderName = (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email?.split('@')[0] || 'Unknown';
      return {
        id: msg.id,
        sender: senderName,
        senderId: msg.sender_id,
        text: msg.content,
        time: formatTime(msg.created_at),
        isMine: msg.sender_id === user.id
      };
    });

    // Mark messages as read
    await db
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Send a message to a conversation
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

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

    const db = supabase.getAuthenticatedClient(token);

    // Insert message
    const { data: message, error } = await db
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
    await db
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Get user profile for response
    const { data: profile } = await db
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    const senderName = (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email?.split('@')[0] || 'You';

    res.status(201).json({
      message: {
        id: message.id,
        sender: senderName,
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
};

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

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};