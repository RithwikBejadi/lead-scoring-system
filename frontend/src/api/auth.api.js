/**
 * FILE: api/auth.api.js
 * PURPOSE: Authentication API client
 */

import api from "./axios.config";

export const authApi = {
  /**
   * Register new user with email/password
   */
  register: async ({ email, password, name }) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  },

  /**
   * Login with email/password
   */
  login: async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  /**
   * Google OAuth authentication
   */
  googleAuth: async (idToken) => {
    const response = await api.post("/auth/google", { idToken });
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Generate API key for webhook integrations
   */
  generateApiKey: async () => {
    const response = await api.post("/auth/generate-api-key");
    return response.data;
  },
};

export default authApi;
