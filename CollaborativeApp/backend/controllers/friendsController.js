const supabase = require('../config/supabase');

/**
 * Add a friend
 */
const addFriend = async (req, res) => {
  try {
    const { email, userId } = req.body;
    const supabase = require('../config/supabase');
    
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
        name: (targetProfile.first_name || targetProfile.last_name) ? `${targetProfile.first_name || ''} ${targetProfile.last_name || ''}`.trim() : targetProfile.email?.split('@')[0] || 'Unknown',
        email: targetProfile.email,
        avatar: targetProfile.avatar_url && targetProfile.avatar_url.startsWith('http') ? targetProfile.avatar_url : (targetProfile.first_name?.[0] || targetProfile.email?.[0] || '?'),
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
};

/**
 * Get all friends for the current user
 */
const getFriends = async (req, res) => {
  try {
    const supabase = require('../config/supabase');
    
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
        name: (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email?.split('@')[0] || 'Unknown',
        avatar: profile?.avatar_url && profile.avatar_url.startsWith('http') ? profile.avatar_url : (profile?.first_name?.[0] || profile?.email?.[0] || '?'),
        online: profile?.is_online || false,
        status: f.status
      };
    }) || [];

    res.json({ friends: formattedFriends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

/**
 * Get pending friend requests
 */
const getFriendRequests = async (req, res) => {
  try {
    const supabase = require('../config/supabase');
    
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
      const name = (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email?.split('@')[0] || 'Unknown';
      return {
        id: r.id,
        fromUserId: r.user_id,
        name: name,
        email: profile?.email || '',
        avatar: profile?.avatar_url && profile.avatar_url.startsWith('http') ? profile.avatar_url : (profile?.first_name?.[0] || profile?.email?.[0] || '?'),
        message: 'Would like to be your friend',
        createdAt: r.created_at
      };
    }) || [];

    res.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
};

/**
 * Accept a friend request
 */
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const supabase = require('../config/supabase');
    
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
};

/**
 * Decline a friend request
 */
const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const supabase = require('../config/supabase');
    
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
};

/**
 * Remove a friend
 */
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const supabase = require('../config/supabase');
    
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
};

/**
 * Search users by email or name
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.body;
    const supabase = require('../config/supabase');
    
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
};

module.exports = {
  addFriend,
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  searchUsers
};