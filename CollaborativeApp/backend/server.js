require('dotenv').config();
const express = require('express');
const authController = require('./controllers/authController');
const app = express();
const port = process.env.PORT || 4002;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
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

// Auth routes
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
