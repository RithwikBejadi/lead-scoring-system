// API configuration - automatically detects environment
export const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:4000/api' 
    : 'https://lead-scoring-api-f8x4.onrender.com/api');

export default API_URL;
