/**
 * events.api.js — Event stream and session endpoints.
 */
import api from "../../api/axios.config";

export const eventsApi = {
  // List events with filters
  getAll: async (params = {}) => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  // Get single event
  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Get full session timeline
  getSession: async (sessionId) => {
    const response = await api.get(`/events/session/${sessionId}`);
    return response.data;
  },

  // Get recent events (for live feed)
  getRecent: async (limit = 50) => {
    const response = await api.get("/events", { params: { limit, sort: "-createdAt" } });
    return response.data;
  },

  // Create manual event (for testing)
  create: async (eventData) => {
    const response = await api.post("/events", eventData);
    return response.data;
  },

  // Get by lead
  getByLead: async (leadId, params = {}) => {
    const response = await api.get("/events", { params: { leadId, ...params } });
    return response.data;
  },
};
