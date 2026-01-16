import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const leaderboardApi = {
  // Get top leads
  getTopLeads: async (limit = 10) => {
    const response = await api.get('/leads/leaderboard', { params: { limit } });
    return response.data;
  }
};
