/**
 * FILE: config.js
 * PURPOSE: Environment configuration for API and WebSocket URLs
 */

// API configuration - automatically detects environment
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://lead-scoring-api-f8x4.onrender.com/api");

export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://lead-scoring-api-f8x4.onrender.com");

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default API_URL;
