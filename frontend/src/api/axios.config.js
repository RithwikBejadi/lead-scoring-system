/**
 * FILE: api/axios.config.js
 * PURPOSE: Axios instance with request/response interceptors
 */

import axios from "axios";
import { API_URL } from "../config";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - signal React Router to navigate to login
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");
      if (!isAuthEndpoint) {
        localStorage.removeItem("authToken");
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    }

    return Promise.reject(error);
  },
);

export default api;
