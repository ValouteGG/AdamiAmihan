require('dotenv').config();
const express = require('express');
const authController = require('./controllers/authController');
const app = express();
const port = process.env.PORT || 4002;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
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

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
