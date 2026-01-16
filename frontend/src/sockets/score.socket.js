import { io } from 'socket.io-client';
import { API_URL } from '../config';

// Extract base URL without /api suffix for socket connection
const SOCKET_URL = API_URL.replace('/api', '');

let socket = null;

export const scoreSocket = {
  // Initialize socket connection
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected to score updates');
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Disconnected from score updates');
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
      });
    }
    return socket;
  },

  // Subscribe to score updates
  onScoreUpdate: (callback) => {
    if (!socket) scoreSocket.connect();
    socket.on('score_updated', callback);
  },

  // Unsubscribe from score updates
  offScoreUpdate: (callback) => {
    if (socket) {
      socket.off('score_updated', callback);
    }
  },

  // Disconnect socket
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
};
