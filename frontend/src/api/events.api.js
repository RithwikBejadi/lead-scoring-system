import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const eventsApi = {
  create: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  getByLead: async (leadId) => {
    const response = await api.get('/events', { params: { leadId } });
    return response.data;
  }
};
