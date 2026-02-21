/**
 * FILE: api/events.api.js
 * PURPOSE: Event ingestion API client
 */

import api from "./axios.config";

export const eventsApi = {
  /**
   * Create single event
   */
  create: async (eventData) => {
    const response = await api.post("/events", eventData);
    return response.data;
  },

  /**
   * Create multiple events in batch
   */
  createBatch: async (events) => {
    const response = await api.post("/events/batch", { events });
    return response.data;
  },

  /**
   * Get events list with filtering
   */
  getAll: async (params = {}) => {
    const response = await api.get("/events", { params });
    return response.data;
  },
};

export default eventsApi;
