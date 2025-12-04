import { createServer } from 'http';
import dotenv from 'dotenv';
import app from './src/app.js';
import pool from './src/config/database.js';
import { initializeSocketIO } from './src/config/socket.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io with handlers
const io = initializeSocketIO(httpServer, CORS_ORIGIN);

// Make io accessible to routes if needed
app.set('io', io);

// Test database connection before starting server
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('✗ Failed to connect to database:', err);
    process.exit(1);
  }

  console.log('✓ Database connection verified');

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Socket.io ready for connections`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

export { io };
