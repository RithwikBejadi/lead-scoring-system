import api from "./axios.config";

export const eventsApi = {
  create: async (eventData) => {
    const response = await api.post("/events", eventData);
    return response.data;
  },

  getByLead: async (leadId) => {
    const response = await api.get("/events", { params: { leadId } });
    return response.data;
  },
};
