require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

const app = express();

//  CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:5173', // Alternative
    process.env.FRONTEND_URL // Fallback
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests, please try again later'
});
app.use(limiter);

// Database Connection with Better Error Handling
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000, // Valid option (30 seconds)
  idleTimeout: 60000, // Valid option (60 seconds)
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: true 
  } : false
});
// Improved Password Generation Endpoint
app.get('/generate-password', async (req, res) => {
  const length = parseInt(req.query.length) || 12;

  // Enhanced Validation
  if (isNaN(length) || length < 8 || length > 20) {
    return res.status(400).json({ 
      error: 'Password length must be a number between 8 and 20' 
    });
  }

  try {
    // 1. Verify Python is available
    try {
      await new Promise((resolve, reject) => {
        exec('python3 --version', (error) => {
          error ? reject(new Error('Python not found')) : resolve();
        });
      });
    } catch (pyError) {
      return res.status(500).json({ 
        error: 'Python requirement not satisfied',
        details: process.env.NODE_ENV === 'development' ? pyError.message : null
      });
    }

    // 2. Execute Python script with timeout
    const pythonScript = path.resolve(__dirname, 'generate_password.py');
    const password = await new Promise((resolve, reject) => {
      const child = exec(
        `python3 ${pythonScript} ${length}`,
        { timeout: 5000 }, // 5 second timeout
        (error, stdout, stderr) => {
          if (error) {
            if (error.killed) reject(new Error('Python script timed out'));
            else reject(error);
          } else if (stderr) reject(new Error(stderr));
          else resolve(stdout.trim());
        }
      );
    });

    // 3. Hash and store password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    try {
      await pool.execute(
        `INSERT INTO generated_passwords (user_id, password_hash) VALUES (?, ?)`,
        [1, hashedPassword]
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if storage fails - the user still gets their password
    }

    // 4. Return response
    res.json({ 
      success: true,
      password,
      warning: 'This password will never be shown again. Save it immediately.'
    });

  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ 
      error: 'Password generation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

// Enhanced Health Check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      python: await checkPython(),
      database: true
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: err.message 
    });
  }
});

async function checkPython() {
  return new Promise((resolve) => {
    exec('python3 --version', (error) => {
      resolve(!error);
    });
  });
}

// Start Server with Error Handling
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});