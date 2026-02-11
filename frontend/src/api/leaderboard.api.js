import api from "./axios.config";

export const leaderboardApi = {
  // Get top leads from leaderboard
  getTopLeads: async (limit = 10, offset = 0) => {
    const response = await api.get("/leaderboard", {
      params: { limit, offset },
    });
    return response.data;
  },
};
