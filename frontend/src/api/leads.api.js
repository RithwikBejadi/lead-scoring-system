/**
 * FILE: api/leads.api.js
 * PURPOSE: Lead management API client
 */

import api from "./axios.config";

export const leadsApi = {
  /**
   * Get all leads with optional filtering
   */
  getAll: async (params = {}) => {
    const response = await api.get("/leads", { params });
    return response.data;
  },

  /**
   * Get single lead by ID
   */
  getById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  /**
   * Create new lead
   */
  create: async (leadData) => {
    const response = await api.post("/leads", leadData);
    return response.data;
  },

  /**
   * Update lead information
   */
  update: async (id, leadData) => {
    const response = await api.put(`/leads/${id}`, leadData);
    return response.data;
  },

  /**
   * Delete lead
   */
  delete: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  /**
   * Get lead's activity timeline
   */
  getTimeline: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/timeline`);
    return response.data;
  },

  /**
   * Get lead's score history
   */
  getScoreHistory: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/history`);
    return response.data;
  },

  /**
   * Get lead intelligence metrics
   */
  getIntelligence: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/intelligence`);
    return response.data;
  },

  /**
   * Export leads as CSV
   */
  exportCSV: async () => {
    const response = await api.get("/leads/export", {
      responseType: "blob",
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads-export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default leadsApi;
