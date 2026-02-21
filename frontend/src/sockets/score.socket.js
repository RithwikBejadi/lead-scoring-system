import { io } from 'socket.io-client';
import { API_URL } from '../config';

// Extract base URL without /api suffix for socket connection
const SOCKET_URL = API_URL.replace('/api', '');

let socket = null;

function createSocket() {
  const token = localStorage.getItem('authToken');
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: token ? { token } : undefined,
  });
}

export const scoreSocket = {
  // Initialize socket connection (reads token fresh from localStorage)
  connect: () => {
    if (!socket) {
      socket = createSocket();

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

  // Disconnect and reconnect with fresh token (call after login/logout)
  reconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    socket = createSocket();
    socket.on('connect', () => console.log('[Socket] Reconnected with new auth'));
    socket.on('disconnect', () => console.log('[Socket] Disconnected from score updates'));
    socket.on('connect_error', (err) => console.error('[Socket] Connection error:', err));
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
