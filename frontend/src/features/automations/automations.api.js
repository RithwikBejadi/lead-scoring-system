/**
 * automations.api.js — Webhook/automation management.
 */
import api from "../../api/axios.config";

export const automationsApi = {
  getAll: async () => {
    const response = await api.get("/webhooks");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/webhooks/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/webhooks", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/webhooks/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/webhooks/${id}`);
    return response.data;
  },

  // Test fire a webhook
  test: async (id) => {
    const response = await api.post(`/webhooks/${id}/test`);
    return response.data;
  },
};
