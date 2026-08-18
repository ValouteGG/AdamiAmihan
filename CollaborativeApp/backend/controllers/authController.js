const supabase = require('../config/supabase');
const { supabaseServiceRole } = require('../config/supabase');

/**
 * Helper function to create or update user profile
 */
const createOrUpdateUserProfile = async (user) => {
  try {
    const { id, email, user_metadata } = user;
    
    // Extract name from metadata or email
    const firstName = user_metadata?.first_name || user_metadata?.name?.split(' ')[0] || email?.split('@')[0] || '';
    const lastName = user_metadata?.last_name || user_metadata?.name?.split(' ').slice(1).join(' ') || '';
    const avatarUrl = user_metadata?.avatar_url || user_metadata?.picture || '';
    
    console.log('Creating/updating user profile:', { id, firstName, lastName, avatarUrl });
    
    // Use service role client to bypass RLS
    const client = supabaseServiceRole || supabase;
    
    // Check if profile exists
    const { data: existingProfile } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await client
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating user profile:', error);
      } else {
        console.log('User profile updated successfully');
      }
    } else {
      // Create new profile
      const { error } = await client
        .from('user_profiles')
        .insert({
          id: id,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          email: email,
          is_online: false
        });
      
      if (error) {
        console.error('Error creating user profile:', error);
      } else {
        console.log('User profile created successfully');
      }
    }
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error);
  }
};

/**
 * Update user profile manually
 */
const updateProfile = async (req, res) => {
  try {
    const { userId, firstName, lastName, avatarUrl } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Use service role client to bypass RLS
    const client = supabaseServiceRole || supabase;
    
    const { error } = await client
      .from('user_profiles')
      .upsert({
        id: userId,
        first_name: firstName || '',
        last_name: lastName || '',
        avatar_url: avatarUrl || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
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

    // Use service role client to bypass RLS
    const client = supabaseServiceRole || supabase;
    
    // Get user profile from database
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Return user metadata as fallback
      return res.json({
        profile: {
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          bio: '',
          timezone: 'UTC-5',
          language: 'en'
        }
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * Handle Google OAuth login URL generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const googleAuthUrl = async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
    
    console.log('Generating Google OAuth URL with redirect to:', `${frontendUrl}/#/auth/callback`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${frontendUrl}/#/auth/callback`,
        skipBrowserRedirect: false
      }
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return res.status(400).json({ 
        error: error.message,
        message: 'Failed to generate Google OAuth URL'
      });
    }

    console.log('Google OAuth URL generated successfully');
    res.status(200).json({
      url: data.url
    });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
};

/**
 * Handle user signup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    console.log('Signup request received:', { email, firstName, lastName });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        message: 'Please provide both email and password'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password too weak',
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log('Attempting Supabase signup...');
    console.log('Supabase URL being used:', process.env.SUPABASE_URL);
    console.log('Request payload:', { email, firstName, lastName, passwordLength: password.length });
    
    try {
      // Create user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          }
        }
      });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase signup error:', error);
        
        // Check if user already exists
        if (error.message === 'User already registered' || 
            error.message?.includes('already registered') ||
            error.message?.includes('already exists')) {
          return res.status(400).json({ 
            error: 'User already registered',
            message: 'This email is already registered. Please log in instead.'
          });
        }
        
        return res.status(400).json({ 
          error: error.message,
          message: 'Failed to create user account'
        });
      }

      if (!data.user) {
        console.error('No user data returned from Supabase');
        return res.status(400).json({ 
          error: 'No user data returned',
          message: 'Failed to create user account'
        });
      }

      // Return success response
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: firstName || '',
          lastName: lastName || '',
          created_at: data.user.created_at
        },
        session: data.session
      });
    } catch (supabaseError) {
      console.error('Supabase API call failed:', supabaseError);
      return res.status(500).json({ 
        error: 'Supabase connection error',
        message: 'Failed to connect to Supabase service',
        details: supabaseError.message
      });
    }

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred during signup'
    });
  }
};

/**
 * Handle user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        message: 'Please provide both email and password'
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ 
        error: error.message,
        message: 'Invalid email or password'
      });
    }

    // Create or update user profile
    await createOrUpdateUserProfile(data.user);

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name || '',
        lastName: data.user.user_metadata?.last_name || '',
      },
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred during login'
    });
  }
};

/**
 * Handle OAuth callback and user profile creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleOAuthCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Access token is required',
        message: 'No access token provided'
      });
    }

    // Get user from Supabase using the access token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('Error getting user from token:', error);
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Failed to get user information'
      });
    }

    // Create or update user profile
    await createOrUpdateUserProfile(user);

    // Return success response
    res.status(200).json({
      message: 'User profile created/updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || '',
        lastName: user.user_metadata?.last_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred during OAuth callback'
    });
  }
};

module.exports = {
  signup,
  login,
  googleAuthUrl,
  updateProfile,
  getUserProfile
};
