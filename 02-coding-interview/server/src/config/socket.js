import { Server } from 'socket.io';
import { setupSocketHandlers } from '../socket/handlers.js';

/**
 * Initialize Socket.io server
 * @param {http.Server} httpServer
 * @param {string} corsOrigin
 * @returns {Server}
 */
export function initializeSocketIO(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    // Transport options
    transports: ['websocket', 'polling'],
    // Allow upgrades from polling to websocket
    allowUpgrades: true,
    // Maximum HTTP buffer size
    maxHttpBufferSize: 1e6, // 1 MB
  });

  // Setup all event handlers
  setupSocketHandlers(io);

  return io;
}
