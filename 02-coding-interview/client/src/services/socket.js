import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

let socket = null;

/**
 * Initialize Socket.io connection
 * @returns {Socket} Socket.io client instance
 */
export function initializeSocket() {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✓ Socket.io connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('✗ Socket.io disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket.io error:', error);
  });

  return socket;
}

/**
 * Get the current socket instance
 * @returns {Socket|null}
 */
export function getSocket() {
  return socket;
}

/**
 * Disconnect the socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default { initializeSocket, getSocket, disconnectSocket };
