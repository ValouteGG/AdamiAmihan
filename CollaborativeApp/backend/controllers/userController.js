const supabase = require('../config/supabase');

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

module.exports = {
  getUserStats
};
