import axios from 'axios';
import API_URL from './config';

export const api = {
  // Leads
  getLeads: () => axios.get(`${API_URL}/leads`),
  getLead: (id) => axios.get(`${API_URL}/leads/${id}`),
  createLead: (data) => axios.post(`${API_URL}/leads`, data),
  getLeadIntelligence: (id) => axios.get(`${API_URL}/leads/${id}/intelligence`),
  getLeadHistory: (id) => axios.get(`${API_URL}/leads/${id}/history`),
  
  // Events
  createEvent: (data) => axios.post(`${API_URL}/events`, data),
  
  // Leaderboard
  getLeaderboard: () => axios.get(`${API_URL}/leaderboard`),
};
