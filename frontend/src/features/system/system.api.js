/**
 * system.api.js — Infrastructure metrics and admin endpoints.
 */
import api from "../../api/axios.config";

export const systemApi = {
  // General health check
  health: async () => {
    const response = await api.get("/health");
    return response.data;
  },

  // Admin: queue stats, worker health, failed jobs
  getQueueStats: async () => {
    const response = await api.get("/admin/queue");
    return response.data;
  },

  getFailedJobs: async (params = {}) => {
    const response = await api.get("/admin/failed-jobs", { params });
    return response.data;
  },

  retryJob: async (jobId) => {
    const response = await api.post(`/admin/failed-jobs/${jobId}/retry`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get("/analytics", { params });
    return response.data;
  },

  getThroughput: async (params = {}) => {
    const response = await api.get("/analytics/throughput", { params });
    return response.data;
  },
};
