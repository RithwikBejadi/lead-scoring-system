/**
 * SocketProvider — manages a single socket.io connection, shared app-wide.
 * Components subscribe to events via useSocket() hook.
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../../config";

const SocketContext = createContext(null);

const SOCKET_URL = API_URL.replace("/api", "");

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      auth: { token },
    });

    socketRef.current.on("connect", () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
