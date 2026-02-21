/**
 * FILE: api/analytics.api.js
 * PURPOSE: Analytics API client for dashboard statistics
 */

import api from "./axios.config";

export const analyticsApi = {
  /**
   * Get overall dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },

  /**
   * Get throughput data over time
   */
  getThroughputData: async (hours = 24) => {
    const response = await api.get("/analytics/throughput", {
      params: { hours },
    });
    return response.data;
  },

  /**
   * Get queue health metrics
   */
  getQueueHealth: async () => {
    const response = await api.get("/analytics/queue-health");
    return response.data;
  },

  /**
   * Get recent score mutations
   */
  getScoreMutations: async (limit = 10) => {
    const response = await api.get("/analytics/score-mutations", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get automation logs
   */
  getAutomationLogs: async (limit = 20) => {
    const response = await api.get("/analytics/automation-logs", {
      params: { limit },
    });
    return response.data;
  },
};

export default analyticsApi;
