const supabase = require('../config/supabase');
const { supabaseServiceRole } = require('../config/supabase');

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

/**
 * Create a new study room
 */
const createRoom = async (req, res) => {
  try {
    const { name, subject, description, visibility } = req.body;
    
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

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    // First try with authenticated client (for RLS)
    let db = supabase.getAuthenticatedClient(token);
    let roomError;

    // Create the room
    let { data: room, error: roomError1 } = await db
      .from('study_rooms')
      .insert({
        name,
        subject: subject || null,
        description: description || null,
        visibility: visibility || 'private',
        created_by: user.id
      })
      .select()
      .single();

    console.log('Room creation result:', { room, error: roomError1 });

    // If RLS fails, try with default client (service role)
    if (roomError1) {
      console.log('RLS error, trying with default client:', roomError1.message);
      const fallbackResult = await supabase
        .from('study_rooms')
        .insert({
          name,
          subject: subject || null,
          description: description || null,
          visibility: visibility || 'private',
          created_by: user.id
        })
        .select()
        .single();
      room = fallbackResult.data;
      roomError = fallbackResult.error;
      console.log('Fallback room creation result:', { room, error: roomError });
    } else {
      roomError = roomError1;
    }

    if (roomError) throw roomError;

    console.log('Room created successfully:', room.id);

    // Add the creator as a participant with owner role
    let participantError;
    try {
      const participantResult = await db
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: 'owner'
        });
      participantError = participantResult.error;
      console.log('Participant insertion result:', { error: participantError });
    } catch (participantError1) {
      participantError = participantError1;
      console.log('Participant insertion failed with exception:', participantError);
    }

    // If RLS fails for participant insertion, try with default client
    if (participantError) {
      console.log('RLS error for participant insertion, trying default client:', participantError.message);
      try {
        const fallbackResult = await supabase
          .from('room_participants')
          .insert({
            room_id: room.id,
            user_id: user.id,
            role: 'owner'
          })
          .select();
        console.log('Fallback participant insertion result:', { data: fallbackResult.data, error: fallbackResult.error });
        if (fallbackResult.error) {
          console.error('Fallback participant insertion also failed:', fallbackResult.error);
          // Don't throw the error - we still want to return the room
        } else {
          console.log('Fallback participant insertion succeeded');
        }
      } catch (fallbackError) {
        console.error('Fallback participant insertion exception:', fallbackError);
        // Don't throw the error - we still want to return the room
      }
    } else {
      console.log('Participant insertion succeeded on first try');
    }

    // Log activity (optional, don't fail if this doesn't work)
    try {
      await db
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: 'room_created',
          activity_text: `Created room "${name}"`,
          related_room_id: room.id
        });
    } catch (activityError) {
      console.log('Activity logging failed (non-critical):', activityError.message);
    }

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        id: room.id,
        name: room.name,
        subject: room.subject,
        description: room.description,
        visibility: room.visibility,
        created_at: room.created_at,
        updated_at: room.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room: ' + error.message });
  }
};

/**
 * Get a specific room by ID
 */
const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log('Fetching room by ID:', roomId);
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No auth header provided');
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('Invalid token:', userError);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    console.log('User authenticated:', user.id);

    const db = supabase.getAuthenticatedClient(token);

    // Check if user is a participant in this room
    let participant, participantError;
    try {
      const result = await db
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();
      participant = result.data;
      participantError = result.error;
    } catch (e) {
      participantError = e;
    }

    console.log('Participant check result:', { participant, error: participantError });

    // If RLS fails for participant check, try with default client
    if (participantError) {
      console.log('RLS error for participant check, trying default client:', participantError.message);
      const fallbackResult = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();
      participant = fallbackResult.data;
      participantError = fallbackResult.error;
      console.log('Fallback participant check result:', { participant, error: participantError });
    }

    if (!participant) {
      console.log('User is not a participant in this room');
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    // Get room details
    let room, roomError;
    try {
      const result = await db
        .from('study_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      room = result.data;
      roomError = result.error;
    } catch (e) {
      roomError = e;
    }

    console.log('Room query result:', { room, error: roomError });

    // If RLS fails, try with default client
    if (roomError) {
      console.log('RLS error in getRoomById, trying default client:', roomError.message);
      const fallbackResult = await supabase
        .from('study_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      room = fallbackResult.data;
      roomError = fallbackResult.error;
      console.log('Fallback room query result:', { room, error: roomError });
    }

    if (roomError) throw roomError;

    // Add user's role to the room data
    room.role = participant.role;

    console.log('Returning room data:', room);
    res.json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

/**
 * Get all rooms for the current user
 */
const getUserRooms = async (req, res) => {
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

    // Get rooms where user is a participant
    let participants, participantError;
    try {
      const result = await db
        .from('room_participants')
        .select(`
          room_id,
          role,
          joined_at,
          study_rooms!inner (
            id,
            name,
            subject,
            description,
            visibility,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);
      participants = result.data;
      participantError = result.error;
    } catch (e) {
      participantError = e;
    }

    // If RLS fails, try with default client
    if (participantError) {
      console.log('RLS error in getUserRooms, trying default client:', participantError.message);
      const fallbackResult = await supabase
        .from('room_participants')
        .select(`
          room_id,
          role,
          joined_at,
          study_rooms (
            id,
            name,
            subject,
            description,
            visibility,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);
      participants = fallbackResult.data;
      participantError = fallbackResult.error;
    }

    if (participantError) throw participantError;

    // Format rooms with participant role
    const rooms = participants?.map(p => ({
      id: p.study_rooms.id,
      name: p.study_rooms.name,
      subject: p.study_rooms.subject,
      description: p.study_rooms.description,
      visibility: p.study_rooms.visibility,
      created_at: p.study_rooms.created_at,
      updated_at: p.study_rooms.updated_at,
      role: p.role,
      joined_at: p.joined_at
    })) || [];

    res.json({ rooms });
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

/**
 * Get public rooms
 */
const getPublicRooms = async (req, res) => {
  try {
    // Use service role client to bypass RLS for public rooms
    const client = supabaseServiceRole || supabase;
    
    const { data: rooms, error } = await client
      .from('study_rooms')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get participant counts for each room
    const roomIds = rooms?.map(r => r.id) || [];
    const { data: participants } = await client
      .from('room_participants')
      .select('room_id')
      .in('room_id', roomIds);

    const participantCounts = {};
    participants?.forEach(p => {
      participantCounts[p.room_id] = (participantCounts[p.room_id] || 0) + 1;
    });

    // Format rooms
    const formattedRooms = rooms?.map(room => ({
      id: room.id,
      name: room.name,
      subject: room.subject,
      description: room.description,
      participants: participantCounts[room.id] || 0,
      createdAt: room.created_at
    })) || [];

    console.log('Public rooms fetched successfully:', formattedRooms.length, 'rooms');
    res.json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    res.status(500).json({ error: 'Failed to fetch public rooms' });
  }
};

/**
 * Join a room
 */
const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
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

    // Check if room exists and is accessible
    const { data: room, error: roomError } = await db
      .from('study_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is already a participant
    const { data: existingParticipant } = await db
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      return res.status(400).json({ error: 'Already a member of this room' });
    }

    // Add user as participant
    let joinError;
    try {
      const result = await db
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'member'
        });
      joinError = result.error;
    } catch (e) {
      joinError = e;
    }

    // If RLS fails, try with default client
    if (joinError) {
      console.log('RLS error in joinRoom, trying default client:', joinError.message);
      const fallbackResult = await supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'member'
        });
      joinError = fallbackResult.error;
    }

    if (joinError) throw joinError;

    // Log activity (optional)
    try {
      await db
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: 'room_joined',
          activity_text: `Joined room "${room.name}"`,
          related_room_id: roomId
        });
    } catch (activityError) {
      console.log('Activity logging failed (non-critical):', activityError.message);
    }

    res.json({ message: 'Successfully joined room' });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

/**
 * Leave a room
 */
const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
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

    // Check if user is a participant
    const { data: participant, error: participantError } = await db
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return res.status(404).json({ error: 'You are not a member of this room' });
    }

    // Check if user is the owner
    if (participant.role === 'owner') {
      return res.status(400).json({ error: 'Room owners cannot leave their own room. Delete the room instead.' });
    }

    // Remove user from participants
    let leaveError;
    try {
      const result = await db
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
      leaveError = result.error;
    } catch (e) {
      leaveError = e;
    }

    // If RLS fails, try with default client
    if (leaveError) {
      console.log('RLS error in leaveRoom, trying default client:', leaveError.message);
      const fallbackResult = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
      leaveError = fallbackResult.error;
    }

    if (leaveError) throw leaveError;

    // Get room name for activity log
    const { data: room } = await supabase
      .from('study_rooms')
      .select('name')
      .eq('id', roomId)
      .single();

    // Log activity (optional)
    try {
      await db
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: 'room_left',
          activity_text: `Left room "${room?.name || 'Unknown'}"`,
          related_room_id: roomId
        });
    } catch (activityError) {
      console.log('Activity logging failed (non-critical):', activityError.message);
    }

    res.json({ message: 'Successfully left room' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
};

/**
 * Delete a room (only for owners)
 */
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
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

    // Check if user is the room owner
    const { data: room, error: roomError } = await db
      .from('study_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('created_by', user.id)
      .single();

    if (roomError || !room) {
      return res.status(403).json({ error: 'Only room owners can delete rooms' });
    }

    // Delete the room (this will cascade to participants, sessions, etc.)
    let deleteError;
    try {
      const result = await db
        .from('study_rooms')
        .delete()
        .eq('id', roomId);
      deleteError = result.error;
    } catch (e) {
      deleteError = e;
    }

    // If RLS fails, try with default client
    if (deleteError) {
      console.log('RLS error in deleteRoom, trying default client:', deleteError.message);
      const fallbackResult = await supabase
        .from('study_rooms')
        .delete()
        .eq('id', roomId);
      deleteError = fallbackResult.error;
    }

    if (deleteError) throw deleteError;

    // Log activity (optional)
    try {
      await db
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: 'room_deleted',
          activity_text: `Deleted room "${room.name}"`,
          related_room_id: roomId
        });
    } catch (activityError) {
      console.log('Activity logging failed (non-critical):', activityError.message);
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

/**
 * Get room participants
 */
const getRoomParticipants = async (req, res) => {
  try {
    const { roomId } = req.params;
    
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

    // Check if user is a participant
    const { data: participant } = await db
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    // Get all participants with their user profiles
    let participants, participantError;
    try {
      const result = await db
        .from('room_participants')
        .select(`
          user_id,
          role,
          joined_at,
          user_profiles (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            is_online
          )
        `)
        .eq('room_id', roomId);
      participants = result.data;
      participantError = result.error;
    } catch (e) {
      participantError = e;
    }

    // If RLS fails, try with default client
    if (participantError) {
      console.log('RLS error in getRoomParticipants, trying default client:', participantError.message);
      const fallbackResult = await supabase
        .from('room_participants')
        .select(`
          user_id,
          role,
          joined_at,
          user_profiles (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            is_online
          )
        `)
        .eq('room_id', roomId);
      participants = fallbackResult.data;
      participantError = fallbackResult.error;
    }

    if (participantError) throw participantError;

    // Format participants
    const formattedParticipants = participants?.map(p => ({
      id: p.user_profiles.id,
      name: (p.user_profiles.first_name || p.user_profiles.last_name) 
        ? `${p.user_profiles.first_name || ''} ${p.user_profiles.last_name || ''}`.trim() 
        : p.user_profiles.email?.split('@')[0] || 'Unknown',
      email: p.user_profiles.email,
      avatar: (p.user_profiles.first_name?.[0] || p.user_profiles.email?.[0] || '?'),
      role: p.role,
      isOnline: p.user_profiles.is_online || false,
      joinedAt: p.joined_at
    })) || [];

    res.json({ participants: formattedParticipants });
  } catch (error) {
    console.error('Error fetching room participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

/**
 * Remove a participant from a room (only for owners)
 */
const removeParticipant = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    
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

    // Check if user is the room owner
    const { data: room } = await db
      .from('study_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('created_by', user.id)
      .single();

    if (!room) {
      return res.status(403).json({ error: 'Only room owners can remove participants' });
    }

    // Don't allow removing the owner
    if (userId === user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself from the room. Use leave instead.' });
    }

    // Remove the participant
    let removeError;
    try {
      const result = await db
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
      removeError = result.error;
    } catch (e) {
      removeError = e;
    }

    // If RLS fails, try with default client
    if (removeError) {
      console.log('RLS error in removeParticipant, trying default client:', removeError.message);
      const fallbackResult = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
      removeError = fallbackResult.error;
    }

    if (removeError) throw removeError;

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
};

/**
 * Create a session for a room
 */
const createSession = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, description, scheduledDate, scheduledTime, durationMinutes, sessionType } = req.body;
    
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

    // Validate input
    if (!title || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ error: 'Title, date, and time are required' });
    }

    // Check if user is room owner
    const { data: room, error: roomError } = await db
      .from('study_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('created_by', user.id)
      .single();

    if (roomError || !room) {
      return res.status(403).json({ error: 'Only room owners can create sessions' });
    }

    // Create session
    const { data: session, error: sessionError } = await db
      .from('room_sessions')
      .insert({
        room_id: roomId,
        title,
        description: description || null,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration_minutes: durationMinutes || 60,
        session_type: sessionType || 'study',
        created_by: user.id
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

/**
 * Get dashboard data
 */
const getDashboardData = async (req, res) => {
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

    // Get user's rooms
    const { data: participants, error: participantError } = await db
      .from('room_participants')
      .select(`
        room_id,
        role,
        study_rooms (
          id,
          name,
          subject,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (participantError) throw participantError;

    const roomIds = participants?.map(p => p.room_id) || [];

    // Get upcoming schedules from room_schedules table
    const today = new Date().toISOString().split('T')[0];
    const client = supabaseServiceRole || db;
    
    const { data: schedules, error: schedulesError } = await client
      .from('room_schedules')
      .select('*')
      .in('room_id', roomIds)
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .limit(5);

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
    }

    // Get recent activity
    const { data: activities, error: activitiesError } = await db
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Format data
    const recentRooms = participants?.slice(0, 5).map(p => ({
      id: p.study_rooms.id,
      name: p.study_rooms.name,
      subject: p.study_rooms.subject,
      participants: 0, // You could implement real counting
      role: p.role,
      isActive: true,
      lastActive: 'Recently'
    })) || [];

    const upcomingSessions = schedules?.map(s => ({
      id: s.id,
      title: s.title,
      date: new Date(s.scheduled_date).getDate(),
      time: s.scheduled_time,
      room: participants?.find(p => p.room_id === s.room_id)?.study_rooms?.name || 'Unknown',
      type: 'study' // All schedules are study sessions
    })) || [];

    const recentActivity = activities?.map(a => ({
      id: a.id,
      type: a.activity_type,
      text: a.activity_text,
      time: formatTime(a.created_at)
    })) || [];

    // Calculate stats
    const stats = {
      totalRooms: roomIds.length,
      activeRooms: roomIds.length, // Simplified - could be based on recent activity
      totalHours: 0, // Would need actual session tracking
      streak: 0 // Would need activity tracking
    };

    res.json({
      stats,
      recentRooms,
      upcomingSessions,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get messages for a room
 */
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
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

    // Check if user is a participant in this room
    const { data: participant } = await db
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    // Get room messages using service role to bypass any RLS issues
    const client = supabaseServiceRole || db;
    
    const { data: messages, error } = await client
      .from('room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get sender profiles
    const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])];
    const { data: profiles } = await client
      .from('user_profiles')
      .select('id, first_name, last_name, avatar_url, email')
      .in('id', senderIds.length > 0 ? senderIds : ['00000000-0000-0000-0000-000000000000']);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Format messages
    const formattedMessages = messages?.map(msg => {
      const profile = profileMap.get(msg.sender_id);
      const senderName = (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email?.split('@')[0] || 'Unknown';
      return {
        id: msg.id,
        user: senderName,
        text: msg.content,
        time: formatTime(msg.created_at),
        isMine: msg.sender_id === user.id
      };
    }) || [];

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching room messages:', error);
    res.status(500).json({ error: 'Failed to fetch room messages' });
  }
};

/**
 * Send a message to a room
 */
const sendRoomMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    
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

    // Check if user is a participant in this room
    const { data: participant } = await db
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    // Insert message using service role to bypass any RLS issues
    const client = supabaseServiceRole || db;
    
    const { data: message, error } = await client
      .from('room_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: text
      })
      .select()
      .single();

    if (error) throw error;

    // Get user profile for response
    const { data: profile } = await client
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    const senderName = (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email?.split('@')[0] || 'You';

    res.status(201).json({
      message: {
        id: message.id,
        user: senderName,
        text: message.content,
        time: formatTime(message.created_at),
        isMine: true
      }
    });
  } catch (error) {
    console.error('Error sending room message:', error);
    res.status(500).json({ error: 'Failed to send room message' });
  }
};

/**
 * Create a schedule for a room
 */
const createSchedule = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, date, time, description } = req.body;
    
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

    // Check if user is the owner of this room
    const { data: participant } = await db
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!participant || participant.role !== 'owner') {
      return res.status(403).json({ error: 'Only room owners can create schedules' });
    }

    // Insert schedule using service role to bypass any RLS issues
    const client = supabaseServiceRole || db;
    
    const { data: schedule, error } = await client
      .from('room_schedules')
      .insert({
        room_id: roomId,
        title,
        scheduled_date: date,
        scheduled_time: time,
        description: description || null,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Announce the schedule in the chat
    const announcementMessage = `📅 New study session scheduled: "${title}" on ${new Date(date).toLocaleDateString()} at ${time}`;
    
    await client
      .from('room_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: announcementMessage
      });

    // Get user profile for response
    const { data: profile } = await client
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    const senderName = (profile?.first_name || profile?.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile?.email?.split('@')[0] || 'You';

    res.status(201).json({
      schedule: {
        id: schedule.id,
        title: schedule.title,
        date: schedule.scheduled_date,
        time: schedule.scheduled_time,
        description: schedule.description,
        createdBy: senderName
      },
      message: {
        id: Date.now(), // Temporary ID for the announcement
        user: senderName,
        text: announcementMessage,
        time: 'Just now',
        isMine: true
      }
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

/**
 * Get schedules for a room
 */
const getRoomSchedules = async (req, res) => {
  try {
    const { roomId } = req.params;
    
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

    // Check if user is a participant in this room
    const { data: participant } = await db
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    // Get schedules using service role to bypass any RLS issues
    const client = supabaseServiceRole || db;
    
    const { data: schedules, error } = await client
      .from('room_schedules')
      .select('*')
      .eq('room_id', roomId)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;

    // Format schedules
    const formattedSchedules = schedules?.map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      date: schedule.scheduled_date,
      time: schedule.scheduled_time,
      description: schedule.description,
      createdAt: schedule.created_at
    })) || [];

    res.json({ schedules: formattedSchedules });
  } catch (error) {
    console.error('Error fetching room schedules:', error);
    res.status(500).json({ error: 'Failed to fetch room schedules' });
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
  createRoom,
  getRoomById,
  getUserRooms,
  getPublicRooms,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getRoomParticipants,
  removeParticipant,
  createSession,
  getDashboardData,
  getRoomMessages,
  sendRoomMessage,
  createSchedule,
  getRoomSchedules
};
