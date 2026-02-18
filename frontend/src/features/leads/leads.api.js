/**
 * leads.api.js — Lead profiles and identity resolution.
 */
import api from "../../api/axios.config";

export const leadsApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/leads", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  getScoreHistory: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/history`);
    return response.data;
  },

  getIntelligence: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/intelligence`);
    return response.data;
  },
};
