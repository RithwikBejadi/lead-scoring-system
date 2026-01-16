import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const leadsApi = {
  // Get all leads with optional filtering
  getAll: async (params = {}) => {
    const response = await api.get("/leads", { params });
    return response.data;
  },

  // Get single lead by ID
  getById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Create new lead
  create: async (leadData) => {
    const response = await api.post("/leads", leadData);
    return response.data;
  },

  // Get lead's score history
  getScoreHistory: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/history`);
    return response.data;
  },

  // Export leads as CSV - triggers download
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
