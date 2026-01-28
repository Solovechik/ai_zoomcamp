import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { testConnection } from './src/config/database.js';

const PORT = process.env.PORT || 3001;

async function start() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('Warning: Database connection failed. Some features may not work.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

start().catch(console.error);
