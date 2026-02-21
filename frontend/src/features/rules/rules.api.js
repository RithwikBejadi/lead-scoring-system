import api from "../../shared/api/axios.js";

export const rulesApi = {
  getAll: async () => {
    const r = await api.get("/rules");
    return r.data;
  },
  getById: async (id) => {
    const r = await api.get(`/rules/${id}`);
    return r.data;
  },
  create: async (payload) => {
    const r = await api.post("/rules", payload);
    return r.data;
  },
  update: async (id, payload) => {
    const r = await api.put(`/rules/${id}`, payload);
    return r.data;
  },
  delete: async (id) => {
    const r = await api.delete(`/rules/${id}`);
    return r.data;
  },
  /** Simulate: given event type and current score, return new score delta */
  simulate: async (payload) => {
    const r = await api.post("/rules/simulate", payload);
    return r.data;
  },
};
