import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const leadsApi = {
  // Get all leads with optional filtering
  getAll: async (params = {}) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  // Get single lead by ID
  getById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Create new lead
  create: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  // Get lead's score history
  getScoreHistory: async (leadId) => {
    const response = await api.get(`/scores/history/${leadId}`);
    return response.data;
  }
};
