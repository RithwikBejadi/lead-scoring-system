/**
 * rules.api.js — Scoring rules CRUD + simulation.
 */
import api from "../../api/axios.config";

export const rulesApi = {
  getAll: async () => {
    const response = await api.get("/rules");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/rules", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/rules/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/rules/${id}`);
    return response.data;
  },

  // Simulate: POST a sample event body, get score delta back
  simulate: async (eventBody) => {
    const response = await api.post("/rules/simulate", eventBody);
    return response.data;
  },
};
