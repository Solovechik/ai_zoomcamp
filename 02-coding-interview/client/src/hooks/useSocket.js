import { useState, useEffect, useCallback } from 'react';
import { initializeSocket, getSocket, disconnectSocket } from '../services/socket';

function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = initializeSocket();
    setSocket(socketInstance);

    // Set up connection status listeners
    const handleConnect = () => {
      console.log('✓ Socket connected');
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log('✗ Socket disconnected');
      setConnected(false);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    // Set initial connection state
    setConnected(socketInstance.connected);

    // Cleanup on unmount
    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      // Don't disconnect here, let the socket persist across components
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }, [socket, connected]);

  const on = useCallback((event, handler) => {
    if (socket) {
      socket.on(event, handler);
    }
  }, [socket]);

  const off = useCallback((event, handler) => {
    if (socket) {
      socket.off(event, handler);
    }
  }, [socket]);

  return {
    socket,
    connected,
    emit,
    on,
    off
  };
}

export default useSocket;
