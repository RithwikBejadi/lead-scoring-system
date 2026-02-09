import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const leaderboardApi = {
  // Get top leads from leaderboard
  getTopLeads: async (limit = 10, offset = 0) => {
    const response = await api.get('/leaderboard', { 
      params: { limit, offset } 
    });
    return response.data;
  }
};
