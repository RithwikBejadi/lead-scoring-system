/**
 * FILE: sockets/socket.js
 * PURPOSE: Socket.IO client configuration for real-time updates
 */

import { io } from "socket.io-client";
import { WS_URL } from "../config";

let socket = null;

/**
 * Initialize Socket.IO connection
 */
export const initSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem("authToken");

  socket = io(WS_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket.IO disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error);
  });

  return socket;
};

/**
 * Get existing socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Reconnect socket with the latest token from localStorage.
 * Call this after a successful login to re-authenticate the socket.
 */
export const reconnectSocket = () => {
  disconnectSocket();
  return initSocket();
};

/**
 * Subscribe to lead updates
 */
export const subscribeToLeadUpdates = (callback) => {
  const sock = getSocket();
  sock.on("leadUpdated", callback);
  return () => sock.off("leadUpdated", callback);
};

/**
 * Subscribe to score mutations
 */
export const subscribeToScoreMutations = (callback) => {
  const sock = getSocket();
  sock.on("scoreMutation", callback);
  return () => sock.off("scoreMutation", callback);
};

/**
 * Subscribe to automation executions
 */
export const subscribeToAutomations = (callback) => {
  const sock = getSocket();
  sock.on("automationExecuted", callback);
  return () => sock.off("automationExecuted", callback);
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  subscribeToLeadUpdates,
  subscribeToScoreMutations,
  subscribeToAutomations,
};
