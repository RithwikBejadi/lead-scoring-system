/**
 * FILE: api/leaderboard.api.js
 * PURPOSE: Leaderboard and analytics API client
 */

import api from "./axios.config";

export const leaderboardApi = {
  /**
   * Get top leads by score
   */
  getTopLeads: async (limit = 10) => {
    const response = await api.get("/leaderboard", { params: { limit } });
    return response.data;
  },

  /**
   * Get leads grouped by stage
   */
  getByStage: async () => {
    const response = await api.get("/leaderboard/by-stage");
    return response.data;
  },

  /**
   * Get dashboard analytics
   */
  getDashboardStats: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },
};

export default leaderboardApi;
