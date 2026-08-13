const supabase = require('../config/supabase');

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

module.exports = {
  signup,
  login
};
