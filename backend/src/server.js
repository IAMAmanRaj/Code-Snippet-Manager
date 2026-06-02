const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const snippetRoutes = require('./routes/snippetRoutes');
const Snippet = require('./models/Snippet');

const app = express();

// CORS configuration - read allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000']; // Default dev origins

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' || process.env.VERCEL !== '1') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Health check (before other routes)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/snippets', snippetRoutes);

// Error handling middleware - must have 4 parameters
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error', 
      error: err.message 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'Invalid ID format', 
      error: err.message 
    });
  }

  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Invalid JSON',
      error: 'The request body contains invalid JSON'
    });
  }

  res.status(err.status || 500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snippet-manager';

async function initializeIndexes() {
  try {
    // Try to create indexes, if there's a conflict, drop and recreate
    // In Mongoose 6+, use createIndexes() instead of ensureIndexes()
    await Snippet.createIndexes();
    console.log('Database indexes initialized');
  } catch (error) {
    if (error.code === 85 || error.code === 86) {
      // Index conflict - drop and recreate
      console.log('Index conflict detected, recreating indexes...');
      try {
        await Snippet.collection.dropIndexes();
        await Snippet.createIndexes();
        console.log('Indexes recreated successfully');
      } catch (dropError) {
        console.error('Error recreating indexes:', dropError.message);
      }
    } else {
      console.error('Error initializing indexes:', error.message);
    }
  }
}

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      
      // Initialize indexes
      await initializeIndexes();
      
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
  });
} else {
  // For Vercel serverless, connect to MongoDB and initialize indexes
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB (Vercel)');
      await initializeIndexes();
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
}

// Export app for Vercel serverless functions
module.exports = app;