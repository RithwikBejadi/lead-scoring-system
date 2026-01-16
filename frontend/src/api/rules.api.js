import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const rulesApi = {
  // Get all scoring rules
  getAll: async () => {
    const response = await api.get("/rules");
    return response.data;
  },

  // Create a new rule
  create: async (ruleData) => {
    const response = await api.post("/rules", ruleData);
    return response.data;
  },

  // Update a rule
  update: async (id, ruleData) => {
    const response = await api.put(`/rules/${id}`, ruleData);
    return response.data;
  },

  // Delete a rule
  delete: async (id) => {
    const response = await api.delete(`/rules/${id}`);
    return response.data;
  },
};
