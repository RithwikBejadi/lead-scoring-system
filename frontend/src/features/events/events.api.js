import api from "../../shared/api/axios.js";

export const eventsApi = {
  /** GET /api/events — list recent raw events */
  list: async (params = {}) => {
    const r = await api.get("/events", { params });
    return r.data;
  },

  /** GET /api/events/:id — single event */
  getById: async (id) => {
    const r = await api.get(`/events/${id}`);
    return r.data;
  },

  /** GET /api/leads/:leadId/timeline — session timeline for a lead */
  getSession: async (leadId) => {
    const r = await api.get(`/leads/${leadId}/timeline`);
    return r.data;
  },

  /** POST /api/events/ingest — push a new event */
  ingest: async (payload) => {
    const r = await api.post("/events/ingest", payload);
    return r.data;
  },
};
