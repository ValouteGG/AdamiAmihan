const supabase = require('../config/supabase');
const { supabaseServiceRole } = require('../config/supabase');

/**
 * Get user statistics (rooms, sessions, hours)
 */
const getUserStats = async (req, res) => {
  try {
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

    // Get rooms count - count rooms where user is a participant
    const { count: roomsCount, error: roomsError } = await db
      .from('conversation_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (roomsError) {
      console.error('Error fetching rooms count:', roomsError);
    }

    // Get sessions count - count total messages sent by user (as a proxy for sessions)
    const { count: sessionsCount, error: sessionsError } = await db
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', user.id);

    if (sessionsError) {
      console.error('Error fetching sessions count:', sessionsError);
    }

    // Calculate hours - estimate based on user's account creation date
    // This is a rough estimate: (days since account creation * 2 hours average)
    let hoursCount = 0;
    try {
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user?.created_at) {
        const createdAt = new Date(userData.user.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        // Estimate: average 2 hours of study per day since account creation
        hoursCount = Math.max(daysSinceCreation * 2, 0);
      }
    } catch (error) {
      console.error('Error calculating hours:', error);
    }

    res.json({
      stats: {
        rooms: roomsCount || 0,
        sessions: sessionsCount || 0,
        hours: hoursCount
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

/**
 * Search users by email or name
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    // Use service role client to bypass RLS for user search
    const client = supabaseServiceRole || supabase;
    
    // Search in user_profiles by email or name
    const { data: profiles, error } = await client
      .from('user_profiles')
      .select('*')
      .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    // Format users
    const users = profiles?.map(profile => ({
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatar: profile.avatar_url
    })) || [];

    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

/**
 * Invite user to room
 */
const inviteUserToRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    
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

    // Use service role client to bypass RLS for participant checks
    const client = supabaseServiceRole || db;
    
    // Check if the inviter is the room owner
    const { data: participant } = await client
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!participant || participant.role !== 'owner') {
      return res.status(403).json({ error: 'Only room owners can invite users' });
    }

    // Check if user is already a participant
    const { data: existingParticipant } = await client
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    if (existingParticipant) {
      return res.status(400).json({ error: 'User is already a member of this room' });
    }
    
    // Add user as participant
    const { error } = await client
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: userId,
        role: 'member'
      });

    if (error) throw error;

    // Get user details for response
    const { data: userProfile } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    res.json({ 
      message: 'User invited successfully',
      user: userProfile
    });
  } catch (error) {
    console.error('Error inviting user to room:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
};

module.exports = {
  getUserStats,
  searchUsers,
  inviteUserToRoom
};
